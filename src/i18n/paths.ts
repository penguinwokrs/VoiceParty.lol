import { type LanguageCode, supportedLanguages } from ".";

// English is the default language and is served WITHOUT a path prefix (`/`).
// Other languages live under a prefix (`/ja`, `/ko`).
export const defaultLanguage: LanguageCode = "en";

const codes = supportedLanguages.map((l) => l.code) as LanguageCode[];
const prefixedCodes: LanguageCode[] = codes.filter(
	(c) => c !== defaultLanguage,
);

export const isLanguageCode = (
	value: string | undefined,
): value is LanguageCode => !!value && codes.includes(value as LanguageCode);

// True only for languages that appear as a URL prefix (ja/ko, not the default en).
export const isLangPrefix = (
	segment: string | undefined,
): segment is LanguageCode =>
	!!segment && prefixedCodes.includes(segment as LanguageCode);

// Strip a leading `/ja` or `/ko` so we get the canonical (default-language)
// path. Always returns a value starting with "/".
export const stripLangPrefix = (pathname: string): string => {
	const parts = pathname.split("/"); // e.g. ["", "ja", "join", "abc"]
	if (isLangPrefix(parts[1])) {
		parts.splice(1, 1);
	}
	const rest = parts.join("/");
	return rest === "" ? "/" : rest;
};

// The active language implied by a pathname (defaults to English).
export const langFromPath = (pathname: string): LanguageCode => {
	const seg = pathname.split("/")[1];
	return isLangPrefix(seg) ? seg : defaultLanguage;
};

// Build the pathname for `lang`, preserving the current sub-path.
export const localizePath = (pathname: string, lang: LanguageCode): string => {
	const base = stripLangPrefix(pathname); // "/", "/join", "/join/abc"
	if (lang === defaultLanguage) return base;
	return base === "/" ? `/${lang}` : `/${lang}${base}`;
};
