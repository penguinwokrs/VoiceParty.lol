import { Hono } from "hono";
import { callRealtimeKit, getActiveParticipantCount } from "../_lib/realtime";
import {
	getAccountByRiotId,
	getProfileIconUrl,
	getSummonerByPuuid,
} from "../_lib/riot";
import type { Bindings, Session } from "../_types";

const app = new Hono<{ Bindings: Bindings }>();

// Max concurrent participants per room.
const MAX_USERS = 5;

// Auto-expire KV entries so abandoned rooms clean themselves up (nobody removes
// users on tab close). Refreshed on every join, so active rooms never expire.
const SESSION_TTL_SECONDS = 6 * 60 * 60; // 6 hours
const KV_TTL = { expirationTtl: SESSION_TTL_SECONDS };

app.post("/", async (c) => {
	const sessionId = crypto.randomUUID();

	let meetingId: string | undefined;

	const useMock = c.env.USE_MOCK_REALTIME === "true";

	if (useMock) {
		console.log("[Mock Mode] Skipping RealtimeKit meet creation");
		meetingId = "mock-meeting-id";
	} else {
		try {
			// Create a meeting in RealtimeKit
			// Note: Actual API payload structure might vary, assuming minimal or default
			// biome-ignore lint/suspicious/noExplicitAny: API response is untyped
			const meeting: any = await callRealtimeKit("/meetings", "POST", c.env, {
				title: sessionId,
			});
			console.log("RealtimeKit Meeting Created:", meeting);
			meetingId = meeting.data.id;
		} catch (e) {
			console.error("Failed to create RealtimeKit meeting:", e);
			// Fallback for development/missing keys
			console.warn("Using MOCK session due to API failure");
			meetingId = "mock-meeting-id";
		}
	}

	const session: Session = {
		sessionId,
		meetingId,
		users: [],
		createdAt: Date.now(),
	};

	// Save mapping: game:{gameId} -> meetingId
	if (meetingId) {
		await c.env.VC_SESSIONS.put(`game:${sessionId}`, meetingId, KV_TTL);
		await c.env.VC_SESSIONS.put(
			`session:${meetingId}`,
			JSON.stringify(session),
			KV_TTL,
		);
	} else {
		// Should not happen with current logic, but safe fallback
		await c.env.VC_SESSIONS.put(
			`session:${sessionId}`,
			JSON.stringify(session),
			KV_TTL,
		);
	}

	return c.json(session);
});

