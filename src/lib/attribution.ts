/**
 * Where this visit came from, captured once at boot.
 *
 * Held in memory rather than storage on purpose. The value is a channel tag
 * ("line", "x") and an optional partner tag — never an identifier — and
 * keeping it out of localStorage/sessionStorage means this adds nothing to
 * what the privacy policy has to describe, and nothing to clear.
 *
 * The cost is that a page reload mid-flow loses the tag and the join counts as
 * "direct". That undercounts a channel; it never misattributes one.
 *
 * Capture has to happen at boot because joining navigates to the room path
 * first, and react-router drops the query string on the way.
 */

type Attribution = { src: string; ref: string };

let captured: Attribution = { src: "", ref: "" };

/** Read ?src= / ?ref= off the current URL. Call once, as early as possible. */
export const captureAttribution = (
	search: string = window.location.search,
): void => {
	const params = new URLSearchParams(search);
	captured = {
		src: params.get("src") ?? "",
		ref: params.get("ref") ?? "",
	};
};

/**
 * The captured tags, shaped for a request body. The server sanitizes these
 * against its own allowlist, so nothing here needs to be trusted.
 */
export const getAttribution = (): Attribution => captured;
