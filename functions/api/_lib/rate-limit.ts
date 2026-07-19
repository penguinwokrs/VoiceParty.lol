import type { Bindings } from "../_types";

/**
 * Reports one IP may file per window. Sized for a real participant in a bad
 * room (report every other person, twice) and nothing beyond that.
 */
export const REPORT_RATE_LIMIT = 5;
export const REPORT_RATE_WINDOW_SECONDS = 10 * 60;

/**
 * Joins one IP may make per window. Deliberately loose: a household or campus
 * NAT can legitimately put a whole party behind one address, and reconnects
 * re-join. This is not a security control — it caps how fast an automated
 * client can mint RealtimeKit meetings, which cost participant-minutes.
 */
export const JOIN_RATE_LIMIT = 30;
export const JOIN_RATE_WINDOW_SECONDS = 10 * 60;

/**
 * Fixed-window counter in KV, keyed by scope + IP.
 *
 * KV has no atomic increment, so two requests that read the same value both
 * write count+1 and one increment is lost — a burst can slip a few over the
 * limit, and a window boundary lets through up to 2x briefly. That is
 * acceptable because nothing here is load-bearing for correctness: these caps
 * exist to make automated abuse slow and expensive, not to make it impossible.
 * A counter whose exactness mattered would need a Durable Object.
 *
 * Fails open: if KV errors we would rather serve the request than drop a real
 * user's join or report.
 */
export async function consumeQuota(
	env: Pick<Bindings, "VC_SESSIONS">,
	scope: string,
	ip: string | null,
	limit: number,
	windowSeconds: number,
): Promise<boolean> {
	if (!ip) return true;

	const window = Math.floor(Date.now() / (windowSeconds * 1000));
	const key = `rl:${scope}:${ip}:${window}`;

	try {
		const raw = Number((await env.VC_SESSIONS.get(key)) ?? "0");
		const used = Number.isFinite(raw) ? raw : 0;
		if (used >= limit) return false;

		await env.VC_SESSIONS.put(key, String(used + 1), {
			// Two windows, so the key outlives the window it counts.
			expirationTtl: windowSeconds * 2,
		});
		return true;
	} catch (e) {
		console.error(`[rate-limit] ${scope} quota check failed:`, e);
		return true;
	}
}

export const consumeReportQuota = (
	env: Pick<Bindings, "VC_SESSIONS">,
	ip: string | null,
) =>
	consumeQuota(
		env,
		"report",
		ip,
		REPORT_RATE_LIMIT,
		REPORT_RATE_WINDOW_SECONDS,
	);

export const consumeJoinQuota = (
	env: Pick<Bindings, "VC_SESSIONS">,
	ip: string | null,
) => consumeQuota(env, "join", ip, JOIN_RATE_LIMIT, JOIN_RATE_WINDOW_SECONDS);
