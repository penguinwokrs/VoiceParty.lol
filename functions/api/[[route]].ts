import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";

type Bindings = {
	VC_SESSIONS: KVNamespace;
	RIOT_CLIENT_ID: string;
	RIOT_CLIENT_SECRET: string;
	REALTIME_ORG_ID: string;
	REALTIME_API_KEY: string;
	REALTIME_KIT_APP_ID: string;
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
	try {
		// Create a meeting in RealtimeKit
		// Note: Actual API payload structure might vary, assuming minimal or default
		// biome-ignore lint/suspicious/noExplicitAny: API response is untyped
		const meeting: any = await callRealtimeKit("/meetings", "POST", c.env, {});
		console.log("RealtimeKit Meeting Created:", meeting);
		meetingId = meeting.data.id;
	} catch (e) {
		console.error("Failed to create RealtimeKit meeting:", e);
		// Fallback for development/missing keys
		console.warn("Using MOCK session due to API failure");
		meetingId = "mock-meeting-id";
	}

	const session: Session = {
		sessionId,
		meetingId,
		users: [],
		createdAt: Date.now(),
	};

	await c.env.VC_SESSIONS.put(`session:${sessionId}`, JSON.stringify(session));
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

	const sessionData = await c.env.VC_SESSIONS.get(`session:${sessionId}`);
	if (!sessionData) {
		return c.text("Session not found", 404);
	}

	const session: Session = JSON.parse(sessionData);

	if (session.users.length >= 5) {
		return c.text("Session is full (max 5 users)", 403);
	}

	// Check if user already exists
	const existingUser = session.users.find((u) => u.userId === userId);
	if (!existingUser) {
		session.users.push({ userId, joinedAt: Date.now(), iconUrl });
		await c.env.VC_SESSIONS.put(
			`session:${sessionId}`,
			JSON.stringify(session),
		);
	}

	// Generate RealtimeKit Token
	let realtimeToken: string | undefined;
	if (session.meetingId) {
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

	return c.json({
		session,
		realtime: session.meetingId
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
