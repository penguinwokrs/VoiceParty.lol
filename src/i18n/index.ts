import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { zhTW } from "./locales/zh-TW";

// Order shown in the language switcher: EN → JP → KR → TW. English is the
// default. zh-TW is Traditional Chinese: the Riot API has no mainland-China
// platform, so this locale's audience is Taiwan (tw2) / HK / Macau.
export const supportedLanguages = [
	{ code: "en", label: "English" },
	{ code: "ja", label: "日本語" },
	{ code: "ko", label: "한국어" },
	{ code: "zh-TW", label: "繁體中文" },
] as const;

export type LanguageCode = (typeof supportedLanguages)[number]["code"];

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			ja: { translation: ja },
			ko: { translation: ko },
			en: { translation: en },
			// Partial by design — missing keys (the legal prose) fall back to en.
			"zh-TW": { translation: zhTW },
		},
		// Default to English; only switch when the user has explicitly chosen a
		// language before (persisted in localStorage). Browser language is NOT
		// auto-detected, so first-time visitors always start in English.
		fallbackLng: "en",
		supportedLngs: supportedLanguages.map((l) => l.code),
		// Keep region subtags: "languageOnly" would truncate "zh-TW" to "zh",
		// which no longer matches the resource key or the URL prefix (LangLayout
		// compares resolvedLanguage against the prefix, so it would never settle).
		// Codes we don't serve — "en-US" and friends — aren't in supportedLngs and
		// so resolve to fallbackLng, which is what "languageOnly" bought us before.
		load: "currentOnly",
		interpolation: {
			// React already escapes values against XSS.
			escapeValue: false,
		},
		detection: {
			order: ["localStorage"],
			caches: ["localStorage"],
		},
	});

export default i18n;
