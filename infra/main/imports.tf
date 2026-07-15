# Declarative import blocks (OpenTofu 1.6+ / Terraform 1.5+).
#
# These bring the pre-existing live resources under management without any
# imperative shell step: on a fresh state, the first `tofu apply` imports them;
# once in state they are no-ops. This keeps import reproducible in CI (no manual
# `tofu import` / shell access required).
#
# IDs are "<account_id>/<resource_id>". Safe to keep permanently (idempotent).

import {
  to = cloudflare_workers_kv_namespace.sessions
  id = "ded3682ef149b18dedb1e82650b1cda3/74421f4d32f648e4b6ad64a9ef5498ee"
}

import {
  to = cloudflare_workers_kv_namespace.sessions_preview
  id = "ded3682ef149b18dedb1e82650b1cda3/bfac51e6cf5e4e4388609f68c70f8c5d"
}

import {
  to = cloudflare_pages_project.voiceparty
  id = "ded3682ef149b18dedb1e82650b1cda3/voiceparty"
}
