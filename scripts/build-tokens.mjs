// Generates CSS variables and an MUI-consumable token map from the DTCG source
// at design/tokens.json. Run via `pnpm tokens:build`. One-way pipeline:
//   design/tokens.json (Penpot export)  ->  src/theme/tokens.generated.{css,ts}
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCssVarRefs, buildTokenMap, renderCss } from "./tokens-lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "design", "tokens.json");
const OUT_DIR = join(root, "src", "theme");
const CSS_OUT = join(OUT_DIR, "tokens.generated.css");
const TS_OUT = join(OUT_DIR, "tokens.generated.ts");

const AUTOGEN =
	"AUTO-GENERATED from design/tokens.json by scripts/build-tokens.mjs. Do not edit.";

const tokensJson = JSON.parse(readFileSync(SOURCE, "utf8"));

const tokenMap = buildTokenMap(tokensJson);
const cssVarRefs = buildCssVarRefs(tokensJson);

const css = `/* ${AUTOGEN} */\n${renderCss(tokensJson)}`;

const entries = (obj) =>
	Object.entries(obj)
		.map(([k, v]) => `\t${JSON.stringify(k)}: ${JSON.stringify(v)},`)
		.join("\n");

const ts = `// ${AUTOGEN}
// Concrete resolved values (aliases flattened) for use in the MUI theme.
export const tokens = {
${entries(tokenMap)}
} as const;

// var(--token) references for use in CSS-in-JS / raw CSS.
export const cssVar = {
${entries(cssVarRefs)}
} as const;

export type TokenName = keyof typeof tokens;
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(CSS_OUT, css);
writeFileSync(TS_OUT, ts);

console.log(
	`[tokens] wrote ${Object.keys(tokenMap).length} tokens -> ${CSS_OUT.replace(`${root}/`, "")}, ${TS_OUT.replace(`${root}/`, "")}`,
);
