import { describe, expect, it, vi } from "vitest";
import {
	classifyVisitor,
	sanitizeRef,
	sanitizeSource,
	writeFunnelEvent,
} from "./analytics";

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

	it("writes the documented column layout", () => {
		const writeDataPoint = vi.fn();
		// biome-ignore lint/suspicious/noExplicitAny: minimal AE stand-in
		writeFunnelEvent({ VC_ANALYTICS: { writeDataPoint } as any }, event);

		expect(writeDataPoint).toHaveBeenCalledWith({
			indexes: ["line"],
			blobs: ["joined", "line", "streamer_01", "ja", "JP", "human", "existing"],
			doubles: [1],
		});
	});

	// Local dev and tests run without the binding; a metric must never be the
	// reason a call fails.
	it("is a no-op when the binding is absent", () => {
		expect(() => writeFunnelEvent({}, event)).not.toThrow();
	});

	it("swallows a failure from the binding", () => {
		const writeDataPoint = vi.fn(() => {
			throw new Error("AE down");
		});
		expect(() =>
			// biome-ignore lint/suspicious/noExplicitAny: minimal AE stand-in
			writeFunnelEvent({ VC_ANALYTICS: { writeDataPoint } as any }, event),
		).not.toThrow();
	});
});
