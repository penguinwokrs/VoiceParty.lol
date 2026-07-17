# Code review (Claude)

PR の自動レビューは **Claude** が行う。以前使っていた Gemini Code Assist は廃止した。

## 構成

| ファイル | 役割 |
|---|---|
| `.github/workflows/claude-code-review.yml` | `main` 宛の PR が open / push された時に自動レビュー |
| `.github/workflows/claude.yml` | Issue / PR で `@claude` とメンションした時に応答 |
| `.gemini/config.yaml` | Gemini の停止スイッチ（App アンインストール後は削除可） |

どちらも `ANTHROPIC_API_KEY` シークレットを使う。モデルは Sonnet、`--max-turns` 上限
つきでコストを抑えている。Draft PR はレビューしない（ready にした時点で走る）。
同一 PR に連続 push した場合は `concurrency` で古い実行をキャンセルする。

レビュー観点はワークフローの `prompt` に直接書いてある。スタイルは Biome が
担保しているので対象外。指摘は日本語。

## 有効化の手順（未完了 → 要対応）

### 1. `ANTHROPIC_API_KEY` を登録する

現状このリポジトリにシークレットは1つも登録されていない。これを入れるまで
ワークフローは失敗する。

```sh
gh secret set ANTHROPIC_API_KEY --repo penguinwokrs/VoiceCrew
```

キーは <https://console.anthropic.com/settings/keys> で発行する。

### 2. Gemini Code Assist App をアンインストールする

Gemini はリポジトリ内に設定ファイルを持たず、**GitHub App としてインストール**
されている。そのため App 自体の削除は Web UI からしかできない:

<https://github.com/settings/installations> → **Gemini Code Assist** → Configure →
Uninstall

（Organization 配下の場合は `https://github.com/organizations/<org>/settings/installations`）

`.gemini/config.yaml` の `code_review.disable: true` により、アンインストール前でも
レビュー投稿は止まる。アンインストールが済んだら `.gemini/` ディレクトリごと削除してよい。

## コスト

Actions 経由の従量課金（Anthropic API）。目安として `--max-turns 5` + Sonnet で
PR 1本あたり数十円〜。増えるようなら `claude-code-review.yml` の `on:` に
`paths-ignore` を足して docs のみの PR を除外する。

## 代替: マネージド Code Review

Actions を自前で持たず、Anthropic 側のマネージドサービスを使う選択肢もある
（<https://claude.ai/admin-settings/claude-code> → Code Review → Setup）。
GitHub App を入れるだけでワークフロー不要、レビューはインラインコメントで付く。
今回は既存 CI と同じ場所で管理したかったので Actions 方式を採った。
