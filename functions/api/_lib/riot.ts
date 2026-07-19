export type RiotAccount = {
	puuid: string;
	gameName: string;
	tagLine: string;
};

export type Summoner = {
	id: string;
	accountId: string;
	puuid: string;
	name: string;
	profileIconId: number;
	revisionDate: number;
	summonerLevel: number;
};

// Riot splits its API across two kinds of host. SUMMONER-V4 is per *platform*
// (`jp1`, `na1`, …) and only knows about accounts on that platform, so calling
// the wrong one 404s. ACCOUNT-V1 is per *regional cluster* (`americas`, `asia`,
// `europe`) and is account-global, so the cluster only affects latency.
//
// Both used to be hardcoded to the JP/asia hosts, which meant every non-JP
// player silently lost their profile icon. The platform the player picks in the
// join form is what routes these calls now.
//
// Keep PLATFORM_TO_CLUSTER's keys in sync with `src/components/VoiceChat/regions.ts`
// — the test in riot.test.ts fails if they drift apart.
const PLATFORM_TO_CLUSTER: Record<string, string> = {
	na1: "americas",
	br1: "americas",
	la1: "americas",
	la2: "americas",
	euw1: "europe",
	eun1: "europe",
	tr1: "europe",
	ru: "europe",
	kr: "asia",
	jp1: "asia",
	// SEA platforms: ACCOUNT-V1 exposes no `sea` cluster, so these route to asia.
	oc1: "asia",
	ph2: "asia",
	sg2: "asia",
	th2: "asia",
	tw2: "asia",
	vn2: "asia",
};

// Used when a caller passes a platform we don't recognise. ACCOUNT-V1 is
// account-global so this still resolves; it just adds latency for far regions.
const DEFAULT_CLUSTER = "americas";

/** Platform codes this module can route. Asserted against the UI's list in tests. */
export const KNOWN_PLATFORMS = Object.keys(PLATFORM_TO_CLUSTER);

/** True for platform codes we will interpolate into a Riot API hostname. */
export const isKnownPlatform = (region: string | undefined): boolean =>
	!!region && Object.hasOwn(PLATFORM_TO_CLUSTER, region);

const accountApiUrl = (region: string | undefined): string => {
	// Never interpolate an unvalidated value into the host — it comes from a
	// request body and would otherwise be a way to point our API key at an
	// arbitrary server.
	const cluster = isKnownPlatform(region)
		? PLATFORM_TO_CLUSTER[region as string]
		: DEFAULT_CLUSTER;
	return `https://${cluster}.api.riotgames.com`;
};

/**
 * Validates Summoner ID (Riot ID format: Name#Tag) and returns Account info.
 * Uses Account-V1, routed to the regional cluster that owns `region`.
 */
export async function getAccountByRiotId(
	riotId: string,
	apiKey: string,
	region?: string,
): Promise<RiotAccount | null> {
	if (!riotId || !riotId.includes("#")) {
		return null;
	}

	const [gameName, tagLine] = riotId.split("#");
	try {
		const res = await fetch(
			`${accountApiUrl(region)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
				gameName,
			)}/${encodeURIComponent(tagLine)}`,
			{
				headers: {
					"X-Riot-Token": apiKey,
				},
			},
		);

		if (res.status === 404) {
			return null;
		}

		if (!res.ok) {
			console.error(
				`[RiotAPI] Account lookup failed for ${riotId}: ${res.status} ${res.statusText}`,
			);
			return null;
		}

		return (await res.json()) as RiotAccount;
	} catch (e) {
		console.error(`[RiotAPI] Account lookup error for ${riotId}:`, e);
		return null;
	}
}

/**
 * Fetches Summoner info by PUUID from the player's own platform.
 *
 * Returns null for an unknown platform rather than guessing one: SUMMONER-V4 is
 * platform-scoped, so a guess would 404 for most players anyway, and the caller
 * already treats null as "no icon" without failing the join.
 */
export async function getSummonerByPuuid(
	puuid: string,
	apiKey: string,
	region: string,
): Promise<Summoner | null> {
	if (!isKnownPlatform(region)) {
		console.warn(
			`[RiotAPI] Unknown platform '${region}'; skipping icon lookup`,
		);
		return null;
	}
	try {
		const res = await fetch(
			`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
			{
				headers: {
					"X-Riot-Token": apiKey,
				},
			},
		);

		if (!res.ok) {
			console.error(
				`[RiotAPI] Summoner lookup failed for puuid ${puuid}: ${res.status} ${res.statusText}`,
			);
			return null;
		}

		return (await res.json()) as Summoner;
	} catch (e) {
		console.error(`[RiotAPI] Summoner lookup error for puuid ${puuid}:`, e);
		return null;
	}
}

// Fallback if versions.json is unreachable. A stale version 403s for newer
// profile icons, so we keep this reasonably current and prefer the live fetch.
const FALLBACK_DDRAGON_VERSION = "16.13.1";
const DDRAGON_VERSION_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedVersion: string | null = null;
let cachedVersionAt = 0;

/**
 * Returns the latest Data Dragon version, memoized per isolate for 1 hour.
 * Falls back to the last known good (or a hardcoded) version on failure.
 */
export async function getLatestDDragonVersion(): Promise<string> {
	const now = Date.now();
	if (cachedVersion && now - cachedVersionAt < DDRAGON_VERSION_TTL_MS) {
		return cachedVersion;
	}
	try {
		const res = await fetch(
			"https://ddragon.leagueoflegends.com/api/versions.json",
		);
		if (res.ok) {
			const versions = (await res.json()) as string[];
			if (Array.isArray(versions) && versions.length > 0 && versions[0]) {
				cachedVersion = versions[0];
				cachedVersionAt = now;
				return cachedVersion;
			}
		}
		console.error(`[DDragon] versions.json returned ${res.status}`);
	} catch (e) {
		console.error("[DDragon] Failed to fetch versions.json:", e);
	}
	// Reuse a previously cached value if we have one, else the hardcoded fallback.
	return cachedVersion ?? FALLBACK_DDRAGON_VERSION;
}

/**
 * Returns the CDN URL for a profile icon ID using the latest Data Dragon
 * version. Newer icon IDs 403 on stale versions, so the version is resolved
 * dynamically (and cached) rather than hardcoded.
 */
export async function getProfileIconUrl(iconId: number): Promise<string> {
	const version = await getLatestDDragonVersion();
	return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;
}
