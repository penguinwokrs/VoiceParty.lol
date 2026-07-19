import { describe, expect, it } from "vitest";
import {
	classifyVisitor,
	funnelDay,
	sanitizeRef,
	sanitizeSource,
	writeFunnelEvent,
} from "./analytics";

/**
 * Minimal D1 stand-in that records the SQL and the args bound to each run().
 * `fail: true` makes run() throw, to exercise the swallow-errors path.
 */
const mockD1 = (opts: { fail?: boolean } = {}) => {
	const runs: { sql: string; args: unknown[] }[] = [];
	const VC_DB = {
		prepare: (sql: string) => ({
			bind: (...args: unknown[]) => ({
				run: async () => {
					if (opts.fail) throw new Error("D1 down");
					runs.push({ sql, args });
					return { success: true };
				},
			}),
		}),
	};
	// biome-ignore lint/suspicious/noExplicitAny: minimal D1 stand-in
	return { env: { VC_DB } as any, runs };
};

describe("attribution sanitizers", () => {
	it("passes through a known channel, case-insensitively", () => {
		expect(sanitizeSource("line")).toBe("line");
		expect(sanitizeSource("  LINE ")).toBe("line");
	});

	it("treats a missing source as direct traffic", () => {
		expect(sanitizeSource(null)).toBe("direct");
		expect(sanitizeSource("")).toBe("direct");
	});

	// An unbounded ?src= would let a stranger inflate column cardinality (and
	// the bill) just by appending random values to a shared link.
	it("collapses an unknown channel to other", () => {
		expect(sanitizeSource("whatever")).toBe("other");
		expect(sanitizeSource("a".repeat(500))).toBe("other");
		expect(sanitizeSource("'; DROP TABLE --")).toBe("other");
	});

	it("keeps a well-formed partner tag and drops anything else", () => {
		expect(sanitizeRef("streamer_01")).toBe("streamer_01");
		expect(sanitizeRef("Streamer-01")).toBe("streamer-01");
		expect(sanitizeRef("has spaces")).toBe("");
		expect(sanitizeRef("a".repeat(33))).toBe("");
		expect(sanitizeRef(undefined)).toBe("");
	});
});

describe("visitor classification", () => {
	it("flags link-preview scrapers", () => {
		for (const ua of [
			"Twitterbot/1.0",
			"facebookexternalhit/1.1",
			"Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
			"Slackbot-LinkExpanding 1.0",
		]) {
			expect(classifyVisitor(ua)).toBe("bot");
		}
	});

	it("treats a real browser as human", () => {
		expect(
			classifyVisitor(
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
			),
		).toBe("human");
	});

	it("does not guess when the UA is missing", () => {
		expect(classifyVisitor(null)).toBe("human");
	});
});

describe("writeFunnelEvent", () => {
	const event = {
		name: "joined" as const,
		src: "line",
		ref: "streamer_01",
		lang: "ja",
		country: "JP",
		visitor: "human" as const,
		detail: "existing",
	};

	it("upserts a counter row with the event's dimensions, keyed by UTC day", async () => {
		const { env, runs } = mockD1();
		// Fixed instant so the day bucket is deterministic.
		await writeFunnelEvent(env, event, Date.parse("2026-07-19T23:30:00Z"));

		expect(runs).toHaveLength(1);
		expect(runs[0].sql).toMatch(/INSERT INTO funnel_stats/);
		// Atomic increment on conflict — the property KV lacked.
		expect(runs[0].sql).toMatch(/ON CONFLICT[\s\S]*count = count \+ 1/);
		expect(runs[0].args).toEqual([
			"2026-07-19",
			"joined",
			"line",
			"streamer_01",
			"ja",
			"JP",
			"human",
			"existing",
		]);
	});

	it("buckets by UTC calendar day", () => {
		expect(funnelDay(Date.parse("2026-07-19T00:00:00Z"))).toBe("2026-07-19");
		expect(funnelDay(Date.parse("2026-07-19T23:59:59Z"))).toBe("2026-07-19");
	});

	// Unit tests that don't stub D1; a metric must never be the reason a call fails.
	it("is a no-op when the D1 binding is absent", async () => {
		// biome-ignore lint/suspicious/noExplicitAny: intentionally empty env
		await expect(writeFunnelEvent({} as any, event)).resolves.toBeUndefined();
	});

	// The table may not exist yet (before migration 0002 is applied), so a
	// failing write must be swallowed — the deploy ships safely ahead of it.
	it("swallows a D1 failure", async () => {
		const { env } = mockD1({ fail: true });
		await expect(writeFunnelEvent(env, event)).resolves.toBeUndefined();
	});
});
