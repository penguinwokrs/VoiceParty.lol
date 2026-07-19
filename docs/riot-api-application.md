# Riot API / RSO Application Text

Submission text for the Riot Developer Portal (production API key & RSO
application). The **English** section is the submission-ready copy; the
**日本語** section is an internal reference translation (do not submit).

The app is described in its **current, shipped** state — that is what a
reviewer sees when they open the site. The **planned RSO integration** is
described separately and clearly labelled, so nothing in the current-state
description depends on access we do not yet have.

- Last updated: 2026-07-19
- Related: [Riot compliance self-audit](./riot-compliance.md) ·
  [Data handling](./data-handling.md)

---

## Submission text — extended (English)

Use when there is no meaningful character limit.

**Product Name:** VoiceCrew

**Product URL:** https://voicecrew.pages.dev

**Category:** Web application — voice chat companion for League of Legends

### Short description

VoiceCrew is a browser-based voice chat for League of Legends players. A player
enters their Riot ID, gets a private room link, and shares it with the people
they want to talk to while playing. Up to 5 people talk over WebRTC. There is
nothing to install, no account to create, and the app never touches the game
client.

The purpose of the Riot API in this product is **identity**: so that the names
and avatars shown in a voice room are verified Riot accounts rather than
free-text nicknames anyone could type.

### How it works today (current, under-review version)

1. **Open the site.** A room ID is generated automatically (a 12-character
   random ID) — players never type or guess one. Following an invite link
   (`/join/{region}/{roomId}`) uses that room instead.
2. **Enter a Riot ID and platform.** The player types their Riot ID in
   `GameName#TagLine` form and picks their platform/region (NA, EUW, KR, JP …)
   from a list. On a first join the player also passes a 13+ age gate and
   accepts the Terms of Service and Privacy Policy.
3. **Press Join.** This is always an explicit action — arriving from someone
   else's invite link pre-fills the form but never drops a player into a live
   microphone session automatically.
4. **The backend verifies the identity.** It calls **ACCOUNT-V1** to confirm
   the Riot ID exists and resolve the PUUID, then **SUMMONER-V4** to read the
   `profileIconId`, and renders the icon from the public **Data Dragon** CDN.
   A Riot ID that cannot be verified is refused.
5. **The player is in the voice room.** They can mute/unmute themselves,
   adjust the volume of or locally mute individual participants, see who is
   present (Riot ID + profile icon), copy the invite link to bring friends in,
   report a participant for abuse, and leave at any time.

Rooms hold at most 5 participants and are ephemeral — the room record expires
automatically after 6 hours of inactivity.

### Riot API usage (current)

Everything below runs server-side on Cloudflare Workers with the API key held
as a platform secret; the key is never exposed to the browser.

| API | Endpoint | Why we call it |
|---|---|---|
| **ACCOUNT-V1** | `GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}` | Confirm the Riot ID is a real account and resolve its PUUID. This is the anti-impersonation check — an unverifiable Riot ID cannot join. |
| **SUMMONER-V4** | `GET /lol/summoner/v4/summoners/by-puuid/{puuid}` | Read `profileIconId` so the player's own avatar is shown in the room. |
| **Data Dragon** (public CDN, no key) | `/api/versions.json`, `/cdn/{version}/img/profileicon/{id}.png` | Render the profile icon image at the current patch version. |

**Call volume:** one ACCOUNT-V1 call and one SUMMONER-V4 call per join — a few
calls per player per session, with no polling. Data Dragon version lookups are
cached for an hour.

**APIs we do not use:** MATCH-V5, LEAGUE-V4 / rank, CHAMPION-MASTERY-V4,
SPECTATOR-V5, or any other endpoint returning match history, rank, or gameplay
data. We request only what identity display requires.

**Compliance:** all traffic is HTTPS; Riot rate limits are respected and
failures degrade gracefully (a failed icon lookup shows no avatar rather than
blocking the call); the required "not endorsed by Riot Games" disclaimer
appears in the footer of every page; no Riot logos or Press Kit assets are
used.

### Data handling

- **Stored temporarily:** room membership (Riot ID, join time, icon URL) in
  Cloudflare KV, auto-expiring after 6 hours.
- **Stored durably:** user abuse reports, for moderation and safety review.
- **Never collected:** match history, rank, MMR, payment data, or voice
  recordings. Voice is peer-delivered WebRTC audio and is not recorded by us.
- PUUIDs are used transiently to complete the icon lookup; the product builds
  no profile, leaderboard, or rating from Riot data.

### Safety and moderation

