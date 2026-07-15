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
# ---------------------------------------------------------------------------

variable "riot_game_api_key" {
  description = "Riot Games API key (RIOT_GAME_API_KEY)."
  type        = string
  sensitive   = true
  default     = ""
}

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

variable "realtime_org_id" {
  description = "Cloudflare Realtime org ID (REALTIME_ORG_ID)."
  type        = string
  sensitive   = true
  default     = ""
}

variable "realtime_api_key" {
  description = "Cloudflare Realtime API key (REALTIME_API_KEY)."
  type        = string
  sensitive   = true
  default     = ""
}

variable "realtime_kit_app_id" {
  description = "RealtimeKit app ID (REALTIME_KIT_APP_ID)."
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloud_flare_api_key" {
  description = "CLOUD_FLARE_API_KEY used by the app in production."
  type        = string
  sensitive   = true
  default     = ""
}

variable "pnpm_version" {
  description = "PNPM_VERSION build var (currently set on the live project)."
  type        = string
  default     = ""
}
