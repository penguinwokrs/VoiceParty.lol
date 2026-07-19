# ファネル計測

チャネル別に「リンクを開いた → 参加した」を見るための計測。実装は
`functions/api/_lib/analytics.ts`、保存先は **D1 の `funnel_stats` テーブル**
（バインディング `VC_DB`、reports と同じデータベースに同居）。

- 最終更新日: 2026-07-19

## なぜ D1 集計カウンタなのか

当初は Workers Analytics Engine で作ったが、**AE は Workers Free プランに含まれず**、
このアカウントは Workers Paid 未加入のため、AE バインディングを入れると Pages の
**deploy 段が失敗**した（build 段は成功する）。

そこで **D1 の集計カウンタ**に置き換えた。D1 は既にバインドされ（`VC_DB`）デプロイも
通っている。**次元の組ごとにカウンタ行を持ち、UPSERT で加算**する:

```sql
INSERT INTO funnel_stats (day, event, src, ref, lang, country, visitor, detail, count)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
ON CONFLICT (day, event, src, ref, lang, country, visitor, detail)
DO UPDATE SET count = count + 1;
```

- **KV を却下した理由（アトミック加算が無い）を、この UPSERT が解決する。** SQLite の
  UPSERT は文単位でアトミックなので、加算が黙って消えない。AE を最初に選んだ動機は
  D1 でも満たせる。
- **公開のビーコン API も作らない**。下記のイベントはすべて、サーバーが既に処理して
  いるリクエストの中から書く（HTML リクエストか、セッション API）。第三者が実際の
  行動を伴わずにイベントを増やせる経路は無い。
- 書き込みはレスポンスを待たせない（`waitUntil`）。テーブル未作成でも例外は握り
  つぶす（マイグレーション適用前にデプロイしても壊れない。単に記録されないだけ）。

**書き込み=イベント数**なので、`page_view`（bot 込みで全 HTML リクエスト）はそのまま
D1 書き込みになる。コールドスタートでは D1 無料枠（10万行/日書き込み）に対して桁が
2つ余裕。増えてきたら bot の `page_view` を書かない／サンプリングで抑える。

### 有効にする（1回だけ・無料）

マイグレーションをリモートに適用すればテーブルができ、計測が動き出す。

```bash
npx wrangler d1 migrations apply voicecrew-reports --remote
```

Pages はデプロイ時に D1 マイグレーションを自動適用しない（reports の 0001 と同じ）。
**このコマンドを流すまで `funnel_stats` は存在せず、書き込みは握りつぶされる**ので、
デプロイ自体は先行しても安全。適用後、コード変更なしで記録が始まる。

## 記録している内容

**識別子は一切書かない。** Riot ID も IP も Cookie も、訪問者ごとの ID も無い。
書くのはチャネルタグ・言語・国・bot/human の別だけで、すべて集計値。プライバシー
ポリシー第 3 条（cookieless のアクセス解析）の範囲内であり、ポリシーの改定は不要。
PII が無いので保持期限も設けない（削除するものが無い）。

| イベント | 書く場所 | 意味 |
|---|---|---|
| `page_view` | `functions/_middleware.ts` | HTML が返った。`detail` が `invite` / `landing` / `other` |
| `room_created` | `POST /api/sessions` | ルームの明示的な作成（現状クライアントは使っていない） |
| `joined` | `POST /api/sessions/:id/join` | 参加成立。`detail` が `new`（自分でルームを作った）/ `existing`（人の招待に乗った） |

### 列

| 列 | 内容 |
|---|---|
| `day` | UTC の日付 `YYYY-MM-DD` |
| `event` | `page_view` / `room_created` / `joined` |
| `src` | `copy` / `x` / `line` / `qr` / `lfg` / `stream` / `direct` / `other` |
| `ref` | 配信者・パートナーのタグ。無ければ空文字 |
| `lang` | `en` / `ja` / `ko` / `zh-TW` / `other` |
| `country` | `CF-IPCountry`。不明は `XX` |
| `visitor` | `human` / `bot` |
| `detail` | イベントごとの意味は上表 |
| `count` | 件数 |

`(day, event, src, ref, lang, country, visitor, detail)` が主キー兼 UPSERT の衝突
キー兼クエリのインデックス。

`src` は**アローリスト**で、未知の値は `other` に潰す。共有リンクに
`?src=<でたらめ>` を付けるだけで行のカーディナリティ（＝ストレージとクエリ性能）を
膨らませられないようにするため。**新しいチャネルを使い始めたら `KNOWN_SOURCES` に
足すこと**。足し忘れるとそのチャネルは `other` に埋もれる。

`ref` はカーディナリティが開いているのが正しい（配信者 1 人 1 値）ので、形式
（`[a-z0-9_-]{1,32}`）だけを縛る。

## クエリ

`wrangler d1 execute` で SQL を流す（`--remote` で本番、省略でローカル）。

```bash
npx wrangler d1 execute voicecrew-reports --remote --command \
  "SELECT src, event, SUM(count) AS n
   FROM funnel_stats
   WHERE day >= date('now','-7 day') AND visitor='human'
   GROUP BY src, event ORDER BY n DESC"
```

**`visitor='human'` を必ず入れること**。共有された招待リンクにはリンクプレビュー
の bot（X / Discord / LINE / Slack など）が必ず来るので、入れないと `page_view`
の大半がロボットになる。bot は捨てずに分類して記録しているので、除外はクエリ側で
行う。

### 招待の転換率（チャネル別）

```sql
SELECT src,
       SUM(CASE WHEN event='page_view' AND detail='invite'  THEN count ELSE 0 END) AS landed,
       SUM(CASE WHEN event='joined'    AND detail='existing' THEN count ELSE 0 END) AS joined
FROM funnel_stats
WHERE day >= date('now','-30 day') AND visitor='human'
GROUP BY src;
```

### 配信者別（`?ref=`）

```sql
SELECT ref, event, SUM(count) AS n
FROM funnel_stats
WHERE day >= date('now','-30 day') AND visitor='human' AND ref != ''
GROUP BY ref, event ORDER BY n DESC;
```

## 読み方の注意

- **母数が小さいうちは転換率を比較しない。** 日次のルーム作成数が二桁に乗るまで、
  チャネル間の差はほぼノイズ。この計測は当面「どのチャネルから人が来ているか」の
  定性的な当たりを付けるためのもので、A/B の判定には使えない。
- **リロードで帰属が消える。** `?src=` はクライアントのメモリにだけ持っている
  （`src/lib/attribution.ts`）。参加の途中でリロードすると `direct` に落ちる。
  チャネルは**過小評価**されるが、別のチャネルに誤って付くことはない。
- `page_view` は HTML リクエスト単位。SPA 内の遷移は数えない。
- **`funnel_stats` は reports と同じ D1 に同居している。** 別 DB に分けなかったのは
  provisioning を増やさないためで、`funnel_stats` は PII を持たないので reports の
  露出は広げない。将来分離する場合も、集計値なので移行は単純（読み替えだけ）。
