import { afterEach, describe, expect, it, vi } from "vitest";
import { REGIONS } from "../../../src/components/VoiceChat/regions";
import {
	getAccountByRiotId,
	getSummonerByPuuid,
	KNOWN_PLATFORMS,
} from "./riot";

const API_KEY = "test-key";

/** Stubs fetch and reports the URLs it was called with. */
const stubFetch = (response: Partial<Response> = {}) => {
	const calls: string[] = [];
	const fetchMock = vi.fn(async (url: string) => {
		calls.push(String(url));
		return {
			ok: true,
			status: 200,
			statusText: "OK",
			json: async () => ({}),
			...response,
		} as Response;
	});
	vi.stubGlobal("fetch", fetchMock);
	return { calls, fetchMock };
};

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("platform routing", () => {
	// The whole point of the fix: every platform the join form offers must be
	// routable, or that region's players silently lose their profile icon.
	it("covers every region offered in the UI", () => {
		const uiCodes = REGIONS.map((r) => r.code).sort();
		expect([...KNOWN_PLATFORMS].sort()).toEqual(uiCodes);
	});
});

describe("getAccountByRiotId", () => {
	it.each([
		["na1", "americas"],
		["br1", "americas"],
		["euw1", "europe"],
		["ru", "europe"],
		["kr", "asia"],
		["jp1", "asia"],
		["sg2", "asia"],
	])("routes %s to the %s cluster", async (region, cluster) => {
		const { calls } = stubFetch();
		await getAccountByRiotId("Name#Tag", API_KEY, region);
		expect(calls[0]).toContain(`https://${cluster}.api.riotgames.com`);
	});

	it("falls back to a real cluster for an unknown region", async () => {
		const { calls } = stubFetch();
		await getAccountByRiotId("Name#Tag", API_KEY, "not-a-region");
		expect(calls[0]).toContain("https://americas.api.riotgames.com");
	});

	// A region arrives in a request body, so it must never reach the hostname
	// unvalidated — otherwise it steers our API key at an arbitrary server.
	it("never puts an attacker-supplied host in the URL", async () => {
		const { calls } = stubFetch();
		await getAccountByRiotId("Name#Tag", API_KEY, "evil.example.com");
		expect(calls[0]).not.toContain("evil.example.com");
	});

	it("returns null for a malformed Riot ID without calling the API", async () => {
		const { fetchMock } = stubFetch();
		expect(await getAccountByRiotId("NoTagHere", API_KEY, "na1")).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe("getSummonerByPuuid", () => {
	it("queries the player's own platform host", async () => {
		const { calls } = stubFetch();
		await getSummonerByPuuid("puuid-1", API_KEY, "na1");
		expect(calls[0]).toBe(
			"https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/puuid-1",
		);
	});

	// The regression this PR fixes: an NA player used to be looked up on jp1.
	it("does not fall back to jp1 for non-JP players", async () => {
		const { calls } = stubFetch();
		await getSummonerByPuuid("puuid-1", API_KEY, "euw1");
		expect(calls[0]).not.toContain("jp1");
	});

	it("skips the call entirely for an unknown platform", async () => {
		const { fetchMock } = stubFetch();
		expect(await getSummonerByPuuid("puuid-1", API_KEY, "bogus")).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns null on a 404 rather than throwing", async () => {
		stubFetch({ ok: false, status: 404, statusText: "Not Found" });
		expect(await getSummonerByPuuid("puuid-1", API_KEY, "na1")).toBeNull();
	});
});
