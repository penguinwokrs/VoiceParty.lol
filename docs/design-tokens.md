# Design tokens: Penpot → MUI (one-way pipeline)

Design values (colors, spacing, radius, typography) live in **one source of
truth**, `design/tokens.json`, in the W3C DTCG format that Penpot reads and
writes natively. A build step turns that file into CSS variables and the MUI
theme the React app consumes.

The pipeline is **one-way**: `Penpot → tokens.json → code`. Editing the app's
layout does not flow back into Penpot; only tokenized values (color/space/etc.)
flow from Penpot into the app.

```
Penpot (edit tokens)
   │  Export → "Design tokens (JSON)"
   ▼
design/tokens.json  ────────────────► single source of truth (committed)
   │  pnpm tokens:build  (scripts/build-tokens.mjs)
   ▼
src/theme/tokens.generated.css   →  :root { --color-…; --space-…; }  (imported in main.tsx)
src/theme/tokens.generated.ts    →  tokens{} + cssVar{}  →  src/theme/index.ts (MUI createTheme)
   ▼
React app (MUI theme + CSS variables)
```

## Files

| Path | Role | Edit? |
|------|------|-------|
| `design/tokens.json` | DTCG source of truth | ✅ (Penpot or hand) |
| `scripts/tokens-lib.mjs` | pure transforms (flatten, resolve aliases, render) | ✅ |
| `scripts/build-tokens.mjs` | reads source, writes generated files | ✅ |
| `src/theme/tokens.generated.css` | CSS variables | ❌ generated |
| `src/theme/tokens.generated.ts` | `tokens` (resolved) + `cssVar` refs | ❌ generated |
| `src/theme/index.ts` | builds the MUI theme from tokens | ✅ |

`pnpm tokens:build` regenerates the two `*.generated.*` files. It also runs
automatically as part of `pnpm build`.

## Using tokens in code

- **MUI components** get the values through the theme (`palette.primary`,
  `background`, `shape.borderRadius`, `typography.fontFamily`). Concrete hex
  values are fed to `createTheme` so MUI can still derive hover/contrast colors
  (it cannot do that from a `var(--x)` string).
- **CSS-in-JS / raw CSS** (e.g. `LandingPage.tsx`) reference the CSS variables
  directly: `color: var(--color-brand-gold)`.

Add a new token → put it in `design/tokens.json` → `pnpm tokens:build` → use
`var(--…)` or `tokens["…"]`.

> To review the **design and flow (導線)** in Penpot (import tokens + screen
> renders and wire the prototype), see
> [design/penpot-review.md](../design/penpot-review.md) and
> [design/flow.md](../design/flow.md).

## Editing in Penpot

You can use **Penpot Cloud** (https://penpot.app, no setup) or **self-host**:

```bash
docker compose -f docker-compose.penpot.yml up -d
# http://localhost:9001  → register a local account
```

Then:

1. **Seed Penpot** (first time): in a Penpot file, open **Tokens**, use
   *Import* and select `design/tokens.json` so Penpot starts from the same set.
2. **Edit** token values/sets in Penpot.
3. **Export**: Tokens panel → *Export* → JSON, and save it over
   `design/tokens.json` in this repo.
4. Run `pnpm tokens:build`, review the diff, and commit.

> Penpot follows the W3C DTCG JSON format, so import/export round-trips without
> conversion. Token **names** must match what the code references
> (`color.brand.gold` → `--color-brand-gold`); keep the group/name structure
> stable when editing in Penpot.

## Why not sync back from code?

Penpot has no supported "code → design" round-trip for a React/MUI codebase,
and layout/components in code don't map 1:1 to Penpot objects. Keeping the flow
one-way (design owns tokens, code owns layout) avoids merge conflicts and keeps
`design/tokens.json` authoritative.
