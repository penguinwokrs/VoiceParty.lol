# infra — Cloudflare Infrastructure as Code

Declarative management of the VoiceParty Cloudflare infrastructure with
**OpenTofu** + the Cloudflare provider (v5). State lives in **Cloudflare R2**.
**No secret value is ever committed** — see [Credentials](#credentials).

## Discovered live state (via Cloudflare API)

- Account ID: `ded3682ef149b18dedb1e82650b1cda3`
- Pages project: `voiceparty` (branch `main`, `voiceparty.pages.dev`)
- KV: `VC_SESSIONS` = `74421f4d32f648e4b6ad64a9ef5498ee`,
  `VC_SESSIONS_preview` = `bfac51e6cf5e4e4388609f68c70f8c5d`
- **voiceparty.lol is NOT a Cloudflare zone** and is not attached to Pages →
  DNS / custom domain are out of scope here.
- **R2 is not enabled yet** → must be enabled once before the state backend works.

## Layout

```
infra/
  bootstrap/   # one-time: creates the R2 bucket that stores main's state
  main/        # the actual infra: Pages project + KV namespaces
```

Two-tier model:

| Tier | Where | Token | Frequency |
|------|-------|-------|-----------|
| **Provision** | `infra/main` via `.github/workflows/infra.yml` | high-privilege (`CLOUDFLARE_PROVISION_TOKEN`) | rare, gated by approval |
| **Deploy** | `wrangler` via `.github/workflows/deploy.yml` | low-privilege (`CLOUDFLARE_DEPLOY_TOKEN`, Pages:Edit) | every merge to main |

## Credentials

Secret **values** live only in **GitHub Environment secrets**, never in git.
Terraform declares them as `sensitive` variables read from `TF_VAR_*` at
runtime. Terraform *state* (which contains secrets in plaintext) is stored
encrypted in R2 and is gitignored.

Required GitHub secrets (repo Settings → Environments):

- `infra-production` environment (require reviewers):
  `CLOUDFLARE_PROVISION_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
  `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
  `RIOT_GAME_API_KEY`, `RIOT_CLIENT_ID`, `RIOT_CLIENT_SECRET`,
  `REALTIME_ORG_ID`, `REALTIME_API_KEY`, `REALTIME_KIT_APP_ID`
- `app-production` environment:
  `CLOUDFLARE_DEPLOY_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

## Cloudflare API tokens to create (dashboard — sensitive, done by a human)

1. **Provision token** — Account: *Workers KV Storage:Edit*, *Cloudflare Pages:Edit*,
   *Workers R2 Storage:Edit*.
2. **Deploy token** — Account: *Cloudflare Pages:Edit* only.
3. **R2 S3 token** — R2 → Manage API Tokens → Object Read & Write. Its
   Access Key ID / Secret become `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`.

## First-time setup

```bash
# 0. Enable R2 in the Cloudflare dashboard (one-time; cannot be done via API).

# 1. Bootstrap the state bucket (local state, run once).
cd infra/bootstrap
export CLOUDFLARE_API_TOKEN=<provision-token>
tofu init
tofu apply -var account_id=ded3682ef149b18dedb1e82650b1cda3

# 2. Create the R2 S3 token (dashboard). The account ID is already hardcoded in
#    infra/main/versions.tf backend endpoint.

# 3. Init main, then IMPORT the existing live resources (no recreation).
cd ../main
export CLOUDFLARE_API_TOKEN=<provision-token>
export AWS_ACCESS_KEY_ID=<r2-access-key-id>
export AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>
tofu init
./import.sh

# 4. Reconcile until the plan is clean/intended, then apply.
tofu plan     # confirm env_vars match live
tofu apply
```

## After apply

- `wrangler.toml` KV ids are already correct (`id` + `preview_id` point at the
  two real namespaces).
- From then on, all infra changes go through a PR to `infra/**` → `infra.yml`
  plan → merge → gated apply.

## Notes / caveats

- Provider v5 changed schemas heavily vs v4. If a resource attribute is
  rejected, check the exact shape at
  <https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs>.
- `secret_text` env vars are write-only; after import they always appear as
  "to set" — expected.
- If you'd rather not enable R2, switch the backend to HCP Terraform (free tier)
  in `versions.tf` — everything else stays the same.
