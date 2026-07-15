# Cloudflare Pages project "voiceparty".
#
# Import the existing project (do NOT create a duplicate) with:
#   tofu import cloudflare_pages_project.voiceparty <account_id>/voiceparty
# then `tofu plan` and reconcile any drift between this file and the live config.
#
# NOTE on secrets: env vars of type "secret_text" are write-only — Cloudflare
# never returns their values, so after import they show as needing to be set.
# That is expected; applying re-seals them from the TF_VAR_* values.

locals {
  # Secret env vars, keyed by the name the Pages Function reads. Empty values
  # are filtered out so that disabled integrations (e.g. RSO while awaiting
  # approval) don't push empty secrets to Cloudflare.
  secret_env_raw = {
    RIOT_GAME_API_KEY   = var.riot_game_api_key
    RIOT_CLIENT_ID      = var.riot_client_id
    RIOT_CLIENT_SECRET  = var.riot_client_secret
    REALTIME_ORG_ID     = var.realtime_org_id
    REALTIME_API_KEY    = var.realtime_api_key
    REALTIME_KIT_APP_ID = var.realtime_kit_app_id
    CLOUD_FLARE_API_KEY = var.cloud_flare_api_key
  }

  secret_env_vars = {
    for k, v in local.secret_env_raw : k => { type = "secret_text", value = v }
    if v != ""
  }

  plain_env_raw = {
    RIOT_VALIDATION_ENABLED = "false"
    PNPM_VERSION            = var.pnpm_version
  }

  plain_env_vars = {
    for k, v in local.plain_env_raw : k => { type = "plain_text", value = v }
    if v != ""
  }
}

resource "cloudflare_pages_project" "voiceparty" {
  account_id        = var.account_id
  name              = "voiceparty"
  production_branch = "main"

  build_config = {
    build_command   = "pnpm build"
    destination_dir = "dist"
    root_dir        = ""
  }

  deployment_configs = {
    production = {
      compatibility_date = "2024-04-01"

      kv_namespaces = {
        VC_SESSIONS = { namespace_id = cloudflare_workers_kv_namespace.sessions.id }
      }

      env_vars = merge(local.plain_env_vars, local.secret_env_vars)
    }

    preview = {
      compatibility_date = "2024-04-01"

      kv_namespaces = {
        VC_SESSIONS = { namespace_id = cloudflare_workers_kv_namespace.sessions_preview.id }
      }

      env_vars = merge(local.plain_env_vars, local.secret_env_vars)
    }
  }
}

# NOTE: no cloudflare_pages_domain here — voiceparty.lol is not a Cloudflare
# zone on this account and is not attached to the Pages project. Only the
# default voiceparty.pages.dev subdomain is in use. Add a domain resource here
# if/when the custom domain is moved onto Cloudflare.
