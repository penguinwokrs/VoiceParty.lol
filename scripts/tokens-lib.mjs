// Pure, dependency-free transforms for W3C DTCG design tokens.
// Kept separate from build-tokens.mjs (which does file I/O) so it can be unit
// tested. The pipeline is one-way: design/tokens.json -> these transforms ->
// generated CSS variables + MUI theme token map.

/**
 * Recursively collect leaf tokens (nodes carrying a `$value`).
 * Meta keys starting with `$` (e.g. `$description`) are ignored.
 * @param {Record<string, unknown>} node
 * @param {string[]} [path]
 * @returns {Array<{ path: string[], type: string|undefined, value: unknown }>}
 */
export function flattenTokens(node, path = []) {
	/** @type {Array<{ path: string[], type: string|undefined, value: unknown }>} */
	const out = [];
	for (const [key, value] of Object.entries(node)) {
		if (key.startsWith("$")) continue;
		if (value && typeof value === "object" && "$value" in value) {
			out.push({
				path: [...path, key],
				type: /** @type {any} */ (value).$type,
				value: /** @type {any} */ (value).$value,
			});
		} else if (value && typeof value === "object") {
			out.push(...flattenTokens(/** @type {any} */ (value), [...path, key]));
		}
	}
	return out;
}

/** dot path, e.g. ["color","brand","gold"] -> "color.brand.gold" */
export const dotPath = (path) => path.join(".");

/** CSS custom property name, e.g. ["color","brand","gold"] -> "--color-brand-gold" */
export const cssVarName = (path) => `--${path.join("-")}`;

const ALIAS_RE = /^\{([^}]+)\}$/;

/**
 * Build a flat map of `dot.path` -> resolved concrete value, resolving DTCG
 * aliases like `{color.brand.teal}` (including chained aliases).
 * Throws on unknown or cyclic aliases so a bad token fails the build loudly.
 * @param {Record<string, unknown>} tokensJson
 * @returns {Record<string, string>}
 */
export function buildTokenMap(tokensJson) {
	const leaves = flattenTokens(tokensJson);
	/** @type {Record<string, string>} */
	const raw = {};
	for (const leaf of leaves) raw[dotPath(leaf.path)] = String(leaf.value);

	/** @type {Record<string, string>} */
	const resolved = {};
	const resolve = (key, seen = new Set()) => {
		if (resolved[key] !== undefined) return resolved[key];
		if (seen.has(key)) {
			throw new Error(`Cyclic token alias detected at "${key}"`);
		}
		const value = raw[key];
		if (value === undefined) {
			throw new Error(`Unknown token reference "${key}"`);
		}
		const match = value.match(ALIAS_RE);
		const result = match
			? resolve(match[1].trim(), new Set([...seen, key]))
			: value;
		resolved[key] = result;
		return result;
	};

	for (const key of Object.keys(raw)) resolve(key);
	return resolved;
}

/**
 * Map of `dot.path` -> css var reference, e.g. "color.brand.gold" ->
 * "var(--color-brand-gold)". Handy for type-safe use from components.
 * @param {Record<string, unknown>} tokensJson
 * @returns {Record<string, string>}
 */
export function buildCssVarRefs(tokensJson) {
	/** @type {Record<string, string>} */
	const out = {};
	for (const leaf of flattenTokens(tokensJson)) {
		out[dotPath(leaf.path)] = `var(${cssVarName(leaf.path)})`;
	}
	return out;
}

/**
 * Render the `:root { --token: value; }` CSS block. Values are fully resolved.
 * @param {Record<string, unknown>} tokensJson
 * @returns {string}
 */
export function renderCss(tokensJson) {
	const map = buildTokenMap(tokensJson);
	const lines = flattenTokens(tokensJson).map(
		(leaf) => `  ${cssVarName(leaf.path)}: ${map[dotPath(leaf.path)]};`,
	);
	return `:root {\n${lines.join("\n")}\n}\n`;
}
