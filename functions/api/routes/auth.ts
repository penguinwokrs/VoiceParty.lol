import { Hono } from "hono";
import type { Bindings } from "../types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/login", (c) => {
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

app.get("/callback", async (c) => {
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

export default app;
