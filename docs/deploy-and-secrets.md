# Deployment & secrets

VoiceCrew is a Cloudflare **Pages** project (`voiceparty`, served at
`voicecrew.pages.dev`). No Terraform — the repo config is `wrangler.toml`.

## Deployment

Cloudflare's **Git integration** builds and deploys on push to `main`
(build command `pnpm build`, output `dist/`). Nothing else is needed.

- **If auto-deploy isn't happening**, reconnect the repo in the dashboard:
  Workers & Pages → `voiceparty` → Settings → Build → connect the Git repository
  (production branch `main`).
- **Manual deploy** (escape hatch), from a clean `main`:
  ```bash
  export CLOUDFLARE_ACCOUNT_ID=ded3682ef149b18dedb1e82650b1cda3
  export CLOUDFLARE_API_TOKEN=<token with Cloudflare Pages: Edit>
  pnpm run deploy        # = pnpm build && wrangler pages deploy dist
  ```
  Don't run manual deploys *and* keep Git auto-deploy fighting over the same
  project config — pick one. Git integration is the default.

## Secrets

Set on the Pages project with wrangler (never committed; injected into Functions
as `context.env.*`):

```bash
npx wrangler pages secret put <NAME> --project-name voiceparty   # paste value
npx wrangler pages secret list --project-name voiceparty
```

Current secrets and where each is (re)generated:

| Secret | Source to regenerate |
|--------|----------------------|
| `REALTIME_ORG_ID`, `REALTIME_API_KEY`, `REALTIME_KIT_APP_ID` | Cloudflare RealtimeKit dashboard (Realtime → Kit) |
| `RIOT_GAME_API_KEY` | Riot Developer Portal |
| `CLOUD_FLARE_API_KEY` | Cloudflare (the token/key the app uses) |

Plain (non-secret) vars live in `wrangler.toml` `[vars]`, not here:

| Var | Effect |
|-----|--------|
| `RIOT_VALIDATION_ENABLED` | `"false"` skips the Riot API lookup on join. |
| `MODERATION_AUTO_BAN_ENABLED` | `"false"` stops reports from issuing automatic 24h bans. Reports are still recorded and the reporter's client still mutes locally — only the automatic suspension stops. Emergency switch for a weaponization pattern; see [moderation.md](./moderation.md) §1.5. |

### Backup / source of truth

**Cloudflare never returns secret values** (write-only). So Cloudflare is *not* a
backup. Keep the canonical values in a **password manager / secrets vault**
(1Password, Bitwarden, Doppler, …). Recovery = pull from the vault →
`wrangler pages secret put`. If the vault copy is ever lost, regenerate at the
sources above (note: regenerating rotates the credential and invalidates the old
value).

## Verify production

```bash
curl -s -X POST https://voicecrew.pages.dev/api/sessions/probe-1/join \
  -H 'Content-Type: application/json' -d '{"summonerId":"AAA#JP1"}'
# realtime.token should be a long JWT (not "mock-token") and meetingId a real UUID.
```
