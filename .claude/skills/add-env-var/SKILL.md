---
name: add-env-var
description: How to add (or remove) an environment variable / secret for the VoiceParty Cloudflare Pages app. Use whenever adding a new RIOT_*, REALTIME_*, API key, flag, or any env var the Pages Functions read via context.env, or when a var keeps disappearing after deploy. Covers the wrangler.toml (plain) vs `wrangler pages secret put` (secret) split.
---

# Adding an environment variable

The app is a Cloudflare **Pages** project (SPA + Pages Functions under
`functions/`), deployed by the Cloudflare Git integration on push. There is **no
Terraform** — the config in the repo is `wrangler.toml`, and secrets live on the
Pages project.

Pick the owner by kind:

| Kind | Owner | Where the value lives |
|------|-------|-----------------------|
| **Plain / non-secret** (flags, versions, public IDs) | `wrangler.toml [vars]` | committed in `wrangler.toml` |
| **Secret** (API keys, tokens, client secrets) | `wrangler pages secret put` | Cloudflare Pages Functions secret — **never committed, never readable back** |

The app reads either kind the same way in a Pages Function: `context.env.MY_VAR`.

---

## A. Add a PLAIN (non-secret) var

1. Add it under `[vars]` in `wrangler.toml`:
   ```toml
   [vars]
   RIOT_VALIDATION_ENABLED = "false"
   MY_FLAG = "true"          # <- new
   ```
2. Commit + push to `main` → the Git integration builds & deploys it.

---

## B. Add a SECRET

Secrets are never committed. Set them on the Pages project (they persist across
deployments and are injected into Functions):

```bash
export CLOUDFLARE_ACCOUNT_ID=ded3682ef149b18dedb1e82650b1cda3
export CLOUDFLARE_API_TOKEN=<token with "Cloudflare Pages: Edit">

# Prompts for the value (paste it — nothing hits shell history):
npx wrangler pages secret put MY_API_KEY --project-name voiceparty
```

Then trigger a redeploy so the live deployment picks it up (a secret set after a
deploy only reaches Functions on the next deployment) — push any commit, or
`pnpm run deploy`. Read it in the app via `context.env.MY_API_KEY`.

Notes:
- Preview env: add `--environment preview`.
- List names: `npx wrangler pages secret list --project-name voiceparty`.
- **Cloudflare never returns secret values** — keep the source of truth in a
  password manager / secrets vault (see docs/deploy-and-secrets.md), not just
  on Cloudflare.

---

## Verifying / debugging

The definitive check is runtime behavior. Probe the live join flow:

```bash
curl -s -X POST https://voiceparty.pages.dev/api/sessions/probe-1/join \
  -H 'Content-Type: application/json' -d '{"summonerId":"AAA#JP1"}'
# realtime.token should be a long JWT, not "mock-token"; meetingId a real UUID.
```

If a plain var **keeps vanishing after deploy**, it's missing from
`wrangler.toml [vars]` — add it there (section A).

---

## Removing a var

- **Plain:** delete the line from `wrangler.toml [vars]`; deploy.
- **Secret:** `npx wrangler pages secret delete MY_API_KEY --project-name voiceparty`, then redeploy.
