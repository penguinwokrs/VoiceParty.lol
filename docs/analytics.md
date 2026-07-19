# ファネル計測

チャネル別に「リンクを開いた → 参加した」を見るための計測。実装は
`functions/api/_lib/analytics.ts`、保存先は Workers Analytics Engine の
`voicecrew_funnel` データセット（バインディング `VC_ANALYTICS`）。

- 最終更新日: 2026-07-19

## なぜ Analytics Engine なのか

KV のカウンタは**採用しない**。KV にアトミックなインクリメントが無いため、同時
書き込みで加算が黙って消える。しかも消えたことは結果の数字からは分からない。
Analytics Engine は追記専用で、この用途に合っている。

**公開のビーコン API も作らない**。下記のイベントはすべて、サーバーが既に処理して
いるリクエストの中から書いている（HTML リクエストか、セッション API）。第三者が
実際の行動を伴わずにイベントを増やせる経路は無い。

## 記録している内容

**識別子は一切書かない。** Riot ID も IP も Cookie も、訪問者ごとの ID も無い。
書くのはチャネルタグ・言語・国・bot/human の別だけで、すべて集計値。プライバシー
ポリシー第 3 条（cookieless のアクセス解析）の範囲内であり、ポリシーの改定は不要。

| イベント | 書く場所 | 意味 |
|---|---|---|
| `page_view` | `functions/_middleware.ts` | HTML が返った。`detail` が `invite` / `landing` / `other` |
| `room_created` | `POST /api/sessions` | ルームの明示的な作成（現状クライアントは使っていない） |
| `joined` | `POST /api/sessions/:id/join` | 参加成立。`detail` が `new`（自分でルームを作った）/ `existing`（人の招待に乗った） |

### 列のレイアウト

Analytics Engine は列を**位置で**参照する。**末尾への追加は安全、並べ替えは破壊的**。

| 列 | 内容 |
|---|---|
| `index1` | `src`（チャネル単位でサンプリングされるように） |
| `blob1` | イベント名 |
| `blob2` | `src` — `copy` / `x` / `line` / `qr` / `lfg` / `stream` / `direct` / `other` |
| `blob3` | `ref` — 配信者・パートナーのタグ。無ければ空文字 |
| `blob4` | `lang` — `en` / `ja` / `ko` / `zh-TW` / `other` |
| `blob5` | `country` — `CF-IPCountry`。不明は `XX` |
| `blob6` | `human` / `bot` |
| `blob7` | `detail`（イベントごとの意味は上表） |
| `double1` | 1（件数） |

`src` は**アローリスト**で、未知の値は `other` に潰す。共有リンクに
`?src=<でたらめ>` を付けるだけで列のカーディナリティ（＝課金とクエリ性能）を
膨らませられないようにするため。**新しいチャネルを使い始めたら
`KNOWN_SOURCES` に足すこと**。足し忘れるとそのチャネルは `other` に埋もれる。

`ref` はカーディナリティが開いているのが正しい（配信者 1 人 1 値）ので、形式
（`[a-z0-9_-]{1,32}`）だけを縛る。

## クエリ

SQL API を叩く。`CLOUDFLARE_ACCOUNT_ID` と、Account Analytics の読み取り権限を
持つ API トークンが要る。

```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/analytics_engine/sql" \
  -H "Authorization: Bearer $CF_ANALYTICS_TOKEN" \
  -d "SELECT blob2 AS src, blob1 AS event, SUM(_sample_interval) AS n
      FROM voicecrew_funnel
      WHERE timestamp > NOW() - INTERVAL '7' DAY AND blob6 = 'human'
      GROUP BY src, event ORDER BY n DESC"
```

**`_sample_interval` を必ず掛けること**（`COUNT(*)` ではなく
`SUM(_sample_interval)`）。サンプリングが入ったとき、掛けないと実数を下回る。

**`blob6 = 'human'` を必ず入れること**。共有された招待リンクにはリンクプレビュー
の bot（X / Discord / LINE / Slack など）が必ず来るので、入れないと `page_view`
の大半がロボットになる。bot は捨てずに分類して記録しているので、除外はクエリ側で
行う。

### 招待の転換率（チャネル別）

```sql
SELECT blob2 AS src,
       SUM(IF(blob1 = 'page_view' AND blob7 = 'invite', _sample_interval, 0)) AS landed,
       SUM(IF(blob1 = 'joined' AND blob7 = 'existing', _sample_interval, 0)) AS joined
FROM voicecrew_funnel
WHERE timestamp > NOW() - INTERVAL '30' DAY AND blob6 = 'human'
GROUP BY src
```

### 配信者別（`?ref=`）

```sql
SELECT blob3 AS ref, blob1 AS event, SUM(_sample_interval) AS n
FROM voicecrew_funnel
WHERE timestamp > NOW() - INTERVAL '30' DAY AND blob6 = 'human' AND blob3 != ''
GROUP BY ref, event ORDER BY n DESC
```

## 読み方の注意

- **母数が小さいうちは転換率を比較しない。** 日次のルーム作成数が二桁に乗るまで、
  チャネル間の差はほぼノイズ。この計測は当面「どのチャネルから人が来ているか」の
  定性的な当たりを付けるためのもので、A/B の判定には使えない。
- **リロードで帰属が消える。** `?src=` はクライアントのメモリにだけ持っている
  （`src/lib/attribution.ts`）。参加の途中でリロードすると `direct` に落ちる。
  チャネルは**過小評価**されるが、別のチャネルに誤って付くことはない。
- `page_view` は HTML リクエスト単位。SPA 内の遷移は数えない。
