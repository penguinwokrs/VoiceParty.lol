import { beforeEach, describe, expect, it } from "vitest";
import { captureAttribution, getAttribution } from "./attribution";

describe("attribution capture", () => {
	beforeEach(() => captureAttribution(""));

	it("reads src and ref off the query string", () => {
		captureAttribution("?src=line&ref=streamer_01");
		expect(getAttribution()).toEqual({ src: "line", ref: "streamer_01" });
	});

	it("yields empty tags when the link carried none", () => {
		captureAttribution("?region=jp1");
		expect(getAttribution()).toEqual({ src: "", ref: "" });
	});

	// The whole reason this module exists: joining navigates to the room path,
	// which drops the query string, so the value has to outlive the URL.
	it("keeps the captured tags after the URL has moved on", () => {
		captureAttribution("?src=x");
		expect(getAttribution().src).toBe("x");
		expect(getAttribution().src).toBe("x");
	});

	// Sanitizing is the server's job (it owns the allowlist); the client must
	// not silently drop a value the server would have understood.
	it("passes odd values through untouched", () => {
		captureAttribution("?src=NOT%20A%20CHANNEL");
		expect(getAttribution().src).toBe("NOT A CHANNEL");
	});
});
