-- Funnel counters: page_view -> room_created -> joined, by share channel.
--
-- Aggregate and identifier-free. No Riot ID, no IP, no cookie, no per-visitor
-- ID — only coarse dimensions (channel, language, country, bot/human class).
-- This keeps it inside the privacy policy's cookieless-aggregate analytics
-- (§3) and means the table needs no retention limit: there is nothing to
-- delete, so rows are kept indefinitely. Unlike `reports`, this carries no PII.
--
-- One row per (day x event x src x ref x lang x country x visitor x detail),
-- incremented with UPSERT (INSERT ... ON CONFLICT DO UPDATE SET count=count+1).
-- SQLite makes that increment atomic within the statement — the property KV
-- lacked and the reason Analytics Engine was originally reached for. D1 gives
-- it for free, on a binding this project already has and already deploys,
-- without the Workers Paid plan that Analytics Engine requires.
--
-- The primary key doubles as the conflict target and the query index, so
-- GROUP BY over any prefix of these columns is cheap.
CREATE TABLE IF NOT EXISTS funnel_stats (
	day      TEXT    NOT NULL, -- YYYY-MM-DD (UTC)
	event    TEXT    NOT NULL, -- page_view | room_created | joined
	src      TEXT    NOT NULL, -- share channel (allowlisted) or 'other'/'direct'
	ref      TEXT    NOT NULL, -- partner/streamer tag, '' when absent
	lang     TEXT    NOT NULL, -- en | ja | ko | zh-TW | other
	country  TEXT    NOT NULL, -- CF-IPCountry, 'XX' when unknown
	visitor  TEXT    NOT NULL, -- human | bot
	detail   TEXT    NOT NULL, -- per-event: landing|invite|other, or new|existing
	count    INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (day, event, src, ref, lang, country, visitor, detail)
);
