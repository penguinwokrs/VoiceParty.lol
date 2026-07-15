# データ取扱い（内部整理）

本サービスが取り扱うデータ、その流れ、保持期間、委託先を整理する。プライバシーポリシー（`/privacy`）の裏付け資料。

- 最終更新日: 2026-07-16
- 関連 issue: #38 ／ 対応ポリシー: `/privacy`

## 1. データ・インベントリ

| データ | 取得元 | 目的 | 保持 | 委託先/処理者 |
|---|---|---|---|---|
| Riot ID／サモナー名 | 利用者の入力（将来 RSO） | 本人の識別・表示 | セッション有効期間（下記 KV） | Riot Games（検証時） |
| プロフィールアイコン | Data Dragon（公開情報） | 表示 | 保持しない（都度取得） | — |
| 音声 | 利用者のマイク | リアルタイム通話 | **保存しない**（P2P/SFU 伝送のみ） | RealtimeKit/Cloudflare |
| IP・国/地域 | Cloudflare | 配信・不正防止 | Cloudflare のログ方針に従う | Cloudflare |
| セッションデータ | 本サービス（KV） | 通話ルーム管理 | **6 時間 TTL**（join で更新） | Cloudflare KV |
| 通報データ | 利用者の通報操作 | 安全確保・モデレーション | **30 日 TTL**、ハッシュ化 | Cloudflare KV |
| BAN | 自動判定 | 悪質利用の抑止 | **24 時間 TTL**（一時） | Cloudflare KV |
| アナリティクス（将来） | サーバイベント | 利用状況把握 | 集計・ハッシュ化 | Cloudflare（Analytics Engine/D1） |
| 機能設定 | 端末 localStorage | 音量/ミュート/ノイズ抑制 | 端末内（サーバ送信なし） | — |

## 2. データフロー

```mermaid
flowchart LR
  U[利用者ブラウザ] -->|join / report| PF[Pages Functions (Hono)]
  U -->|音声 WebRTC| RK[RealtimeKit / Cloudflare]
  PF -->|セッション/通報/BAN| KV[(Cloudflare KV)]
  PF -->|Riot ID 検証| RIOT[Riot Games API]
  PF -->|アイコン| DD[Data Dragon CDN]
  PF -.->|将来: 指標| AE[(Analytics Engine / D1)]
```

- 音声は RealtimeKit を経由する WebRTC でリアルタイム伝送され、**本サービスでは録音・保存しない**。
- Riot ID・通報者/被通報者は分析・モデレーションストアでは **HMAC ハッシュ**として扱い、生の識別子を保存しない。

## 3. 保持期間の要約

| 種別 | KV キー | TTL |
|---|---|---|
| ルーム→ミーティング対応 | `game:{sessionId}` | 6 時間（join で更新） |
| セッション | `session:{meetingId}` | 6 時間（join で更新） |
| 通報 | `report:{reported}:{session}:{reporter}` | 30 日 |
| BAN | `ban:{reportedHash}` | 24 時間 |

音声・生の Riot ID は保存しない。放置されたルームは TTL により自然消滅する。

## 4. 委託先・処理者

- **Cloudflare, Inc.** — ホスティング・配信・KV・（将来）アナリティクス。
- **RealtimeKit / Cloudflare** — 音声通話基盤（participant-minutes 課金）。
- **Riot Games, Inc.** — Riot ID 検証 API。
- **広告・アフィリエイト事業者**（導入時） — 第三者配信。

法令に基づく場合を除き、本人の同意なく個人情報を第三者へ提供しない。国外移転は上記委託に伴い発生し得る。

## 5. 利用者の権利

開示・訂正・削除・利用停止（GDPR/CCPA を含む）の請求は、問い合わせ窓口（設置は #38）で受け付ける。ハッシュ化・短期 TTL により、多くのデータは請求前に自然失効する。
