import { Hono } from "hono";
import {
	classifyVisitor,
	type FunnelEventInput,
	sanitizeLang,
	sanitizeRef,
	sanitizeSource,
	writeFunnelEvent,
} from "../_lib/analytics";
import { isBanned, maybeAutoBan } from "../_lib/moderation";
import { callRealtimeKit, getActiveParticipantCount } from "../_lib/realtime";
import { recordReport } from "../_lib/reports";
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

// User reports (moderation) are persisted in D1 with no expiry — see
// functions/api/_lib/reports.ts. Recency decay in the auto-ban aggregator, not
// a store TTL, is what stops old reports counting toward a ban.
const REPORT_REASONS = new Set([
	"harassment",
	"hate",
	"child_safety",
	"illegal",
	"cheating",
	"spam",
	"inappropriate_name",
	"other",
]);
// Reports flagging child safety are preserved for review and never fed into the
// automatic score (which could be weaponized for such a severe category).
const CHILD_SAFETY_REASON = "child_safety";
const MAX_NOTE_LENGTH = 280;

/** Attribution the client sends along with a create/join request. */
type Attribution = { src?: string; ref?: string; lang?: string };

/**
 * Attribution travels in the request body, not the URL: the app navigates to
 * the room path before joining and react-router drops the query string, so by
 * the time we are called the original ?src= is gone from the address bar. The
 * client holds it in memory and hands it back here.
 */
const funnelContext = (headers: Headers, body: Attribution) => ({
	src: sanitizeSource(body.src),
	ref: sanitizeRef(body.ref),
	lang: sanitizeLang(body.lang),
	country: headers.get("CF-IPCountry") ?? "XX",
	visitor: classifyVisitor(headers.get("User-Agent")),
});

/**
 * Fire a funnel write without delaying the response. `c.executionCtx` throws
 * when absent (unit tests), so probe it: in production the write runs under
 * waitUntil and this resolves immediately; in tests there is no execCtx so we
 * await the write, which lets assertions see the row. Mirrors the auto-ban
 * dispatch below. Awaiting this in prod costs one microtask, not the D1 write.
 */
// biome-ignore lint/suspicious/noExplicitAny: Hono context, only used for executionCtx
const recordFunnel = async (c: any, event: FunnelEventInput): Promise<void> => {
	const write = () => writeFunnelEvent(c.env, event);
	let execCtx: ExecutionContext | undefined;
	try {
		execCtx = c.executionCtx;
	} catch {
		execCtx = undefined;
	}
	if (execCtx) execCtx.waitUntil(write());
	else await write();
};

app.post("/", async (c) => {
	const sessionId = crypto.randomUUID();

	// Attribution is optional here and the endpoint has always accepted an empty
	// body, so a missing/!JSON body must stay a successful create.
	let attribution: Attribution = {};
	try {
		attribution = (await c.req.json<Attribution>()) ?? {};
	} catch {
		attribution = {};
	}

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

	await recordFunnel(c, {
		name: "room_created",
		...funnelContext(c.req.raw.headers, attribution),
		detail: "explicit",
	});

	return c.json(session);
});