Players can report a participant (harassment, hate, child safety, cheating,
spam, and others). Reporting immediately mutes that participant locally for the
reporter, and repeated reports trigger an automatic temporary suspension.
Child-safety reports are escalated for human review rather than being handled
by the automatic scoring. A 13+ age gate applies before the first join, and the
Terms disclose that participants may themselves stream or record a call.

### Planned RSO integration (after approval)

Once RSO (Riot Sign-On) access is granted, the manual Riot ID field is
**removed entirely**: the player signs in with their Riot account, and identity
(PUUID, `GameName#TagLine`, profile icon) is obtained automatically through RSO
+ ACCOUNT-V1. This is the main reason we are applying — it replaces a
self-declared name with a Riot-verified one and eliminates impersonation, which
matters a great deal for a product whose entire surface is strangers talking to
each other by voice.

A further step we are **evaluating but have not committed to** is auto-detecting
the current match (SPECTATOR-V5) so teammates land in the same room with no
input at all. We would ship this only with explicit per-player opt-in and
without placing opposing-team players together, since an automatic live-match
room could otherwise reveal a player's presence to people they did not choose
to share it with. Until that design is settled, the feature stays unbuilt.

### Tech stack

Cloudflare Pages + Pages Functions (Workers runtime), Cloudflare KV for
ephemeral session state, Cloudflare D1 for moderation records, and Cloudflare
RealtimeKit for WebRTC audio.

---

## Submission text — concise + how-to-use (English)

For forms with a character limit. `~1150 chars`.

> VoiceCrew is a browser-based voice chat for League of Legends players. You
> get a private room link, share it with who you want, and up to 5 people talk
> while playing. No install, no account.
>
> How to use:
> 1. Open the site — a private room ID is generated for you (never typed or
>    guessed).
> 2. Enter your Riot ID (GameName#TagLine) and pick your platform (NA, EUW,
>    KR, JP…). First-time players pass a 13+ age gate and accept the Terms.
> 3. Press Join. The backend verifies the Riot ID via ACCOUNT-V1 (confirms the
>    account exists, resolves PUUID) and fetches the profile icon via
>    SUMMONER-V4, rendered from Data Dragon.
> 4. In the room: mute/unmute, adjust or locally mute others, copy the invite
>    link for friends, report abuse, leave anytime.
>
> Riot API use is limited to identity display: ACCOUNT-V1 (verify + PUUID),
> SUMMONER-V4 (profile icon), Data Dragon (icon image) — one call each per
> join. We do not use match, rank, or spectator data. Only ephemeral room
> membership is stored (6h expiry). HTTPS, server-side key, rate limits
> respected, disclaimer shown site-wide.
>
> After RSO approval the manual Riot ID field is removed: players sign in with
> Riot and identity is fetched automatically — Riot-verified identities instead
> of self-declared names, preventing impersonation.

## Submission text — ultra short (English)

For tight limits. `~700 chars`.

