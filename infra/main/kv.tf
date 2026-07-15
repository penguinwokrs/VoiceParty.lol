# KV namespaces backing VC_SESSIONS. Both already exist (verified via API) and
# are IMPORTED — Terraform must not recreate them.
#
#   tofu import cloudflare_workers_kv_namespace.sessions         <account_id>/74421f4d32f648e4b6ad64a9ef5498ee
#   tofu import cloudflare_workers_kv_namespace.sessions_preview <account_id>/bfac51e6cf5e4e4388609f68c70f8c5d
resource "cloudflare_workers_kv_namespace" "sessions" {
  account_id = var.account_id
  title      = "VC_SESSIONS"
}

resource "cloudflare_workers_kv_namespace" "sessions_preview" {
  account_id = var.account_id
  title      = "VC_SESSIONS_preview"
}
