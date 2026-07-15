variable "account_id" {
  description = "Cloudflare account ID that owns the Pages project and KV namespaces."
  type        = string
  default     = "ded3682ef149b18dedb1e82650b1cda3" # Dev.and.penguin@gmail.com's Account (not secret)
}

# NOTE: voiceparty.lol is NOT a Cloudflare zone on this account (verified via
# API — /zones?name=voiceparty.lol returns empty), and the domain is not
# attached to the Pages project. DNS is therefore managed outside Cloudflare
# and is intentionally out of scope here.
#
# App secrets/env vars are NOT declared here anymore: the runtime config for the
# direct-upload Pages deployment comes from wrangler.toml [vars] and from
# `wrangler pages secret put` (Pages Functions secrets), not from Terraform.
# See pages.tf and the add-env-var skill.
