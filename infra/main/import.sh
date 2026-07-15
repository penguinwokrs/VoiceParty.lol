#!/usr/bin/env bash
# Import existing Cloudflare resources into Terraform state so the live infra
# comes under code management WITHOUT recreating anything.
#
# Prereqs (run from infra/main after `tofu init`):
#   export CLOUDFLARE_API_TOKEN=...     # high-privilege provisioning token
#   export AWS_ACCESS_KEY_ID=...        # R2 S3 token (state backend)
#   export AWS_SECRET_ACCESS_KEY=...
# account_id defaults in variables.tf; override with TF_VAR_account_id if needed.
#
# After running, ALWAYS `tofu plan` and reconcile drift (esp. Pages env_vars)
# until the plan is empty or shows only intended changes.
set -euo pipefail

ACCOUNT="${TF_VAR_account_id:-ded3682ef149b18dedb1e82650b1cda3}"

echo "==> Import production KV namespace (VC_SESSIONS)"
tofu import cloudflare_workers_kv_namespace.sessions "${ACCOUNT}/74421f4d32f648e4b6ad64a9ef5498ee"

echo "==> Import preview KV namespace (VC_SESSIONS_preview)"
tofu import cloudflare_workers_kv_namespace.sessions_preview "${ACCOUNT}/bfac51e6cf5e4e4388609f68c70f8c5d"

echo "==> Import Pages project 'voiceparty'"
tofu import cloudflare_pages_project.voiceparty "${ACCOUNT}/voiceparty"

echo
echo "Done. Now run: tofu plan  (reconcile env_vars, then: tofu apply)"
