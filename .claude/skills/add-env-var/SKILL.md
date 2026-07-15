---
name: add-env-var
description: How to add (or remove) an environment variable / secret for the VoiceParty Cloudflare Pages app. Use whenever adding a new RIOT_*, REALTIME_*, API key, flag, or any env var the Pages Functions read via context.env, or when a var keeps disappearing after deploy. Covers the wrangler.toml (plain) vs `wrangler pages secret put` (secret) ownership split.
---

# Adding an environment variable

The app ships via **`wrangler pages deploy` (direct upload)** from `deploy.yml`. A
direct-upload deployment takes its runtime config from **wrangler.toml + Pages
Functions secrets**, NOT from the Cloudflare project's `deployment_configs` that
Terraform can set. **Terraform does not manage env vars/secrets** (see
`infra/main/pages.tf`, which has `ignore_changes = [deployment_configs]`).

Pick the owner by kind — getting it wrong makes the var silently empty at runtime:

| Kind | Owner | Where the value lives |
|------|-------|-----------------------|
| **Plain / non-secret** (flags, versions, public IDs) | `wrangler.toml [vars]` | committed in `wrangler.toml` |
| **Secret** (API keys, tokens, client secrets) | `wrangler pages secret put` | Cloudflare Pages Functions secret — **never committed** |

The app reads either kind the same way in a Pages Function: `context.env.MY_VAR`.

> Hard-won lesson: secrets set via Terraform's `cloudflare_pages_project`
> `env_vars` were **empty at runtime** on direct-upload deployments, which broke
> RealtimeKit in production. Pages Functions secrets MUST go through
> `wrangler pages secret put`.

---

## A. Add a PLAIN (non-secret) var

1. Add it under `[vars]` in `wrangler.toml`:
   ```toml
   [vars]
   RIOT_VALIDATION_ENABLED = "false"
   MY_FLAG = "true"          # <- new
   ```
2. Ship: merge to `main` → `deploy.yml` (`wrangler pages deploy`) applies it. Done.

---

## B. Add a SECRET

Secrets are **not** committed and **not** in Terraform. Set them on the Pages
project; they persist across deployments and are injected into Functions.

```bash
export CLOUDFLARE_ACCOUNT_ID=ded3682ef149b18dedb1e82650b1cda3
export CLOUDFLARE_API_TOKEN=<token with "Cloudflare Pages: Edit">

# Prompts for the value (paste it — nothing hits shell history):
npx wrangler pages secret put MY_API_KEY --project-name voiceparty
```

Then **redeploy** so the current live deployment picks it up (a secret set after
a deploy only reaches Functions on the next deployment):

```bash
pnpm deploy          # or re-run the Deploy workflow / merge to main
```

Read it in the app: `context.env.MY_API_KEY` inside a Pages Function.

Notes:
- To target the preview environment, add `--environment preview`.
- `wrangler pages secret list --project-name voiceparty` shows the names.
- The value never goes in git, wrangler.toml, or Terraform.

---

## Verifying / debugging

The definitive check is runtime behavior — e.g. hit the endpoint that uses the
secret and confirm it doesn't fall back to a mock/error path. To probe the live
join flow:

```bash
curl -s -X POST https://voiceparty.pages.dev/api/sessions/probe-1/join \
  -H 'Content-Type: application/json' -d '{"summonerId":"AAA#JP1"}'
# realtime.token should be a long JWT, not "mock-token"; meetingId a real UUID.
```

To list a deployment's env var *names* (values are hidden): Cloudflare API
`GET /accounts/{account_id}/pages/projects/voiceparty/deployments?env=production`
→ `env_vars`. Account id: `ded3682ef149b18dedb1e82650b1cda3`. Note the API often
redacts secret values to empty, so trust the runtime probe over the API.

If a var **keeps vanishing after deploy**, it's a plain var missing from
`wrangler.toml [vars]` — add it there (section A).

---

## Removing a var

- **Plain:** delete the line from `wrangler.toml [vars]`; deploy.
- **Secret:** `npx wrangler pages secret delete MY_API_KEY --project-name voiceparty`, then redeploy.
