/// <reference types="@cloudflare/workers-types" />

import {
	classifyVisitor,
	sanitizeRef,
	sanitizeSource,
	writeFunnelEvent,
} from "./api/_lib/analytics";
import type { Bindings } from "./api/_types";

// Edge localization of the SPA's <head>. Crawlers and social scrapers do not
// run the React app, so this rewrites the static index.html per request based
// on the URL's language prefix (/ja, /ko, /zh-TW; default English at /). Keep
// the META map in sync with src/i18n/seo-meta.ts.

const LANGS = ["en", "ja", "ko", "zh-TW"] as const;
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
	"zh-TW": {
		title: "VoiceCrew — 為你的隊伍打造的瀏覽器語音通話",
		description:
			"VoiceCrew 是免安裝、免註冊，只要瀏覽器就能使用的免費即時語音通話。分享一條連結，就能用清晰的語音和隊友交談。",
		ogLocale: "zh_TW",
		ogImage: "/og-image-zh-TW.png",
	},
};

/**
 * What a shared /join/<room> link says in a preview card.
 *
 * The landing META above is a pitch — it answers "what is this service". A
 * reader who has been handed a room is asking something else entirely: "what
 * happens if I tap this, and am I expected?" Showing them the pitch wastes the
 * one surface that decides whether an invite converts.
 *
 * Two variants, because the same URL gets shared in two very different ways:
 *
 *   personal — sent to one person or a small chat. Naming it an invitation is
 *              accurate and is what makes them tap.
 *   open     — posted where anyone can read it (an LFG thread, a stream, a
 *              public timeline). "You're invited" is false there, and it also
 *              reads as bait, so the copy stays neutral.
 *
 * `open` is the default: claiming a stranger was personally invited is the
 * worse mistake of the two, so an unlabelled link never makes that claim.
 */
type InviteMeta = { title: string; description: string };

const INVITE_META: Record<Lang, { personal: InviteMeta; open: InviteMeta }> = {
	en: {
		personal: {
			title: "You've been invited to a voice room — VoiceCrew",
			description:
				"Open the link, enter your Riot ID, and you're talking. No install, no sign-up — it all runs in the browser, and you can leave in one tap.",
		},
		open: {
			title: "A voice room is open — VoiceCrew",
			description:
				"Join from this link. No install, no sign-up — it all runs in the browser. Up to 5 people, and you can leave in one tap.",
		},
	},
	ja: {
		personal: {
			title: "通話に招待されています — VoiceCrew",
			description:
				"リンクを開いて Riot ID を入れるだけで、すぐ話せます。インストールも登録も不要、ブラウザのまま。合わなければワンタップで抜けられます。",
		},
		open: {
			title: "通話ルームが開いています — VoiceCrew",
			description:
				"このリンクから合流できます。インストールも登録も不要、ブラウザのまま。定員5人、合わなければワンタップで抜けられます。",
		},
	},
	ko: {
		personal: {
			title: "음성 대화에 초대받았습니다 — VoiceCrew",
			description:
				"링크를 열고 Riot ID만 입력하면 바로 대화할 수 있습니다. 설치도 가입도 없이 브라우저에서, 맞지 않으면 한 번에 나갈 수 있습니다.",
		},
		open: {
			title: "음성 대화방이 열려 있습니다 — VoiceCrew",
			description:
				"이 링크로 합류할 수 있습니다. 설치도 가입도 없이 브라우저에서. 최대 5명, 맞지 않으면 한 번에 나갈 수 있습니다.",
		},
	},
	"zh-TW": {
		personal: {
			title: "有人邀請你加入語音房 — VoiceCrew",
			description:
				"打開連結、輸入 Riot ID 就能開講。免安裝、免註冊，在瀏覽器裡直接進行，不合適隨時一鍵離開。",
		},
		open: {
			title: "語音房開放中 — VoiceCrew",
			description:
				"從這條連結就能加入。免安裝、免註冊，在瀏覽器裡直接進行。最多 5 人，不合適隨時一鍵離開。",
		},
	},
};

const INVITE_IMAGE: Record<Lang, string> = {
	en: "/og-invite.png",
	ja: "/og-invite-ja.png",
	ko: "/og-invite-ko.png",
	"zh-TW": "/og-invite-zh-TW.png",
};

/**
 * Channels where the link goes to someone in particular. These are the values
 * our own share buttons stamp on the URL, so this is a decision we make when
 * minting the link, not a guess about the reader.
 *
 * "copy" sits here because the product's core flow is copying the link to send
 * to the one player you just matched with. If it turns out to be pasted into
 * public threads more often than not, move it to the open set — the analytics
 * from PR #84 is what would show that.
 */
const PERSONAL_SOURCES = new Set(["copy", "line", "qr"]);

