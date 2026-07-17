-- Report records, retained with no expiry.
--
-- Riot IDs are stored in the clear (previously HMAC-hashed under a KV key).
-- This is a deliberate operator decision: appeals need the underlying record
-- looked up and answered, child-safety reports need to be preserved for later
-- inquiry, and lawful disclosure requests need answering.
-- The privacy policy (sections 1/7/8/9/10/11) describes this handling. Note the
-- policy deliberately does NOT mention referring reports to Riot Games — that
-- is on hold and unimplemented; do not add it here or in the policy without a
-- purpose-change / consent path (see docs/moderation.md).
--
-- `reporter_riot_id` / `reported_riot_id` hold the normalized (trimmed,
-- lower-cased) form used for matching. `*_riot_id_raw` keeps the string as the
-- user typed it, since Riot IDs are case-preserving for display.
CREATE TABLE reports (
	id                  TEXT PRIMARY KEY,
	session_id          TEXT NOT NULL,
	reporter_riot_id    TEXT NOT NULL,
	reporter_riot_id_raw TEXT NOT NULL,
	reported_riot_id    TEXT NOT NULL,
	reported_riot_id_raw TEXT NOT NULL,
	reason              TEXT NOT NULL,
	note                TEXT,
	created_at          INTEGER NOT NULL
);

-- Auto-ban aggregation reads every report for one reported user, newest first.
CREATE INDEX idx_reports_reported ON reports (reported_riot_id, created_at DESC);

-- One report per (reported, session, reporter): re-reporting the same person in
-- the same room overwrites rather than inflating the count. This mirrors the
-- old KV key shape `report:<reported>:<session>:<reporter>`.
CREATE UNIQUE INDEX idx_reports_dedupe
	ON reports (reported_riot_id, session_id, reporter_riot_id);

-- Disclosure requests ask "what is held about me", which includes reports the
-- user filed, not just ones against them.
CREATE INDEX idx_reports_reporter ON reports (reporter_riot_id, created_at DESC);
