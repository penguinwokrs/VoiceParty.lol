# Cloudflare Pages project "voiceparty".
#
# Import the existing project (do NOT create a duplicate) with:
#   tofu import cloudflare_pages_project.voiceparty <account_id>/voiceparty
#
# IMPORTANT — Terraform does NOT manage the runtime config (env vars, secrets,
# bindings). The app ships via `wrangler pages deploy` (direct upload), and a
# direct-upload deployment takes its config from wrangler.toml + Pages Functions
# secrets, NOT from the project's deployment_configs that Terraform would set.
# So:
#   - plain vars  -> wrangler.toml [vars]
#   - secrets     -> `wrangler pages secret put <NAME> --project-name voiceparty`
#   - KV bindings -> wrangler.toml [[kv_namespaces]]
# deployment_configs is therefore left to the deploy tooling; the lifecycle
# block below stops Terraform from fighting (or wiping) it. TF still owns the
# durable resources: the project's existence, the KV namespaces, R2, etc.
resource "cloudflare_pages_project" "voiceparty" {
  account_id        = var.account_id
  name              = "voiceparty"
  production_branch = "main"

  build_config = {
    build_command   = "pnpm build"
    destination_dir = "dist"
    root_dir        = ""
  }

  lifecycle {
    # Runtime config is owned by wrangler.toml + `wrangler pages secret put`,
    # not Terraform. Never let an apply reset env vars / secrets / bindings.
    ignore_changes = [deployment_configs]
  }
}

# NOTE: no cloudflare_pages_domain here — voiceparty.lol is not a Cloudflare
# zone on this account and is not attached to the Pages project. Only the
# default voiceparty.pages.dev subdomain is in use. Add a domain resource here
# if/when the custom domain is moved onto Cloudflare.
