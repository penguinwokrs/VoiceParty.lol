# Riot API / RSO Application Text

Submission text for the Riot Developer Portal (production API key & RSO
application). The **English** section is the submission-ready copy; the
**日本語** section is an internal reference translation (do not submit).

The app is described in its **current** state for review, while noting the
**planned RSO integration** that removes manual Summoner ID / Game ID entry
once RSO access is approved.

---

## Submission text (English)

**Product Name:** VoiceParty.lol

**Product URL:** https://voiceparty.pages.dev

**Category:** Web application (voice chat companion for League of Legends)

### Short description

VoiceParty.lol is a browser-based voice chat service for League of Legends
players. Players who share the same "Game ID" join a lightweight WebRTC voice
room (up to 5 participants) so a party or team can talk together while
playing — no install required.

### How it works today (current, under-review version)

1. The player opens the site.
2. The player enters their **Riot ID** (`GameName#TagLine`) and a **Game ID**
   (a shared room identifier; a room can also be shared as a join link, e.g.
   `/join/{gameId}`).
3. The backend validates the Riot ID through **ACCOUNT-V1**
   (`/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}`) to confirm the
   account exists and to resolve the PUUID, and calls **SUMMONER-V4**
   (`/lol/summoner/v4/summoners/by-puuid/{puuid}`) to fetch the profile icon
   for display.
4. The player enters the voice room shared by everyone using the same Game ID
   and can mute/unmute, see the other participants (name + profile icon), and
   leave.

### Riot API usage (current)

- **ACCOUNT-V1** — verify player identity and obtain PUUID.
- **SUMMONER-V4** — obtain `profileIconId` to render the player avatar.
- **Data Dragon** (public CDN) — render the profile icon image.
- We do **not** collect or store match history, rank, or any sensitive
  personal data. The only persisted data is ephemeral room membership (Riot ID
  + join time) stored in Cloudflare KV for the duration of the session. All
  traffic is served over HTTPS, and we respect Riot API rate limits.

### Planned RSO integration (after approval)

Once RSO (Riot Sign-On) access is granted, the manual input steps will be
**removed entirely**:

- Instead of typing a Riot ID, the player will **sign in with their Riot
  account via RSO**. Their identity (PUUID, `GameName#TagLine`, profile icon)
  is then obtained **automatically** through RSO + ACCOUNT-V1 — no Summoner ID
  entry.
- The **Game ID will also be auto-detected** from the player's live game
  context (via **SPECTATOR-V5** active-game lookup by PUUID). Players in the
  same live match are automatically placed into the same voice room, so the
  manual Game ID field disappears as well.
- Result: a **zero-input flow** — the player just logs in with Riot and is
  automatically connected to the correct voice room with their verified
  identity. This also strengthens security, because identities are verified by
  Riot login rather than self-declared, preventing impersonation.

### Tech stack

Cloudflare Pages + Pages Functions (Workers runtime), Cloudflare KV for session
state, and Cloudflare RealtimeKit for WebRTC audio.

---

## 日本語対訳（社内確認用・提出はしない）

**プロダクト名:** VoiceParty.lol / **URL:** https://voiceparty.pages.dev

**概要:** League of Legends プレイヤー向けのブラウザ音声チャット。同じ「Game
ID」を使う人同士が WebRTC 音声ルーム（最大5人）に入り、プレイしながら会話でき
る。インストール不要。

### 現状の動作（審査対象バージョン）

1. サイトを開く
2. **Riot ID**（`名前#タグ`）と **Game ID**（共有ルーム識別子。`/join/{gameId}`
   の参加リンクでも共有可）を入力
3. バックエンドが **ACCOUNT-V1** で Riot ID の実在確認と PUUID 取得、
   **SUMMONER-V4** でプロフィールアイコンを取得
4. 同じ Game ID の音声ルームに参加。ミュート切替、参加者一覧（名前＋アイコン）
   表示、退出が可能

### Riot API の利用（現状）

- ACCOUNT-V1: 本人確認・PUUID 取得 / SUMMONER-V4: アイコン取得 / Data Dragon:
  アイコン画像表示
- 戦績・ランク等の機微データは収集・保存しない。保存はセッション中の一時的な
  ルーム参加情報（Riot ID＋参加時刻、Cloudflare KV）のみ。全通信 HTTPS、レート
  制限を遵守。

### RSO 導入後の予定（承認後）

- Riot ID の手入力を廃止し、**RSO による Riot アカウントログイン**に置き換え。
  本人情報（PUUID／名前#タグ／アイコン）を **API 経由で自動取得**。
- **Game ID も SPECTATOR-V5（対戦中ゲーム取得）で自動判定**。同じ対戦のプレイ
  ヤーが自動的に同じ音声ルームへ。手入力欄は消える。
- 結果として **入力ゼロ**。Riot ログインするだけで、検証済みの本人情報のまま
  正しい音声ルームに自動接続。なりすまし防止にもなる。

---

## Notes

- **SPECTATOR-V5 による Game ID 自動化**は「予定」。実装しない/別方式にする場合
  は、該当段落を「ログイン済みプレイヤーが同じルームコードを共有する」等に差し替
  える。
- 審査に「なぜ RSO が必要か」を問う欄があれば、"identities are verified by Riot
  login … preventing impersonation" を要点として流用できる。
