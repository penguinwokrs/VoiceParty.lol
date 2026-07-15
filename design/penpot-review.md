# Reviewing the flow & design in Penpot

This lets you confirm the **design** (tokens/colors/spacing) and the **flow
(導線)** inside Penpot, while code stays the source of truth for the live app.

Two things are brought into Penpot:

1. **Design tokens** — imported from `design/tokens.json` (live, round-trips
   with code via the one-way pipeline).
2. **Screen renders** — the PNGs in `design/screens/`, placed on a board and
   wired with prototype links to reproduce the flow.

## Setup

Use **Penpot Cloud** (https://penpot.app) or self-host:

```bash
docker compose -f docker-compose.penpot.yml up -d   # http://localhost:9001
```

## 1. Import the design tokens

1. Open (or create) a Penpot file → **Tokens** panel.
2. **Import** → select `design/tokens.json`.
3. You can now browse/verify every color, spacing, radius and shadow token.
   These are the same values the app renders (see
   [design-tokens.md](../docs/design-tokens.md)). Edit here, **Export**, save
   back over `design/tokens.json`, then `pnpm tokens:build`.

## 2. Import the screens and build the flow

1. Create a **Board** (or one board per screen).
2. Drag the three PNGs from `design/screens/` onto the canvas, arranged
   left → right in flow order:
   `01-landing` → `02-join` → `03-active-session`.
3. Switch to **Prototype/Interactions** mode and draw connections that mirror
   [flow.md](./flow.md):
   - Landing → Join (the `参加 (Join)` button)
   - Join → Voice room (the `Join Game` button)
   - Voice room → Landing (the `Leave` button)
4. Use **View / Present** to click through the 導線 as a clickable prototype.

> The PNGs are static renders for review. When the UI changes, regenerate them
> (see [flow.md](./flow.md) → "Regenerating the screenshots") and re-import.
> Tokens are the live design surface; screens are reference snapshots.

## Why this split?

Penpot has no supported code→design round-trip for React/MUI. So the **design
system values (tokens)** live-sync one-way from Penpot into code, while the
**rendered screens + flow** are reviewed as imported references. This keeps
`design/tokens.json` authoritative and avoids drift.