app.post("/:id/join", async (c) => {
	const sessionId = c.req.param("id");
	const { summonerId, iconUrl } = await c.req.json<{
		summonerId: string;
		iconUrl?: string;
	}>();

	if (!summonerId) {
		return c.text("Summoner ID is required", 400);
	}

	if (summonerId.length > 32) {
		return c.text("Summoner ID is too long (max 32 chars)", 400);
	}

	// Validate Summoner ID via Riot API
	// 1. Check if API Key exists (and validation is not disabled)
	const apiKey = c.env.RIOT_GAME_API_KEY;
	const validationDisabled = c.env.RIOT_VALIDATION_ENABLED === "false";
	let validIconUrl = iconUrl;

	if (validationDisabled) {
		console.warn(
			"[Join] Riot validation disabled; accepting SummonerID without lookup",
		);
	} else if (apiKey) {
		// Strict validation requested
		console.log(`[Join] Validating SummonerID: ${summonerId}`);
		const account = await getAccountByRiotId(summonerId, apiKey);

		if (!account) {
			return c.text("Summoner not found (Riot ID invalid)", 404);
		}

		console.log(`[Join] Found Account: ${account.gameName}#${account.tagLine}`);

		// 2. Fetch Summoner to get Icon
		const summoner = await getSummonerByPuuid(account.puuid, apiKey);
		if (summoner) {
			validIconUrl = await getProfileIconUrl(summoner.profileIconId);
			console.log(`[Join] Fetched Icon URL: ${validIconUrl}`);
		} else {
			console.warn("[Join] Could not fetch summoner details for icon");
		}
	} else {
		console.warn("[Join] RIOT_GAME_API_KEY missing, skipping validation");
	}

	// Try fetching existing session via Mapping
	const mapping = await c.env.VC_SESSIONS.get(`game:${sessionId}`);

	let meetingId = mapping;

	// Validate meetingId compatibility with current mode
	const useMock = c.env.USE_MOCK_REALTIME === "true";
	if (meetingId && !useMock && meetingId.startsWith("mock-")) {
		console.warn(
			`[Real Mode] Found mock ID (${meetingId}) for game ${sessionId}. Ignoring and creating new real meeting.`,
		);
		meetingId = null;
	}
	let sessionData: string | null = null;

	if (meetingId) {
		sessionData = await c.env.VC_SESSIONS.get(`session:${meetingId}`);
	}

	let session: Session;

	if (sessionData && meetingId) {
		session = JSON.parse(sessionData);
		// Ensure session object uses the validated meetingId (in case it was reset from mock to real)
		if (session.meetingId !== meetingId) {
			console.log("Updating session meetingId to match validated ID");
			session.meetingId = meetingId;
		}
	} else {
		// CREATE NEW SESSION (Game ID Room) or RE-CREATE if mock ID was discarded
		console.log(`Creating new session for Game ID: ${sessionId}`);

		const useMock = c.env.USE_MOCK_REALTIME === "true";

		if (useMock) {
			console.log("[Mock Mode] Skipping RealtimeKit meet creation");
			meetingId = `mock-meeting-${sessionId}`; // Unique mock ID
		} else {
			try {
				// Create a meeting in RealtimeKit with Game ID as name/title
				// biome-ignore lint/suspicious/noExplicitAny: API response is untyped
				const meeting: any = await callRealtimeKit("/meetings", "POST", c.env, {
					title: sessionId,
				});
				console.log("RealtimeKit Meeting Created:", meeting);
				meetingId = meeting.data.id;
			} catch (e) {
				console.error(
					"Failed to create RealtimeKit meeting (Create-on-Join):",
					e,
				);
				console.warn("Using MOCK session due to API failure");
				meetingId = `mock-meeting-${sessionId}`;
			}
		}

		if (!meetingId) {
			return c.text("Failed to generate meeting ID", 500);
		}

		session = {
			sessionId,
			meetingId,
			users: [],
			createdAt: Date.now(),
		};

		// Save mapping
		await c.env.VC_SESSIONS.put(`game:${sessionId}`, meetingId, KV_TTL);
	}

	// Check if user already exists
	const existingUser = session.users.find((u) => u.summonerId === summonerId);

	if (!existingUser) {
		// Capacity is based on who is ACTUALLY connected (RealtimeKit is the source
		// of truth for presence), not our append-only KV `users` list which never
		// prunes people who closed their tab. Fall back to the KV roster only when
		// the live count is unavailable, so we never wrongly reject a join.
		let occupancy = session.users.length;
		if (
			!useMock &&
			session.meetingId &&
			!session.meetingId.startsWith("mock-")
		) {
			const live = await getActiveParticipantCount(session.meetingId, c.env);
			if (live !== null) occupancy = live;
		}

		if (occupancy >= MAX_USERS) {
			return c.text(`Session is full (max ${MAX_USERS} users)`, 403);
		}

		session.users.push({
			summonerId,
			joinedAt: Date.now(),
			iconUrl: validIconUrl,
		});
		await c.env.VC_SESSIONS.put(
			`session:${session.meetingId}`, // Save to session:meetingId
			JSON.stringify(session),
			KV_TTL,
		);
	}

	// Generate RealtimeKit Token
	let realtimeToken: string | undefined;
	if (session.meetingId) {
		const useMock = c.env.USE_MOCK_REALTIME === "true";
		if (useMock) {
			console.log("[Mock Mode] Skipping RealtimeKit participant creation");
			realtimeToken = "mock-token";
		} else {
			try {
				// biome-ignore lint/suspicious/noExplicitAny: API response is untyped
				const participant: any = await callRealtimeKit(
					`/meetings/${session.meetingId}/participants`,
					"POST",
					c.env,
					{
						name: summonerId,
						custom_participant_id: summonerId,
						preset_name: "group_call_participant",
					},
				);
				console.log("RealtimeKit Participant:", participant);
				realtimeToken = participant.data.token; // Check actual response field
			} catch (e) {
				console.error("Failed to add participant to RealtimeKit:", e);
				// Fallback
				console.warn("Using MOCK token due to API failure");
				realtimeToken = "mock-token";
			}
		}
	}

	return c.json({
		session,
		realtime:
			session.meetingId && realtimeToken
				? {
						meetingId: session.meetingId,
						token: realtimeToken,
						appId: c.env.REALTIME_KIT_APP_ID,
					}
				: undefined,
	});
});

export default app;
