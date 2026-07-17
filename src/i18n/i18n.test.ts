import { describe, expect, it } from "vitest";
import i18n, { supportedLanguages } from ".";
import { seoMeta } from "./seo-meta";

describe("i18n", () => {
	it("resolves zh-TW without truncating the region subtag", async () => {
		// Regression guard: `load: "languageOnly"` silently rewrote "zh-TW" to
		// "zh", which matches neither the resource key nor the URL prefix — and
		// LangLayout compares resolvedLanguage against the prefix, so it would
		// re-fire changeLanguage forever.
		await i18n.changeLanguage("zh-TW");
		expect(i18n.resolvedLanguage).toBe("zh-TW");
		expect(i18n.t("join.joinGame")).toBe("加入遊戲");
	});

	it("falls back to English for the legal prose zh-TW deliberately omits", async () => {
		await i18n.changeLanguage("zh-TW");
		// Translated: the footer links render on every page.
		expect(i18n.t("legal.nav.privacy")).toBe("隱私權政策");
		// Not translated: unreviewed legal text must not ship (see zh-TW.ts).
		expect(i18n.t("legal.privacy.title")).toBe("Privacy Policy");
	});

	it("keeps the other languages resolving exactly", async () => {
		for (const [code, expected] of [
			["en", "Join Game"],
			["ja", "参加する"],
			["ko", "참가하기"],
		] as const) {
			await i18n.changeLanguage(code);
			expect(i18n.resolvedLanguage).toBe(code);
			expect(i18n.t("join.joinGame")).toBe(expected);
		}
	});

	it("has SEO metadata for every supported language", () => {
		for (const { code } of supportedLanguages) {
			expect(seoMeta[code], `seoMeta missing ${code}`).toBeDefined();
			expect(seoMeta[code].ogImage).toMatch(/^\/og-image.*\.png$/);
		}
	});
});