app.post("/:id/join", async (c) => {
	const sessionId = c.req.param("id");
	const {
		summonerId,
		iconUrl,
		src,
		ref,
		lang: uiLang,
	} = await c.req.json<
		{
			summonerId: string;
			iconUrl?: string;
		} & Attribution
	>();

	if (!summonerId) {
		return c.text("Summoner ID is required", 400);
	}

	if (summonerId.length > 32) {
		return c.text("Summoner ID is too long (max 32 chars)", 400);
	}

	// Phase 3: reject users under an active moderation ban before doing any work.
	if (await isBanned(c.env, summonerId)) {
		return c.text(
			"This account is temporarily suspended due to user reports.",
			403,
		);
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
	// Which side of the funnel this join is: following someone's invite, or
	// minting the room yourself. The ratio between them is the host-conversion
	// number the post-call work is meant to move.
	//
	// Keyed off the ORIGINAL mapping, not the post-reset `meetingId`. A room
	// whose stale mock meeting had to be recreated (the mock/real branch above
	// nulls `meetingId`) still had someone share its ID — counting that as a
	// freshly minted room would inflate host conversion.
	const isNewRoom = !mapping;

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
	}

	// Persist the session and refresh the TTL on BOTH keys, unconditionally — so
	// an active room never expires, even when an existing participant rejoins
	// (which doesn't mutate the roster above) or when the mapping was created
	// hours ago. Both keys share the same lifetime this way.
	if (session.meetingId) {
		await c.env.VC_SESSIONS.put(`game:${sessionId}`, session.meetingId, KV_TTL);
		await c.env.VC_SESSIONS.put(
			`session:${session.meetingId}`,
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

	await recordFunnel(c, {
		name: "joined",
		...funnelContext(c.req.raw.headers, { src, ref, lang: uiLang }),
		detail: isNewRoom ? "new" : "existing",
	});

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

// Report a participant. Phase 1: record the report (pseudonymized) and let the
// client locally mute the reported user. The stored records are the foundation
// for the future aggregation + auto-ban signal (Phase 2/3).
app.post("/:id/reports", async (c) => {
	const sessionId = c.req.param("id");

	let body: {
		reporterSummonerId?: string;
		reportedSummonerId?: string;
		reason?: string;
		note?: string;
	};
	try {
		body = await c.req.json();
	} catch {
		return c.text("Invalid JSON body", 400);
	}
	if (!body || typeof body !== "object") {
		return c.text("Invalid JSON body", 400);
	}

	const reporter = (body.reporterSummonerId ?? "").trim();
	const reported = (body.reportedSummonerId ?? "").trim();
	const reason = body.reason ?? "";
	const note =
		typeof body.note === "string"
			? body.note.slice(0, MAX_NOTE_LENGTH)
			: undefined;

	if (!reporter || !reported) {
		return c.text("reporter and reported Summoner IDs are required", 400);
	}
	if (reporter.length > 32 || reported.length > 32) {
		return c.text("Summoner ID is too long (max 32 chars)", 400);
	}
	if (reporter.toLowerCase() === reported.toLowerCase()) {
		return c.text("You cannot report yourself", 400);
	}
	if (!REPORT_REASONS.has(reason)) {
		return c.text("Invalid report reason", 400);
	}

	const createdAt = Date.now();

	// Persisted to D1 with no expiry, Riot IDs in the clear. Both parties are
	// recorded permanently — see the privacy policy (sections 1/7/9) and
	// migrations/0001_create_reports.sql for why.
	await recordReport(c.env, {
		sessionId,
		reporter,
		reported,
		reason,
		note,
		createdAt,
	});

	// Child-safety reports are handled out-of-band and never feed the automatic
	// score (a single reporter must be able to escalate, and the category is too
	// severe to let a score-based auto-ban be weaponized). The row is stored the
	// same way; `evaluateReports` is what skips it.
	if (reason === CHILD_SAFETY_REASON) {
		return c.json({ ok: true });
	}

	// Phase 2/3: re-evaluate this user's reports and issue a temporary auto-ban
	// if over threshold. Run it in the background (waitUntil) so the report
	// response returns immediately; fall back to awaiting when there is no
	// execution context (e.g. tests). Never let it fail the response.
	const evaluate = () =>
		maybeAutoBan(c.env, reported, createdAt).catch((e) => {
			console.error("[reports] auto-ban evaluation failed:", e);
		});
	// `c.executionCtx` throws when absent, so probe it defensively.
	let execCtx: ExecutionContext | undefined;
	try {
		execCtx = c.executionCtx;
	} catch {
		execCtx = undefined;
	}
	if (execCtx) {
		execCtx.waitUntil(evaluate());
	} else {
		await evaluate();
	}

	return c.json({ ok: true });
});

export default app;
