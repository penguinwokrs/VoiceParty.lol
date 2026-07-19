import { describe, expect, it } from "vitest";
import {
	isSessionRoomPath,
	langFromPath,
	localize,
	pageDetail,
	stripLang,
} from "./_middleware";

// The edge <head> rewrite decides two things that are easy to get wrong and
// invisible until something is already indexed or miscounted: whether a path is
// a shareable room, and which language prefix it carries. Both were previously
// covered only by hand-running `wrangler pages dev`.

describe("isSessionRoomPath", () => {
	// Regression: the original pattern (^/join/[^/]+$) ended at one segment, so
	// the region-qualified rooms the app actually mints were left indexable.
	it("matches the region-qualified rooms the app actually mints", () => {
		expect(isSessionRoomPath("/join/jp1/abc123")).toBe(true);
		expect(isSessionRoomPath("/join/kr/xY9_room")).toBe(true);
	});

	it("matches a bare room too (links minted before regions existed)", () => {
		expect(isSessionRoomPath("/join/abc123")).toBe(true);
	});

	it("does not match the room-less join page", () => {
		expect(isSessionRoomPath("/join")).toBe(false);
	});

	it("does not match unrelated pages", () => {
		for (const path of ["/", "/privacy", "/terms", "/joinery"]) {
			expect(isSessionRoomPath(path)).toBe(false);
		}
	});
});

describe("pageDetail", () => {
	it("separates invites, the landing page, and everything else", () => {
		expect(pageDetail("/join/jp1/abc")).toBe("invite");
		expect(pageDetail("/")).toBe("landing");
		expect(pageDetail("/privacy")).toBe("other");
		expect(pageDetail("/join")).toBe("other");
	});
});

describe("language routing", () => {
	it("reads the language prefix, defaulting to English", () => {
		expect(langFromPath("/ja/join/jp1/abc")).toBe("ja");
		expect(langFromPath("/ko/")).toBe("ko");
		expect(langFromPath("/zh-TW/privacy")).toBe("zh-TW");
		expect(langFromPath("/join/jp1/abc")).toBe("en");
		// Not a language — must not be mistaken for one.
		expect(langFromPath("/joinery")).toBe("en");
	});

	// The room check runs on the stripped path, so a prefix must not hide a room.
	it("strips the prefix back to a language-neutral path", () => {
		expect(stripLang("/ja/join/jp1/abc")).toBe("/join/jp1/abc");
		expect(stripLang("/ja")).toBe("/");
		expect(stripLang("/join/jp1/abc")).toBe("/join/jp1/abc");
	});

	it("keeps a prefixed room classified as a room", () => {
		for (const path of [
			"/ja/join/jp1/abc",
			"/ko/join/abc",
			"/zh-TW/join/kr/x",
		]) {
			expect(isSessionRoomPath(stripLang(path))).toBe(true);
		}
	});

	it("round-trips a path through localize and back", () => {
		for (const lang of ["ja", "ko", "zh-TW"] as const) {
			const localized = localize("/join/jp1/abc", lang);
			expect(localized).toBe(`/${lang}/join/jp1/abc`);
			expect(stripLang(localized)).toBe("/join/jp1/abc");
		}
		// English is served without a prefix — it is the canonical form.
		expect(localize("/join/jp1/abc", "en")).toBe("/join/jp1/abc");
		expect(localize("/", "ja")).toBe("/ja");
	});
});