/**
 * Preview copy for a shared room: the personal wording when our own share
 * button minted the link for one person, the neutral wording otherwise.
 * `open` is the default — see INVITE_META for why claiming a stranger was
 * personally invited is the worse of the two mistakes.
 */
export const inviteMetaFor = (lang: Lang, src: string): InviteMeta =>
	INVITE_META[lang][PERSONAL_SOURCES.has(src) ? "personal" : "open"];

const isLang = (value: string | undefined): value is Lang =>
	!!value && (LANGS as readonly string[]).includes(value);

export const langFromPath = (pathname: string): Lang => {
	const seg = pathname.split("/")[1];
	return isLang(seg) && seg !== DEFAULT_LANG ? seg : DEFAULT_LANG;
};

export const stripLang = (pathname: string): string => {
	const parts = pathname.split("/");
	if (isLang(parts[1]) && parts[1] !== DEFAULT_LANG) {
		parts.splice(1, 1);
	}
	const rest = parts.join("/");
	return rest === "" ? "/" : rest;
};

export const localize = (base: string, lang: Lang): string => {
	if (lang === DEFAULT_LANG) return base;
	return base === "/" ? `/${lang}` : `/${lang}${base}`;
};

/**
 * Is this path a shareable room? Shared rooms get invite treatment and must not
 * be indexed.
 *
 * Matches the region-qualified form too (/join/<region>/<id>, which is what the
 * app actually mints — see roomPath in components/VoiceChat). The pattern this
 * replaced ended at a single segment, so region rooms were left indexable.
 * Takes a lang-stripped path (see stripLang).
 */
export const isSessionRoomPath = (basePath: string): boolean =>
	/^\/join\/[^/]+/.test(basePath);

/** Which part of the funnel a page view belongs to. */
export const pageDetail = (basePath: string): string =>
	isSessionRoomPath(basePath)
		? "invite"
		: basePath === "/"
			? "landing"
			: "other";

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

export const onRequest: PagesFunction<Bindings> = async (context) => {
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
	const isSessionRoom = isSessionRoomPath(basePath);
	const src = sanitizeSource(url.searchParams.get("src"));

	// A shared room gets invite copy and the invite card; everything else keeps
	// the landing pitch. Which invite wording depends on how the link was minted
	// — see INVITE_META.
	const invite = isSessionRoom ? inviteMetaFor(lang, src) : null;
	const title = invite?.title ?? meta.title;
	const description = invite?.description ?? meta.description;
	const ogImage = origin + (isSessionRoom ? INVITE_IMAGE[lang] : meta.ogImage);

	// Top of the funnel, counted on the HTML request itself. Landing on an
	// invite is the step no server API sees otherwise, and it is the
	// denominator for "how many invites actually convert into a join".
	writeFunnelEvent(context.env, {
		name: "page_view",
		src,
		ref: sanitizeRef(url.searchParams.get("ref")),
		lang,
		country: context.request.headers.get("CF-IPCountry") ?? "XX",
		visitor: classifyVisitor(context.request.headers.get("User-Agent")),
		detail: pageDetail(basePath),
	});

	const alternates = [...LANGS]
		.map(
			(l) =>
				`<link rel="alternate" hreflang="${l}" href="${escapeAttr(origin + localize(basePath, l))}" />`,
		)
		.join("");
	const xDefault = `<link rel="alternate" hreflang="x-default" href="${escapeAttr(origin + basePath)}" />`;
	const headExtras = alternates + xDefault;

	const rewriter = new HTMLRewriter()
		.on("html", setAttr("lang", lang))
		.on("title", setText(title))
		.on('meta[name="description"]', setAttr("content", description))
		.on('meta[property="og:title"]', setAttr("content", title))
		.on('meta[property="og:description"]', setAttr("content", description))
		.on('meta[property="og:url"]', setAttr("content", selfUrl))
		.on('meta[property="og:image"]', setAttr("content", ogImage))
		.on('meta[property="og:locale"]', setAttr("content", meta.ogLocale))
		.on('meta[name="twitter:title"]', setAttr("content", title))
		.on('meta[name="twitter:description"]', setAttr("content", description))
		.on('meta[name="twitter:image"]', setAttr("content", ogImage))
		.on('link[rel="canonical"]', setAttr("href", selfUrl))
		.on("head", {
			element(el: Element) {
				el.append(headExtras, { html: true });
			},
		});

	// Rewrite the existing robots tag rather than appending a second one. Two
	// robots metas is not an error (crawlers take the most restrictive), but it
	// leaves the page asserting both "index" and "noindex" — and reading the
	// HTML is how anyone would check whether a room is indexable.
	if (isSessionRoom) {
		rewriter.on('meta[name="robots"]', setAttr("content", "noindex, follow"));
	}

	return rewriter.transform(res);
};
