/**
 * Funnel instrumentation on D1 aggregate counters.
 *
 * Why D1 counters and not Analytics Engine: AE is not in the Workers Free plan,
 * and this account has no Workers Paid subscription, so the AE binding failed
 * the Pages deploy. D1 is already bound (VC_DB) and already deploys. A per-
 * dimension counter row incremented with UPSERT gives the one property KV
 * lacked — an ATOMIC increment (INSERT ... ON CONFLICT DO UPDATE SET
 * count=count+1 is atomic within the statement in SQLite) — which was the
 * reason AE was reached for in the first place. Same aggregate query story
 * (GROUP BY), same privacy shape, no plan upgrade. See docs/analytics.md.
 *
 * At cold-start volume the write-per-event cost is far under D1's free write
 * limit; if bot page_views ever push it, drop or sample them (they are already
 * classified). Storage is bounded: one row per dimension-combo per day.
 *
 * Why no public beacon endpoint: every event below is written from a request
 * the server already handles (the HTML request in functions/_middleware.ts, or
 * the session APIs). Nothing here can be spammed by a third party without
 * going through the same rate limits and checks as the real action.
 *
 * PRIVACY: no identifier is written — no Riot ID, no IP, no cookie, no
 * per-visitor ID of any kind. Only a coarse channel tag, language, country and
 * bot/human class. Aggregate and cookieless, per the privacy policy §3. With no
 * PII stored there is nothing to expire, so rows are kept indefinitely.
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

export type FunnelEventInput = {
	name: FunnelEvent;
	src: string;
	ref: string;
	lang: string;
	country: string;
	visitor: "human" | "bot";
	detail: string;
};

/** UTC calendar day (YYYY-MM-DD) that a counter row is bucketed under. */
export const funnelDay = (now: number): string =>
	new Date(now).toISOString().slice(0, 10);

/**
 * Record one funnel event by incrementing its counter row. Never throws:
 * losing a metric must not cost anyone their call. Callers run it under
 * waitUntil so it never blocks the response either.
 *
 * The write is a single UPSERT; the increment is atomic within the statement.
 * Resilient to the table not existing yet (before migration 0002 is applied),
 * so a deploy is safe ahead of activation — it just records nothing until then.
 */
export async function writeFunnelEvent(
	env: Pick<Bindings, "VC_DB">,
	event: FunnelEventInput,
	now: number = Date.now(),
): Promise<void> {
	// Absent in unit tests that don't stub D1.
	if (!env.VC_DB) return;
	try {
		await env.VC_DB.prepare(
			`INSERT INTO funnel_stats
				(day, event, src, ref, lang, country, visitor, detail, count)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
			 ON CONFLICT (day, event, src, ref, lang, country, visitor, detail)
			 DO UPDATE SET count = count + 1`,
		)
			.bind(
				funnelDay(now),
				event.name,
				event.src,
				event.ref,
				event.lang,
				event.country,
				event.visitor,
				event.detail,
			)
			.run();
	} catch (e) {
		console.error("[analytics] funnel write failed:", e);
	}
}
