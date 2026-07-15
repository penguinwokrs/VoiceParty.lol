# Riot Games コンプライアンス自己監査

本サービス「VoiceParty.lol」（以下「本サービス」）は Riot Games の API・知的財産を利用する第三者アプリケーションである。[Riot General Policies](https://developer.riotgames.com/policies/general) および [API Terms & Conditions](https://developer.riotgames.com/terms) への適合状況を記録する。

- 最終監査日: 2026-07-16
- 関連 issue: #39 ／ 連動: #19（RSO）

## 1. 法定ディスクレーマー

Riot が要求する定型文を、全ページのフッターに掲示済み（英語原文・商標帰属を含む）。

> VoiceParty.lol isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

- 実装: `src/components/SiteFooter.tsx`（`legal.disclaimer`、ja/en/ko 共通で英語原文を表示）。
- 掲示範囲: 全ルート（AppShell 経由でフッターを全ページに表示）。

## 2. 禁止行為の不抵触（自己監査）

本サービスはリアルタイム音声通話機能のみを提供し、Riot の禁止行為のいずれにも該当しない。

| 禁止行為 | 該当 | 根拠 |
|---|---|---|
| 賭博・ベッティング機能 | 非該当 | 金銭・賞金・賭けに関する機能を一切持たない |
| チート／不公平な競技優位の提供 | 非該当 | ゲームクライアントに介入せず、ゲーム内情報の優位も与えない |
| 可視性を伴わないプレイヤーの非匿名化 | 非該当 | 表示する Riot ID は本人が入力した範囲に限る。他者の秘匿情報を暴露しない |
| 代替ランク／MMR／ELO の算出 | 非該当 | 戦績・レーティングの算出機能を持たない |
| ゲーム目標の改変 | 非該当 | ゲームプレイに一切干渉しない |

## 3. 商標・アセットの利用

| 項目 | 状況 |
|---|---|
| プロフィールアイコン | Data Dragon（`ddragon.leagueoflegends.com`）の公開 CDN のみ使用（`functions/api/_lib/riot.ts`） |
| Riot ロゴ／Press Kit 素材 | 未使用（本サービスは Riot の商標ロゴを表示しない） |
| ゲームとの外観・機能の類似 | 非該当（ボイスチャット UI であり、Riot 製品を模していない） |
| 名称・ドメイン | 「VoiceParty.lol」。Riot 公式サービスとの提携・承認を示唆しない。ディスクレーマーで非提携を明示 |

## 4. API / RSO 運用

| 項目 | 状況 |
|---|---|
| Developer Portal 登録・ステータス | 登録し、Approved / Acknowledged を維持する（[申請メモ](./riot-api-application.md) 参照） |
| API キー／シークレットの秘匿 | Cloudflare のシークレットとして管理（`wrangler pages secret put`）。リポジトリに平文で保持しない |
| 取得データの用途・保持 | Riot ID・アイコンは本人の識別/表示に限定。保持方針は[データ取扱い](./data-handling.md)およびプライバシーポリシー（`/privacy`）に記載 |
| RSO 本番認可 | 申請の前提としてプライバシーポリシー・利用規約の URL を提示（`/privacy`・`/terms`）。詳細は #19 |

## 5. 提供形態・収益化

本サービスは利用者に無償で提供する。運営費用は広告・第三者アフィリエイトで賄う（Riot ポリシー上、広告は無料利用枠において許容）。収益化にあたっては、無料利用枠の維持・提供内容の transformative 性・不当な負担の回避を満たし、広告表示は景品表示法のステマ規制に従い広告である旨を明示する（利用規約 `/terms`）。

## 監査の更新

ポリシー・機能に重要な変更があった場合は本書を更新し、最終監査日を改める。
