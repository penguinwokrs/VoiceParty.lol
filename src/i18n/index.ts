import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";

// Order shown in the language switcher: EN → JP → KR. English is the default.
export const supportedLanguages = [
	{ code: "en", label: "English" },
	{ code: "ja", label: "日本語" },
	{ code: "ko", label: "한국어" },
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
		},
		// Default to English; only switch when the user has explicitly chosen a
		// language before (persisted in localStorage). Browser language is NOT
		// auto-detected, so first-time visitors always start in English.
		fallbackLng: "en",
		supportedLngs: supportedLanguages.map((l) => l.code),
		// Match "en-US" etc. down to the base language.
		load: "languageOnly",
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
