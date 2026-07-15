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

**App secrets (RIOT_*, REALTIME_*, CLOUD_FLARE_API_KEY) are NOT managed by
Terraform.** The app ships via `wrangler pages deploy` (direct upload), and
direct-upload deployments read secrets from **Pages Functions secrets**, not
from the project config Terraform can set. So app secrets go through
`wrangler pages secret put` — see the `add-env-var` skill. (Terraform managing
them via `cloudflare_pages_project.env_vars` left them empty at runtime and
broke production; `pages.tf` now `ignore_changes`es `deployment_configs`.)

Terraform only needs the infra credentials, and its *state* (encrypted in R2) is
gitignored:

- `infra-production` environment (require reviewers):
  `CLOUDFLARE_PROVISION_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
  `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
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

# 3. Init main. Existing live resources are imported declaratively via the
#    import blocks in imports.tf on the first apply (no shell step needed).
cd ../main
export CLOUDFLARE_API_TOKEN=<provision-token>
export AWS_ACCESS_KEY_ID=<r2-access-key-id>
export AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>
# No app secrets needed here — Terraform doesn't manage them (see Credentials).
tofu init

# 4. Reconcile until the plan is clean/intended, then apply (imports + changes).
tofu plan
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
- App secrets/env vars/bindings are owned by the deploy tooling (wrangler.toml +
  `wrangler pages secret put`), not Terraform — `pages.tf` `ignore_changes`es
  `deployment_configs`. See the `add-env-var` skill.
- If you'd rather not enable R2, switch the backend to HCP Terraform (free tier)
  in `versions.tf` — everything else stays the same.
