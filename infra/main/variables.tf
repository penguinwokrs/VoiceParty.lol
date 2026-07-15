variable "account_id" {
  description = "Cloudflare account ID that owns the Pages project and KV namespaces."
  type        = string
  default     = "ded3682ef149b18dedb1e82650b1cda3" # Dev.and.penguin@gmail.com's Account (not secret)
}

# NOTE: voiceparty.lol is NOT a Cloudflare zone on this account (verified via
# API — /zones?name=voiceparty.lol returns empty), and the domain is not
# attached to the Pages project. DNS is therefore managed outside Cloudflare
# and is intentionally out of scope here. If the domain is later moved onto
# Cloudflare, add a zone_id variable + cloudflare_dns_record / cloudflare_pages_domain.

# ---------------------------------------------------------------------------
# Application secrets.
#
# Declared here but their VALUES are never committed. Supplied at runtime as
# TF_VAR_* env vars from the GitHub Environment (CI) or your shell (local).
#
# REQUIRED secrets have NO default on purpose: env_vars filters out empty
# values, so a missing secret would otherwise be silently DELETED from the live
# Pages project on apply. With no default, tofu errors out ("No value for
# required variable") instead — fail-safe rather than destructive.
# ---------------------------------------------------------------------------

variable "riot_game_api_key" {
  description = "Riot Games API key (RIOT_GAME_API_KEY). Required — set on the live project."
  type        = string
  sensitive   = true
}

variable "realtime_org_id" {
  description = "Cloudflare Realtime org ID (REALTIME_ORG_ID). Required — set on the live project."
  type        = string
  sensitive   = true
}

variable "realtime_api_key" {
  description = "Cloudflare Realtime API key (REALTIME_API_KEY). Required — set on the live project."
  type        = string
  sensitive   = true
}

variable "realtime_kit_app_id" {
  description = "RealtimeKit app ID (REALTIME_KIT_APP_ID). Required — set on the live project."
  type        = string
  sensitive   = true
}

variable "cloud_flare_api_key" {
  description = "CLOUD_FLARE_API_KEY used by the app in production. Required — set on the live project."
  type        = string
  sensitive   = true
}

# Optional secrets: genuinely absent on the live project today (RSO validation
# disabled), so an empty default is correct — they stay omitted, not deleted.
variable "riot_client_id" {
  description = "Riot Sign-On client ID (RIOT_CLIENT_ID). Empty while RSO validation is disabled."
  type        = string
  sensitive   = true
  default     = ""
}

variable "riot_client_secret" {
  description = "Riot Sign-On client secret (RIOT_CLIENT_SECRET). Empty while RSO validation is disabled."
  type        = string
  sensitive   = true
  default     = ""
}

# Non-secret env vars.
# NOTE: PNPM_VERSION is intentionally NOT managed here. It only mattered to
# Cloudflare's build system, which we no longer use (builds run in GitHub
# Actions and deploy via `wrangler pages deploy`). Plain vars are owned by
# wrangler.toml [vars]; managing PNPM_VERSION in TF just churned against every
# production deploy.
variable "riot_validation_enabled" {
  description = "RIOT_VALIDATION_ENABLED flag. Set to \"true\" once RSO production approval is granted."
  type        = string
  default     = "false"
}
