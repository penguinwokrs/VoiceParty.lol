import { Hono } from "hono";
import {
	getAccountByRiotId,
	getProfileIconUrl,
	getSummonerByPuuid,
} from "../_lib/riot";
import type { Bindings } from "../_types";

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Provisional login using a Riot ID (Name#Tag) validated via the Account-V1 API.
 *
 * This works with a Personal / Development API key today, unlike the RSO OAuth
 * flow below which requires an approved Production RSO client from Riot.
 * It verifies the identity exists and returns the resolved account + profile icon.
 */
app.post("/riot-id", async (c) => {
	let body: { riotId?: string; region?: string };
	try {
		// `region` is the Riot platform (e.g. "na1"); it routes the lookups below.
		body = await c.req.json<{ riotId?: string; region?: string }>();
	} catch {
		return c.text("Invalid JSON body", 400);
	}

	const riotId = body.riotId?.trim();
	if (!riotId) {
		return c.text("riotId is required", 400);
	}
	if (!riotId.includes("#")) {
		return c.text("riotId must be in 'Name#Tag' format", 400);
	}
	if (riotId.length > 32) {
		return c.text("riotId is too long (max 32 chars)", 400);
	}

	const [gameName, tagLine] = riotId.split("#");

	// Validation temporarily disabled (e.g. awaiting RSO approval): accept the
	// Riot ID as-is without contacting the Riot API. The RSO/validation code
	// below is kept intact and re-enabled by unsetting the flag.
	if (c.env.RIOT_VALIDATION_ENABLED === "false") {
		return c.json({
			puuid: null,
			gameName,
			tagLine,
			riotId,
			iconUrl: undefined,
			validated: false,
		});
	}

	const apiKey = c.env.RIOT_GAME_API_KEY;
	if (!apiKey) {
		return c.text("Configuration error: Missing Riot API Key", 503);
	}

	const region = body.region;
	const account = await getAccountByRiotId(riotId, apiKey, region);
	if (!account) {
		return c.text("Riot ID not found", 404);
	}

	// Best-effort icon lookup; identity is valid even if this fails. Without a
	// platform there is nothing to query — SUMMONER-V4 is platform-scoped — so
	// the caller just gets no icon.
	let iconUrl: string | undefined;
	const summoner = region
		? await getSummonerByPuuid(account.puuid, apiKey, region)
		: null;
	if (summoner) {
		iconUrl = await getProfileIconUrl(summoner.profileIconId);
	}

	return c.json({
		puuid: account.puuid,
		gameName: account.gameName,
		tagLine: account.tagLine,
		riotId: `${account.gameName}#${account.tagLine}`,
		iconUrl,
		validated: true,
	});
});

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
