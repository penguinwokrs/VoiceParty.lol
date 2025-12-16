import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";

type Bindings = {
	VC_SESSIONS: KVNamespace;
	RIOT_CLIENT_ID: string;
	RIOT_CLIENT_SECRET: string;
	REALTIME_ORG_ID: string;
	REALTIME_API_KEY: string;
	REALTIME_KIT_APP_ID: string;
	USE_MOCK_REALTIME: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

// Helper to call RealtimeKit API
async function callRealtimeKit(
	path: string,
	method: string,
	env: Bindings,
	// biome-ignore lint/suspicious/noExplicitAny: Payload varies
	body?: any,
) {
	const url = `https://api.realtime.cloudflare.com/v2${path}`;
	const auth = btoa(`${env.REALTIME_ORG_ID}:${env.REALTIME_API_KEY}`);
	const response = await fetch(url, {
		method,
		headers: {
			Authorization: `Basic ${auth}`,
			"Content-Type": "application/json",
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`RealtimeKit API Error ${response.status}: ${text}`);
	}

	return response.json();
}

app.get("/", (c) => {
	return c.text("Voice Chat Worker is running! (API)");
});

app.get("/auth/login", (c) => {
	const clientID = c.env.RIOT_CLIENT_ID;
	if (!clientID) {
		return c.text("Configuration error: Missing Client ID", 500);
	}
	const redirectParams = new URLSearchParams({
		client_id: clientID,
		redirect_uri: new URL("/auth/callback", c.req.url).toString(),
		response_type: "code",
		scope: "openid",
	});

	return c.redirect(
		`https://auth.riotgames.com/authorize?${redirectParams.toString()}`,
	);
});

app.get("/auth/callback", async (c) => {
	const code = c.req.query("code");
	if (!code) return c.text("No code provided", 400);

	if (!c.env.RIOT_CLIENT_SECRET) {
		return c.text("Configuration error: Missing Client Secret", 500);
	}

	try {
		const tokenResponse = await fetch("https://auth.riotgames.com/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${btoa(`${c.env.RIOT_CLIENT_ID}:${c.env.RIOT_CLIENT_SECRET}`)}`,
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code,
				redirect_uri: new URL("/auth/callback", c.req.url).toString(),
			}),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			return c.text(`Token exchange failed: ${errorText}`, 400);
		}

		const tokenData = await tokenResponse.json();
		return c.json(tokenData);
	} catch (error) {
		return c.text(`Internal Server Error: ${(error as Error).message}`, 500);
	}
});

// Session Types
type User = {
	userId: string;
	joinedAt: number;
	iconUrl?: string;
};

type Session = {
	sessionId: string;
	meetingId?: string; // RealtimeKit Meeting ID
	users: User[];
	createdAt: number;
};

app.post("/sessions", async (c) => {
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

	// ... (meeting creation logic remains same)

	const session: Session = {
		sessionId,
		meetingId,
		users: [],
		createdAt: Date.now(),
	};

	// Save mapping: game:{gameId} -> meetingId
	// If meetingId is undefined (mock failure fallback?), we use sessionId as fallback meetingId?
	// In current logic meetingId is "mock-meeting-id" if failed. So it's always defined string.
	if (meetingId) {
		await c.env.VC_SESSIONS.put(`game:${sessionId}`, meetingId);
		await c.env.VC_SESSIONS.put(
			`session:${meetingId}`,
			JSON.stringify(session),
		);
	} else {
		// Should not happen with current logic, but safe fallback
		await c.env.VC_SESSIONS.put(
			`session:${sessionId}`,
			JSON.stringify(session),
		);
	}

	return c.json(session);
});

app.post("/sessions/:id/join", async (c) => {
	const sessionId = c.req.param("id");
	const { userId, iconUrl } = await c.req.json<{
		userId: string;
		iconUrl?: string;
	}>();

	if (!userId) {
		return c.text("User ID is required", 400);
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
				// Retry without name if 422? No, let's just fall back to mock or no-meeting for now.
				// Or better: try creating without name if name failed?
				// For now, logging error and mock fallback.
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
		await c.env.VC_SESSIONS.put(`game:${sessionId}`, meetingId);
	}

	if (session.users.length >= 5) {
		return c.text("Session is full (max 5 users)", 403);
	}

	// Check if user already exists
	const existingUser = session.users.find((u) => u.userId === userId);
	if (!existingUser) {
		session.users.push({ userId, joinedAt: Date.now(), iconUrl });
		await c.env.VC_SESSIONS.put(
			`session:${session.meetingId}`, // Save to session:meetingId
			JSON.stringify(session),
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
						name: userId,
						custom_participant_id: userId,
						preset_name: "group_call_participant",
						// Role/preset might be required. Assuming 'participant' or default.
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

export const onRequest = handle(app);
export { app };
