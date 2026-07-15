---
name: add-env-var
description: How to add (or remove) an environment variable / secret for the VoiceParty Cloudflare Pages app. Use whenever adding a new RIOT_*, REALTIME_*, API key, flag, or any env var the Pages Functions read via context.env, or when a var keeps disappearing after deploy. Covers the wrangler.toml (plain) vs Terraform (secret) ownership split.
---

# Adding an environment variable

VoiceParty's Pages config has **two owners**, and picking the wrong one makes the
variable silently disappear on the next deploy. Decide which kind you're adding:

| Kind | Owner | Where the value lives |
|------|-------|-----------------------|
| **Plain / non-secret** (flags, versions, public IDs) | `wrangler.toml [vars]` | committed in `wrangler.toml` |
| **Secret** (API keys, tokens, client secrets) | Terraform (`infra/main`) | GitHub secret + local `terraform.tfvars` — **never committed** |

**Why:** `wrangler pages deploy` (our `deploy.yml`) rewrites the project's *plain*
vars to match `wrangler.toml [vars]` on every production deploy, but leaves
`secret_text` vars untouched. So a plain var that lives only in Terraform gets
dropped on the next deploy (this is exactly what happened to `PNPM_VERSION`).
Rule: **plain vars must be in `wrangler.toml`; secrets must be in Terraform.**

The app reads either kind the same way in a Pages Function: `context.env.MY_VAR`.

---

## A. Add a PLAIN (non-secret) var

1. Add it under `[vars]` in `wrangler.toml`:
   ```toml
   [vars]
   RIOT_VALIDATION_ENABLED = "false"
   MY_FLAG = "true"          # <- new
   ```
2. If Terraform should *also* enforce it (rarely needed), add it to
   `plain_env_raw` in `infra/main/pages.tf` **and keep the value identical** to
   `wrangler.toml`, or the next deploy will drop it. Default is: don't — leave
   plain vars to `wrangler.toml` only.
3. Ship: merge to `main` → `deploy.yml` applies it. Done. No secrets involved.

---

## B. Add a SECRET

Say the new secret is `MY_API_KEY` (env var name the app reads) →
Terraform variable `my_api_key`.

1. **Declare the variable** in `infra/main/variables.tf`:
   ```hcl
   variable "my_api_key" {
     description = "MY_API_KEY — <what it's for>."
     type        = string
     sensitive   = true
     # No default if it MUST exist in prod: a missing value then errors instead
     # of silently deleting the live var. Use default = "" only if genuinely optional.
   }
   ```
2. **Wire it into the Pages env** in `infra/main/pages.tf` — add to `secret_env_raw`:
   ```hcl
   secret_env_raw = {
     # ...existing...
     MY_API_KEY = var.my_api_key
   }
   ```
   (Empty values are filtered out, so optional secrets stay omitted, not deleted.)
3. **Pass it in CI** — add to **both** the `plan` and `apply` env blocks in
   `.github/workflows/infra.yml`:
   ```yaml
   TF_VAR_my_api_key: ${{ secrets.MY_API_KEY }}
   ```
4. **Store the value in GitHub** (the `infra-production` environment; both CI
   jobs use it). Never paste the value in chat — pipe it in:
   ```bash
   gh secret set MY_API_KEY --env infra-production   # prompts for the value
   ```
5. **Store it locally** for local applies — add to `infra/main/terraform.tfvars`
   (gitignored, never committed):
   ```hcl
   my_api_key = "..."
   ```
6. **Apply** (either path):
   - **CI (preferred):** open a PR touching `infra/**` → `Infra` *plan* runs
     under the gated `infra-production` environment (approve it) → merge to
     `main` → gated *apply*.
   - **Local:** from `infra/main`, with `CLOUDFLARE_API_TOKEN` + R2 creds
     (`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`) exported:
     ```bash
     tofu plan -out=tf.plan   # review: 0 to destroy, MY_API_KEY added
     tofu apply tf.plan
     ```
7. **Read it in the app:** `context.env.MY_API_KEY` inside a Pages Function.

> `secret_text` vars are write-only — after apply they always show as a change
> in the next plan. That's expected, not a real diff.

---

## Verifying / debugging

Check the live Pages env var *names* (values are hidden) via the Cloudflare API
— use the connected `cloudflare-api` MCP:
`GET /accounts/{account_id}/pages/projects/voiceparty` →
`deployment_configs.production.env_vars` keys. Account id: `ded3682ef149b18dedb1e82650b1cda3`.

If a var **keeps vanishing after deploy**, it's a plain var that's in Terraform
but not in `wrangler.toml` — move it to `wrangler.toml [vars]` (see section A).

---

## Removing a var

- **Plain:** delete the line from `wrangler.toml [vars]`; deploy.
- **Secret:** remove it from `secret_env_raw` (pages.tf), the variable
  (variables.tf), the `TF_VAR_*` lines (infra.yml), and `terraform.tfvars`;
  apply. Optionally `gh secret delete MY_API_KEY --env infra-production`.
