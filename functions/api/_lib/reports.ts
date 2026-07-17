import type { Bindings, ReportRecord } from "../_types";

/**
 * Normalize a Riot ID for matching: trimmed and lower-cased, so the same
 * identity always collides (and case-flipping cannot evade a ban).
 * The raw string is stored alongside for display.
 */
export const normalizeRiotId = (value: string): string =>
	value.trim().toLowerCase();

/**
 * Persist one report. Retained with no expiry — see migrations/0001 and the
 * privacy policy. Re-reporting the same person in the same room replaces the
 * prior row instead of adding a second one, so a single reporter cannot inflate
 * the auto-ban score by spamming the button.
 */
export async function recordReport(
	env: Bindings,
	report: {
		sessionId: string;
		reporter: string;
		reported: string;
		reason: string;
		note?: string;
		createdAt: number;
	},
): Promise<void> {
	await env.VC_DB.prepare(
		`INSERT INTO reports (
			id, session_id,
			reporter_riot_id, reporter_riot_id_raw,
			reported_riot_id, reported_riot_id_raw,
			reason, note, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (reported_riot_id, session_id, reporter_riot_id)
		DO UPDATE SET reason = excluded.reason,
		              note = excluded.note,
		              created_at = excluded.created_at`,
	)
		.bind(
			crypto.randomUUID(),
			report.sessionId,
			normalizeRiotId(report.reporter),
			report.reporter.trim(),
			normalizeRiotId(report.reported),
			report.reported.trim(),
			report.reason,
			report.note ?? null,
			report.createdAt,
		)
		.run();
}

/**
 * All reports filed against one user, newest first. Used by the auto-ban
 * aggregator; also the basis for answering a disclosure request.
 */
export async function listReportsAgainst(
	env: Bindings,
	reported: string,
): Promise<ReportRecord[]> {
	const { results } = await env.VC_DB.prepare(
		`SELECT reporter_riot_id, reason, created_at
		 FROM reports
		 WHERE reported_riot_id = ?
		 ORDER BY created_at DESC
		 LIMIT 1000`,
	)
		.bind(normalizeRiotId(reported))
		.all<ReportRecord>();
	return results ?? [];
}
