import type { Bindings } from "../_types";

// App-specific default so identifiers are never stored in the clear even before
// a dedicated secret is provisioned. Set REPORT_SALT to strengthen this.
const DEFAULT_SALT = "voiceparty-report-salt-v1";

const toHex = (buf: ArrayBuffer): string =>
	Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

/**
 * Pseudonymize a Summoner ID for storage: HMAC-SHA256 keyed by REPORT_SALT.
 * The value is lower-cased and trimmed first so the same identity maps to a
 * stable hash (and to resist trivial case-based evasion). Raw IDs are never
 * persisted; the hash is stable enough to count and, later, to key bans on.
 */
export async function hashId(value: string, env: Bindings): Promise<string> {
	const salt = env.REPORT_SALT || DEFAULT_SALT;
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		enc.encode(salt),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign(
		"HMAC",
		key,
		enc.encode(value.trim().toLowerCase()),
	);
	return toHex(sig);
}
