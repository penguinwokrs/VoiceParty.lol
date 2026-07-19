import type { Bindings } from "../_types";

/**
 * Reports one IP may file per window. Sized for a real participant in a bad
 * room (report every other person, twice) and nothing beyond that.
 */
export const REPORT_RATE_LIMIT = 5;
export const REPORT_RATE_WINDOW_SECONDS = 10 * 60;

/**
 * Fixed-window counter in KV, keyed by IP.
 *
 * KV has no atomic increment, so two requests that read the same value both
 * write count+1 and one increment is lost — a burst can slip a few over the
 * limit. That is acceptable here because this is the SECOND line of defence:
 * the roster check in the report route is what actually stops a fabricated
 * reporter, and this only caps how fast a genuine participant can spray.
 * A counter whose correctness mattered would need a Durable Object.
 *
 * Fails open: if KV errors we would rather accept a report than drop a real
 * one, since the roster check has already run.
 */
export async function consumeReportQuota(
	env: Bindings,
	ip: string | null,
): Promise<boolean> {
	if (!ip) return true;

	const window = Math.floor(Date.now() / (REPORT_RATE_WINDOW_SECONDS * 1000));
	const key = `rl:report:${ip}:${window}`;

	try {
		const used = Number((await env.VC_SESSIONS.get(key)) ?? "0");
		if (Number.isFinite(used) && used >= REPORT_RATE_LIMIT) return false;

		await env.VC_SESSIONS.put(
			key,
			String((Number.isFinite(used) ? used : 0) + 1),
			{
				// Two windows, so the key outlives the window it counts.
				expirationTtl: REPORT_RATE_WINDOW_SECONDS * 2,
			},
		);
		return true;
	} catch (e) {
		console.error("[rate-limit] report quota check failed:", e);
		return true;
	}
}
