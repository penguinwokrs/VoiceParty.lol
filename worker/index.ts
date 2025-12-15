import { Hono } from "hono";

type Bindings = {
	VC_SESSIONS: KVNamespace;
	RIOT_CLIENT_ID: string;
	RIOT_CLIENT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
	return c.text("Voice Chat Worker is running!");
});

app.get("/auth/login", (c) => {
	const clientID = c.env.RIOT_CLIENT_ID || "oujzg5jiibvzo"; // Fallback for dev if not set
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
		// In a real app, we would create a session here and store it in KV.
		// For now, we just return the token data to verify the flow.
		return c.json(tokenData);
	} catch (error) {
		return c.text(`Internal Server Error: ${(error as Error).message}`, 500);
	}
});

// Session Types
type User = {
	userId: string;
	joinedAt: number;
};

type Session = {
	sessionId: string;
	users: User[];
	createdAt: number;
};

// ... Auth endpoints (keep existing)

app.post("/sessions", async (c) => {
	const sessionId = crypto.randomUUID();
	const session: Session = {
		sessionId,
		users: [],
		createdAt: Date.now(),
	};

	await c.env.VC_SESSIONS.put(`session:${sessionId}`, JSON.stringify(session));
	return c.json(session);
});

app.post("/sessions/:id/join", async (c) => {
	const sessionId = c.req.param("id");
	const { userId } = await c.req.json<{ userId: string }>();

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

	if (session.users.find((u) => u.userId === userId)) {
		return c.json(session); // User already joined, return session
	}

	session.users.push({ userId, joinedAt: Date.now() });
	await c.env.VC_SESSIONS.put(`session:${sessionId}`, JSON.stringify(session));

	return c.json(session);
});

export default app;
