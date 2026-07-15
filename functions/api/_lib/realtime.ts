import type { Bindings } from "../_types";

// Helper to call RealtimeKit API
export async function callRealtimeKit(
	path: string,
	method: string,
	env: Bindings,
	// biome-ignore lint/suspicious/noExplicitAny: Payload varies
	body?: any,
) {
	const url = `https://api.realtime.cloudflare.com/v2${path}`;
	const auth = btoa(`${env.REALTIME_ORG_ID}:${env.REALTIME_API_KEY}`);
	const response = await fetch(url, {
		method,
		headers: {
			Authorization: `Basic ${auth}`,
			"Content-Type": "application/json",
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`RealtimeKit API Error ${response.status}: ${text}`);
	}

	return response.json();
}

/**
 * Returns the number of participants **currently connected** to a meeting, as
 * reported by RealtimeKit's live "active session" — the authoritative source of
 * presence (unlike our KV `users` list, which is append-only and never pruned).
 *
 * RealtimeKit is the source of truth here, so the caller can trust this for
 * capacity decisions. Returns `null` when the count can't be determined (API
 * error, or an unrecognized response shape) so the caller can fall back to its
 * own roster instead of wrongly rejecting or admitting a join. Returns `0` when
 * there is no active session (nobody is connected yet).
 */
export async function getActiveParticipantCount(
	meetingId: string,
	env: Bindings,
): Promise<number | null> {
	try {
		const url = `https://api.realtime.cloudflare.com/v2/meetings/${meetingId}/active-session`;
		const auth = btoa(`${env.REALTIME_ORG_ID}:${env.REALTIME_API_KEY}`);
		const res = await fetch(url, {
			headers: { Authorization: `Basic ${auth}` },
		});

		// No live session for this meeting => nobody is connected.
		if (res.status === 404) return 0;
		// Any other error => let the caller fall back to its own roster.
		if (!res.ok) return null;

		// biome-ignore lint/suspicious/noExplicitAny: API response is untyped
		const body: any = await res.json();
		const data = body?.data ?? body;

		// Prefer an explicit list of live participants, counting only those still
		// connected (no `left_at`), across the field names RealtimeKit may use.
		const list =
			data?.participants ??
			data?.active_participants ??
			data?.live_participants;
		if (Array.isArray(list)) {
			return list.filter(
				// biome-ignore lint/suspicious/noExplicitAny: untyped participant
				(p: any) => !p?.left_at && p?.status !== "LEFT",
			).length;
		}

		// Otherwise accept a numeric count if the API provides one.
		if (typeof data?.live_participants === "number")
			return data.live_participants;
		if (typeof data?.participant_count === "number")
			return data.participant_count;

		// Unrecognized shape => fall back.
		return null;
	} catch (e) {
		console.error("[RealtimeKit] active-session lookup failed:", e);
		return null;
	}
}
