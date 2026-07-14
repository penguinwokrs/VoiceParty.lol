import { describe, expect, it } from "vitest";
import {
	buildCssVarRefs,
	buildTokenMap,
	cssVarName,
	dotPath,
	flattenTokens,
	renderCss,
} from "./tokens-lib.mjs";

const sample = {
	$description: "meta ignored",
	color: {
		brand: { teal: { $type: "color", $value: "#0AC8B9" } },
		semantic: { primary: { $type: "color", $value: "{color.brand.teal}" } },
	},
	radius: { md: { $type: "dimension", $value: "8px" } },
};

describe("tokens-lib", () => {
	it("flattens leaves and ignores $meta keys", () => {
		const leaves = flattenTokens(sample);
		const paths = leaves.map((l) => dotPath(l.path)).sort();
		expect(paths).toEqual([
			"color.brand.teal",
			"color.semantic.primary",
			"radius.md",
		]);
	});

	it("maps a path to a CSS variable name", () => {
		expect(cssVarName(["color", "brand", "teal"])).toBe("--color-brand-teal");
	});

	it("resolves DTCG aliases to concrete values", () => {
		const map = buildTokenMap(sample);
		expect(map["color.semantic.primary"]).toBe("#0AC8B9");
		expect(map["color.brand.teal"]).toBe("#0AC8B9");
	});

	it("throws on an unknown alias reference", () => {
		const bad = {
			color: { a: { $type: "color", $value: "{color.missing}" } },
		};
		expect(() => buildTokenMap(bad)).toThrow(/Unknown token reference/);
	});

	it("throws on a cyclic alias", () => {
		const cyclic = {
			a: { $type: "color", $value: "{b}" },
			b: { $type: "color", $value: "{a}" },
		};
		expect(() => buildTokenMap(cyclic)).toThrow(/Cyclic token alias/);
	});

	it("renders a :root CSS block with resolved values", () => {
		const css = renderCss(sample);
		expect(css).toContain(":root {");
		expect(css).toContain("--color-brand-teal: #0AC8B9;");
		// alias resolved, not left as {color.brand.teal}
		expect(css).toContain("--color-semantic-primary: #0AC8B9;");
		expect(css).not.toContain("{color.brand.teal}");
	});

	it("builds var() references for each token", () => {
		const refs = buildCssVarRefs(sample);
		expect(refs["radius.md"]).toBe("var(--radius-md)");
	});
});
