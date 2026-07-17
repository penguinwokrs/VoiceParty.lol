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
		brand: { ember: { $type: "color", $value: "#FF6A3D" } },
		semantic: { primary: { $type: "color", $value: "{color.brand.ember}" } },
	},
	radius: { md: { $type: "dimension", $value: "8px" } },
};

describe("tokens-lib", () => {
	it("flattens leaves and ignores $meta keys", () => {
		const leaves = flattenTokens(sample);
		const paths = leaves.map((l) => dotPath(l.path)).sort();
		expect(paths).toEqual([
			"color.brand.ember",
			"color.semantic.primary",
			"radius.md",
		]);
	});

	it("maps a path to a CSS variable name", () => {
		expect(cssVarName(["color", "brand", "ember"])).toBe("--color-brand-ember");
	});

	it("resolves DTCG aliases to concrete values", () => {
		const map = buildTokenMap(sample);
		expect(map["color.semantic.primary"]).toBe("#FF6A3D");
		expect(map["color.brand.ember"]).toBe("#FF6A3D");
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
		expect(css).toContain("--color-brand-ember: #FF6A3D;");
		// alias resolved, not left as {color.brand.ember}
		expect(css).toContain("--color-semantic-primary: #FF6A3D;");
		expect(css).not.toContain("{color.brand.ember}");
	});

	it("builds var() references for each token", () => {
		const refs = buildCssVarRefs(sample);
		expect(refs["radius.md"]).toBe("var(--radius-md)");
	});
});
