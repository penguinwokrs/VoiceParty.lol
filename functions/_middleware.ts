/// <reference types="@cloudflare/workers-types" />

// Edge localization of the SPA's <head>. Crawlers and social scrapers do not
// run the React app, so this rewrites the static index.html per request based
// on the URL's language prefix (/ja, /ko; default English at /). Keep the META
// map in sync with src/i18n/seo-meta.ts.

const LANGS = ["en", "ja", "ko"] as const;
type Lang = (typeof LANGS)[number];
const DEFAULT_LANG: Lang = "en";

type Meta = {
	title: string;
	description: string;
	ogLocale: string;
	ogImage: string;
};

const META: Record<Lang, Meta> = {
	en: {
		title: "VoiceCrew — Real-time browser voice chat for your team",
		description:
			"VoiceCrew is a free, browser-based real-time voice chat for gaming teams. No install, no sign-up — share a link and talk with crystal-clear voice.",
		ogLocale: "en_US",
		ogImage: "/og-image.png",
	},
	ja: {
		title: "VoiceCrew — チームのためのブラウザ完結ボイスチャット",
		description:
			"VoiceCrew は、インストール不要・登録不要でブラウザだけで使える無料のリアルタイム・ボイスチャット。リンクを共有するだけで、クリアな音声でチームと会話できます。",
		ogLocale: "ja_JP",
		ogImage: "/og-image-ja.png",
	},
	ko: {
		title: "VoiceCrew — 팀을 위한 브라우저 음성 채팅",
		description:
			"VoiceCrew는 설치·가입 없이 브라우저만으로 사용하는 무료 실시간 음성 채팅입니다. 링크만 공유하면 선명한 음성으로 팀과 대화할 수 있습니다.",
		ogLocale: "ko_KR",
		ogImage: "/og-image-ko.png",
	},
};

const isLang = (value: string | undefined): value is Lang =>
	!!value && (LANGS as readonly string[]).includes(value);

const langFromPath = (pathname: string): Lang => {
	const seg = pathname.split("/")[1];
	return isLang(seg) && seg !== DEFAULT_LANG ? seg : DEFAULT_LANG;
};

const stripLang = (pathname: string): string => {
	const parts = pathname.split("/");
	if (isLang(parts[1]) && parts[1] !== DEFAULT_LANG) {
		parts.splice(1, 1);
	}
	const rest = parts.join("/");
	return rest === "" ? "/" : rest;
};

const localize = (base: string, lang: Lang): string => {
	if (lang === DEFAULT_LANG) return base;
	return base === "/" ? `/${lang}` : `/${lang}${base}`;
};

const escapeAttr = (value: string): string =>
	value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const setAttr = (name: string, value: string) => ({
	element(el: Element) {
		el.setAttribute(name, value);
	},
});

const setText = (value: string) => ({
	element(el: Element) {
		el.setInnerContent(value);
	},
});

export const onRequest: PagesFunction = async (context) => {
	const url = new URL(context.request.url);

	// The default language (English) is served without a prefix. Redirect an
	// explicit "/en" prefix to the clean path at the edge (301) so there is a
	// single canonical URL per page (avoids duplicate content).
	const segments = url.pathname.split("/");
	if (segments[1] === DEFAULT_LANG) {
		segments.splice(1, 1);
		const cleanPath = segments.join("/") || "/";
		return Response.redirect(url.origin + cleanPath + url.search, 301);
	}

	const res = await context.next();

	// Never run HTMLRewriter on bodyless / redirect responses (304, other 3xx):
	// there is nothing to rewrite and it can violate the response contract.
	if (res.status === 304 || (res.status >= 300 && res.status < 400)) {
		return res;
	}

	const contentType = res.headers.get("content-type") ?? "";
	if (!contentType.includes("text/html")) return res;

	const lang = langFromPath(url.pathname);
	const meta = META[lang];
	const basePath = stripLang(url.pathname);
	const { origin } = url;
	const selfUrl = origin + localize(basePath, lang);
	const ogImage = origin + meta.ogImage;
	// Session rooms (/join/<id>) are shareable but should not be indexed.
	const isSessionRoom = /^\/join\/[^/]+$/.test(basePath);

	const alternates = [...LANGS]
		.map(
			(l) =>
				`<link rel="alternate" hreflang="${l}" href="${escapeAttr(origin + localize(basePath, l))}" />`,
		)
		.join("");
	const xDefault = `<link rel="alternate" hreflang="x-default" href="${escapeAttr(origin + basePath)}" />`;
	const robots = isSessionRoom
		? `<meta name="robots" content="noindex, follow" />`
		: "";
	const headExtras = alternates + xDefault + robots;

	return new HTMLRewriter()
		.on("html", setAttr("lang", lang))
		.on("title", setText(meta.title))
		.on('meta[name="description"]', setAttr("content", meta.description))
		.on('meta[property="og:title"]', setAttr("content", meta.title))
		.on('meta[property="og:description"]', setAttr("content", meta.description))
		.on('meta[property="og:url"]', setAttr("content", selfUrl))
		.on('meta[property="og:image"]', setAttr("content", ogImage))
		.on('meta[property="og:locale"]', setAttr("content", meta.ogLocale))
		.on('meta[name="twitter:title"]', setAttr("content", meta.title))
		.on(
			'meta[name="twitter:description"]',
			setAttr("content", meta.description),
		)
		.on('meta[name="twitter:image"]', setAttr("content", ogImage))
		.on('link[rel="canonical"]', setAttr("href", selfUrl))
		.on("head", {
			element(el: Element) {
				el.append(headExtras, { html: true });
			},
		})
		.transform(res);
};
