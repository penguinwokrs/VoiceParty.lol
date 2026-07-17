import type { LanguageCode } from ".";

export type SeoMeta = {
	title: string;
	description: string;
	ogLocale: string;
	ogImage: string;
};

// Per-language document metadata. This is the single source of truth used by
// the client (LangLayout) for client-side navigation. The Cloudflare Pages
// edge middleware (functions/_middleware.ts) keeps an in-sync copy so that
// crawlers and social scrapers — which do not run the React app — still get
// correct, localized <head> tags.
export const seoMeta: Record<LanguageCode, SeoMeta> = {
	en: {
		title: "Partyline — Real-time browser voice chat for your team",
		description:
			"Partyline is a free, browser-based real-time voice chat for gaming teams. No install, no sign-up — share a link and talk with crystal-clear voice.",
		ogLocale: "en_US",
		ogImage: "/og-image.png",
	},
	ja: {
		title: "Partyline — チームのためのブラウザ完結ボイスチャット",
		description:
			"Partyline は、インストール不要・登録不要でブラウザだけで使える無料のリアルタイム・ボイスチャット。リンクを共有するだけで、クリアな音声でチームと会話できます。",
		ogLocale: "ja_JP",
		ogImage: "/og-image-ja.png",
	},
	ko: {
		title: "Partyline — 팀을 위한 브라우저 음성 채팅",
		description:
			"Partyline는 설치·가입 없이 브라우저만으로 사용하는 무료 실시간 음성 채팅입니다. 링크만 공유하면 선명한 음성으로 팀과 대화할 수 있습니다.",
		ogLocale: "ko_KR",
		ogImage: "/og-image-ko.png",
	},
};
