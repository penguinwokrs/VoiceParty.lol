import type { Bindings } from "../_types";

// Severity weight per report reason. Harassment/hate/illegal count heavily;
// spam/name/other are lighter signals.
const SEVERITY: Record<string, number> = {
	harassment: 3,
	hate: 3,
	illegal: 3,
	spam: 2,
	inappropriate_name: 1,
	other: 1,
};

// Auto-ban policy (Phase 3). A ban requires enough DISTINCT reporters so a
// single (or handful of) malicious reporter(s) cannot cause one, and starts
// SOFT: a short, temporary suspension that a human can review/appeal.
const MIN_DISTINCT_REPORTERS = 3;
const BAN_SCORE_THRESHOLD = 7;
const AUTO_BAN_SECONDS = 24 * 60 * 60; // 24h temporary suspension

type ReportMeta = { r?: string; reason?: string; t?: number };

/**
 * Aggregate the reports stored for one reported user into a risk signal.
 * Distinct reporters is the primary metric (a single reporter, however many
 * times, contributes their single most-severe, recency-decayed weight).
 */
export async function evaluateReports(
	env: Bindings,
	reportedHash: string,
	now: number,
): Promise<{ distinctReporters: number; score: number }> {
	const { keys } = await env.VC_SESSIONS.list({
		prefix: `report:${reportedHash}:`,
		limit: 1000,
	});

	// Per reporter, keep only their strongest (severity × recency) contribution.
	const perReporter = new Map<string, number>();
	for (const k of keys) {
		const m = (k.metadata ?? undefined) as ReportMeta | undefined;
		if (!m?.r) continue;
		const severity = SEVERITY[m.reason ?? "other"] ?? 1;
		const ageDays = m.t ? (now - m.t) / 86_400_000 : 0;
		const decay = ageDays < 7 ? 1 : ageDays < 30 ? 0.5 : 0;
		const weighted = severity * decay;
		perReporter.set(m.r, Math.max(perReporter.get(m.r) ?? 0, weighted));
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
	reportedHash: string,
	now: number,
): Promise<boolean> {
	const { distinctReporters, score } = await evaluateReports(
		env,
		reportedHash,
		now,
	);
	if (
		distinctReporters >= MIN_DISTINCT_REPORTERS &&
		score >= BAN_SCORE_THRESHOLD
	) {
		await env.VC_SESSIONS.put(
			`ban:${reportedHash}`,
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

/** True while the given (hashed) identity is under an active ban. */
export async function isBanned(env: Bindings, hash: string): Promise<boolean> {
	return (await env.VC_SESSIONS.get(`ban:${hash}`)) !== null;
}
