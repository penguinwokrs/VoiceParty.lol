import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import type { LanguageCode } from "../i18n";
import { defaultLanguage, isLanguageCode } from "../i18n/paths";
import { seoMeta } from "../i18n/seo-meta";

const setMetaDescription = (content: string) => {
	let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
	if (!el) {
		el = document.createElement("meta");
		el.setAttribute("name", "description");
		document.head.appendChild(el);
	}
	el.setAttribute("content", content);
};

// Layout for language-aware routes. The URL is the source of truth for the
// active language: "/" is the default (English), "/ja" and "/ko" are prefixed.
// Any unknown top-level segment redirects home.
export const LangLayout = () => {
	const { lang: langParam } = useParams();
	const { i18n } = useTranslation();
	const location = useLocation();

	const lang: LanguageCode | null =
		langParam === undefined
			? defaultLanguage
			: isLanguageCode(langParam) && langParam !== defaultLanguage
				? langParam
				: null;

	useEffect(() => {
		if (!lang) return;
		if (i18n.resolvedLanguage !== lang) {
			void i18n.changeLanguage(lang);
		}
		document.documentElement.lang = lang;
		document.title = seoMeta[lang].title;
		setMetaDescription(seoMeta[lang].description);
	}, [lang, i18n]);

	if (lang === null) {
		// An explicit "/en" prefix (the default language) → strip it and keep the
		// sub-path (e.g. "/en/join" → "/join"). Any other unknown segment → home.
		// (On Cloudflare the edge middleware 301-redirects "/en" before this runs;
		// this keeps local dev and direct client navigation consistent.)
		if (langParam === defaultLanguage) {
			const cleanPath = location.pathname.replace(/^\/en(\/|$)/, "/");
			return <Navigate to={cleanPath} replace />;
		}
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};
