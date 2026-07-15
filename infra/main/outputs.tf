output "kv_sessions_id" {
  description = "Production KV namespace id — copy into wrangler.toml [[kv_namespaces]].id"
  value       = cloudflare_workers_kv_namespace.sessions.id
}

output "kv_sessions_preview_id" {
  description = "Preview KV namespace id — copy into wrangler.toml [[kv_namespaces]].preview_id"
  value       = cloudflare_workers_kv_namespace.sessions_preview.id
}

output "pages_project_name" {
  value = cloudflare_pages_project.voiceparty.name
}

output "pages_subdomain" {
  description = "Default *.pages.dev subdomain for the project."
  value       = cloudflare_pages_project.voiceparty.subdomain
}