> VoiceCrew is a browser voice chat for League of Legends. A player gets a
> private room link, shares it, and up to 5 people talk while playing — no
> install.
>
> The player enters their Riot ID (GameName#TagLine) and platform, then presses
> Join. The backend verifies the ID via ACCOUNT-V1 (existence + PUUID) and
> fetches the profile icon via SUMMONER-V4, rendered from Data Dragon — one
> call each per join. In the room: mute, per-player volume, invite link,
> report, leave. No match, rank, or spectator data. Only ephemeral room
> membership is stored (6h). HTTPS, server-side key, rate limits respected.
>
> After RSO approval the manual field is removed: players sign in with Riot, so
> identities are Riot-verified rather than self-declared.

---

## 日本語対訳（社内確認用・提出はしない）

**プロダクト名:** VoiceCrew / **URL:** https://voicecrew.pages.dev

**概要:** League of Legends プレイヤー向けのブラウザ音声チャット。Riot ID を入力
すると専用ルームのリンクが発行され、それを話したい相手に共有して最大5人で通話す
る。インストール・アカウント登録は不要で、ゲームクライアントには一切干渉しない。

Riot API を使う目的は **本人性の担保**。ボイスルームに表示される名前とアイコン
を、誰でも自由に打てるニックネームではなく検証済みの Riot アカウントにするため。

### 現状の動作（審査対象バージョン）

1. サイトを開くとルームIDが自動生成される（12文字のランダムID。手入力・推測は
   不可）。招待リンク `/join/{region}/{roomId}` から来た場合はそのルームを使う。
2. **Riot ID**（`名前#タグ`）を入力し、プラットフォーム（NA/EUW/KR/JP…）を選択。
   初回は13歳以上の年齢確認と、利用規約・プライバシーポリシーへの同意。
3. 「参加」を押す。招待リンクから来ても入力欄が埋まるだけで、**自動でマイクが
   繋がることはない**（明示操作が必須）。
4. バックエンドが **ACCOUNT-V1** で実在確認と PUUID 取得、**SUMMONER-V4** で
   `profileIconId` を取得し、**Data Dragon** の公開 CDN からアイコンを表示。
   検証できない Riot ID は参加を拒否。
5. ルーム内では自分のミュート切替、参加者ごとの音量調整・ローカルミュート、
   参加者一覧（Riot ID＋アイコン）、招待リンクのコピー、通報、退出が可能。

定員は5人、ルーム情報は無操作6時間で自動失効。

### Riot API の利用（現状）

| API | エンドポイント | 用途 |
|---|---|---|
| ACCOUNT-V1 | `/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}` | 実在確認＋PUUID 取得（なりすまし防止の要） |
| SUMMONER-V4 | `/lol/summoner/v4/summoners/by-puuid/{puuid}` | `profileIconId` 取得 |
| Data Dragon（キー不要） | `versions.json` / `profileicon/{id}.png` | アイコン画像の表示 |

- 呼び出しは**参加1回につき各1回**。ポーリングはしない。
- **不使用:** MATCH-V5 / LEAGUE-V4（ランク）/ CHAMPION-MASTERY / SPECTATOR-V5
  など、戦績・ランク・試合データを返すエンドポイント。
- API キーは Cloudflare のシークレットとしてサーバ側のみで保持し、ブラウザには
  出さない。全通信 HTTPS、レート制限遵守、ディスクレーマーは全ページのフッター
  に掲示、Riot ロゴ・Press Kit 素材は不使用。

### データの取り扱い

- **一時保存:** ルーム参加情報（Riot ID・参加時刻・アイコン URL）を KV に。6時間
  で自動失効。
- **恒久保存:** 通報記録（モデレーション・安全性審査のため）。
- **収集しない:** 戦績・ランク・MMR・決済情報・音声の録音。音声は WebRTC で、
  当方では録音しない。
- PUUID はアイコン取得のための一時利用にとどまり、プロフィール・ランキング・
  独自レーティングの生成には使わない。

### 安全性・モデレーション

通報機能（ハラスメント／ヘイト／児童安全／チート／スパム等）。通報すると即座に
その相手をローカルミュートし、通報が重なると自動で一時停止。児童安全に関する
通報は自動スコアに載せず人手でエスカレーション。初回参加前に13歳以上の年齢確認。
参加者自身による配信・録画の可能性は規約で開示済み。

### RSO 導入後の予定（承認後）

Riot ID の手入力欄を**完全に廃止**し、RSO ログインに置き換える。本人情報（PUUID
／名前#タグ／アイコン）は RSO + ACCOUNT-V1 で自動取得。**申請の主目的はこれ**で、
自己申告の名前を Riot 検証済みの本人性に置き換えられる。見知らぬ相手と音声で話す
プロダクトである以上、なりすまし排除の価値が大きい。

SPECTATOR-V5 による対戦中ルームの自動判定は**検討中で未確約**。実装するとしても
(a) 各参加者の明示的オプトイン、(b) 敵チームを同室にしない、を満たす設計が固まる
まで着手しない（本人が選んでいない相手に在席が露見しうるため）。

---

## Notes

- **SPECTATOR-V5 は「検討中」として書く**こと。「予定」と書くと、
  [riot-compliance.md](./riot-compliance.md) §2 で保留と整理した
  「可視性を伴わないプレイヤーの非匿名化」リスクを未解決のまま約束することに
  なる。
- 「なぜ RSO が必要か」を問う欄があれば、"replaces a self-declared name with a
  Riot-verified one and eliminates impersonation" を要点として流用できる。
- **既知の不整合（申請前に直したい点）**: UI ではプラットフォーム（region）を
  選ばせるが、`functions/api/_routes/sessions.ts` の join はこれをバックエンドの
  Riot 呼び出しに渡しておらず、SUMMONER-V4 の宛先は
  `functions/api/_lib/riot.ts` で `jp1` 固定。JP 以外のアカウントはアイコン取得
  に失敗する（参加自体は成功し、アイコンが出ないだけ）。**Riot のレビュアーは
  高確率で NA アカウントで試す**ため、審査前に region を通す修正を推奨。
