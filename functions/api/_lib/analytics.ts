/**
 * Funnel instrumentation on Workers Analytics Engine.
 *
 * Why not a KV counter: KV has no atomic increment, so concurrent writes
 * silently drop increments — exactly the failure mode you cannot detect from
 * the resulting numbers. Analytics Engine is append-only and built for this.
 *
 * Why no public beacon endpoint: every event below is written from a request
 * the server already handles (the HTML request in functions/_middleware.ts, or
 * the session APIs). Nothing here can be spammed by a third party without
 * going through the same rate limits and checks as the real action.
 *
 * PRIVACY: no identifier is written — no Riot ID, no IP, no cookie, no
 * per-visitor ID of any kind. Only a coarse channel tag, language, country and
 * bot/human class. Aggregate and cookieless, per the privacy policy §3.
 *
 * COLUMN LAYOUT (Analytics Engine addresses columns positionally, so this
 * order is the schema — appending is safe, reordering is not):
 *
 *   index1  src        the channel, so sampling is per-channel
 *   blob1   event      page_view | room_created | joined
 *   blob2   src        share channel (see KNOWN_SOURCES)
 *   blob3   ref        partner/streamer tag, "" when absent
 *   blob4   lang       en | ja | ko | zh-TW
 *   blob5   country    CF-IPCountry, "XX" when unknown
 *   blob6   visitor    human | bot
 *   blob7   detail     per-event: landing|invite|other, or new|existing
 *   double1 1          count, so SUM(_sample_interval * double1) is the total
 */

import type { Bindings } from "../_types";

export type FunnelEvent = "page_view" | "room_created" | "joined";

/**
 * Share channels we mint links for. Anything else collapses to "other" so a
 * stranger appending ?src=<random> cannot blow up column cardinality.
 * Add a channel here when you start using it, or its traffic hides in "other".
 */
export const KNOWN_SOURCES = new Set([
	"copy", // "copy link" button
	"x", // X (Twitter) share
	"line", // LINE share
	"qr", // QR code shown on stream
	"lfg", // LFG board / recruitment post
	"stream", // streamer's own on-screen link
	"direct", // no ?src= at all
]);

export const sanitizeSource = (raw: string | null | undefined): string => {
	const value = (raw ?? "").trim().toLowerCase();
	if (!value) return "direct";
	return KNOWN_SOURCES.has(value) ? value : "other";
};

/**
 * Partner/streamer tag. Cardinality is meant to be open here (one value per
 * streamer), so this only bounds the shape, not the set.
 */
export const sanitizeRef = (raw: string | null | undefined): string => {
	const value = (raw ?? "").trim().toLowerCase();
	return /^[a-z0-9_-]{1,32}$/.test(value) ? value : "";
};

/** The UI languages we ship. Anything else is "other" — see LANGS in _middleware. */
export const KNOWN_LANGS = new Set(["en", "ja", "ko", "zh-TW"]);

export const sanitizeLang = (raw: string | null | undefined): string => {
	const value = (raw ?? "").trim();
	return KNOWN_LANGS.has(value) ? value : "other";
};

const BOT_PATTERN =
	/bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot|discordbot|twitterbot|line-?poker|whatsapp|telegrambot|embedly|quora link preview|pinterest|redditbot|applebot|bingpreview|headlesschrome/i;

/**
 * Link-preview scrapers hit every shared invite, so an unfiltered page_view
 * count is mostly robots. Classified rather than dropped, so the noise stays
 * visible (and so a mistake here is recoverable at query time).
 */
export const classifyVisitor = (
	userAgent: string | null | undefined,
): "human" | "bot" => (BOT_PATTERN.test(userAgent ?? "") ? "bot" : "human");

/**
 * Record one funnel event. Never throws and never blocks the response: losing
 * a metric must not cost anyone their call.
 */
export function writeFunnelEvent(
	env: Pick<Bindings, "VC_ANALYTICS">,
	event: {
		name: FunnelEvent;
		src: string;
		ref: string;
		lang: string;
		country: string;
		visitor: "human" | "bot";
		detail: string;
	},
): void {
	// Absent in local dev (`wrangler pages dev` without the binding) and in tests.
	if (!env.VC_ANALYTICS) return;
	try {
		env.VC_ANALYTICS.writeDataPoint({
			indexes: [event.src],
			blobs: [
				event.name,
				event.src,
				event.ref,
				event.lang,
				event.country,
				event.visitor,
				event.detail,
			],
			doubles: [1],
		});
	} catch (e) {
		console.error("[analytics] writeDataPoint failed:", e);
	}
}
