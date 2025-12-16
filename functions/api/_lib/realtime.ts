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
