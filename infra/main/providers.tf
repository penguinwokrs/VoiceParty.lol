provider "cloudflare" {
  # The Cloudflare API token is read from the CLOUDFLARE_API_TOKEN env var.
  # Never hardcode it here. In CI it is injected from the GitHub Environment;
  # locally, export it in your shell (see infra/README.md).
  #
  # This is the HIGH-privilege provisioning token (Pages / KV / DNS edit).
  # It is separate from the low-privilege deploy token used by wrangler.
}
