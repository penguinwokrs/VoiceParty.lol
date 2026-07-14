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

const ACCOUNT_API_URL = "https://asia.api.riotgames.com";
const SUMMONER_API_URL = "https://jp1.api.riotgames.com";

/**
 * Validates Summoner ID (Riot ID format: Name#Tag) and returns Account info.
 * Uses Account-V1 API (Asia region).
 */
export async function getAccountByRiotId(
	riotId: string,
	apiKey: string,
): Promise<RiotAccount | null> {
	if (!riotId || !riotId.includes("#")) {
		return null;
	}

	const [gameName, tagLine] = riotId.split("#");
	try {
		const res = await fetch(
			`${ACCOUNT_API_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
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
 * Fetches Summoner info by PUUID.
 * Uses Summoner-V4 API (JP1 region).
 */
export async function getSummonerByPuuid(
	puuid: string,
	apiKey: string,
): Promise<Summoner | null> {
	try {
		const res = await fetch(
			`${SUMMONER_API_URL}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
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
