import type { Bindings } from "../_types";
import { listReportsAgainst, normalizeRiotId } from "./reports";

// Severity weight per report reason. Harassment/hate/illegal count heavily;
// spam/name/other are lighter signals.
// child_safety is deliberately absent: it is handled out-of-band and must never
// feed the automatic score (a single reporter must be able to escalate, and the
// category is too severe to let a score-based auto-ban be weaponized).
const SEVERITY: Record<string, number> = {
	harassment: 3,
	hate: 3,
	illegal: 3,
	cheating: 1,
	spam: 2,
	inappropriate_name: 1,
	other: 1,
};
const CHILD_SAFETY_REASON = "child_safety";

// Auto-ban policy (Phase 3). A ban requires enough DISTINCT reporters so a
// single (or handful of) malicious reporter(s) cannot cause one, and starts
// SOFT: a short, temporary suspension that a human can review/appeal.
const MIN_DISTINCT_REPORTERS = 3;
const BAN_SCORE_THRESHOLD = 7;
const AUTO_BAN_SECONDS = 24 * 60 * 60; // 24h temporary suspension

/**
 * Aggregate the reports stored for one reported user into a risk signal.
 * Distinct reporters is the primary metric (a single reporter, however many
 * times, contributes their single most-severe, recency-decayed weight).
 *
 * Reports are now retained permanently, so the recency decay below — not a
 * store TTL — is what keeps old reports from accumulating into a ban forever.
 * Anything older than 30 days contributes nothing, which is the behaviour the
 * previous 30-day KV TTL produced.
 */
export async function evaluateReports(
	env: Bindings,
	reported: string,
	now: number,
): Promise<{ distinctReporters: number; score: number }> {
	const rows = await listReportsAgainst(env, reported);

	// Per reporter, keep only their strongest (severity × recency) contribution.
	const perReporter = new Map<string, number>();
	for (const row of rows) {
		if (row.reason === CHILD_SAFETY_REASON) continue;
		const severity = SEVERITY[row.reason] ?? 1;
		const ageDays = row.created_at ? (now - row.created_at) / 86_400_000 : 0;
		const decay = ageDays < 7 ? 1 : ageDays < 30 ? 0.5 : 0;
		const weighted = severity * decay;
		// A fully-decayed report contributes nothing and must not count its
		// reporter toward the distinct-reporter total.
		if (weighted > 0) {
			const key = row.reporter_riot_id;
			perReporter.set(key, Math.max(perReporter.get(key) ?? 0, weighted));
		}
	}

	let score = 0;
	for (const v of perReporter.values()) score += v;
	return { distinctReporters: perReporter.size, score };
}

/**
 * Evaluate a reported user and, if over threshold, write a temporary ban.
 * Returns true if a ban was (re)issued. Safe to call on every new report.
 */
export async function maybeAutoBan(
	env: Bindings,
	reported: string,
	now: number,
): Promise<boolean> {
	const { distinctReporters, score } = await evaluateReports(
		env,
		reported,
		now,
	);
	if (
		distinctReporters >= MIN_DISTINCT_REPORTERS &&
		score >= BAN_SCORE_THRESHOLD
	) {
		await env.VC_SESSIONS.put(
			`ban:${normalizeRiotId(reported)}`,
			JSON.stringify({
				createdAt: now,
				source: "auto",
				score,
				distinctReporters,
			}),
			{ expirationTtl: AUTO_BAN_SECONDS },
		);
		return true;
	}
	return false;
}

/** True while the given identity is under an active ban. */
export async function isBanned(
	env: Bindings,
	riotId: string,
): Promise<boolean> {
	return (await env.VC_SESSIONS.get(`ban:${normalizeRiotId(riotId)}`)) !== null;
}
