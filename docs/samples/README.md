# サンプルマップ集

実際の組織課題を Enablement Map Studio で整理した実例サンプルです。YAML をそのまま開いて、自組織用に編集して使えます。

| サンプル | 誰向け | YAML | 解説 |
|---|---|---|---|
| AI駆動開発 組織標準化 | AI ツールを配布したが個人差が開いて困っている開発組織のマネージャー | [ai-dev-org-standardization.yaml](./ai-dev-org-standardization.yaml) | [解説](./ai-dev-org-standardization.md) |
| 全社AI導入 reach→value ギャップ | AI を全社配布したが業務成果に効いているか確かめられない導入設計者・PM | [enterprise-ai-reach-value.yaml](./enterprise-ai-reach-value.yaml) | [解説](./enterprise-ai-reach-value.md) |

## サンプルの開き方

1. サンプルの YAML ファイルをローカルにダウンロードします(リポジトリを clone している場合はそのまま使えます)
2. studio を起動し、ヘッダーの「**Open File**」ボタンで YAML ファイルを選択します
3. CJM → SBP → Outcome → EM の各エディタで内容を確認・編集できます

ヘッダーの「Load Sample」ボタンは操作説明用の汎用サンプル(システム開発ライフサイクル)を読み込むもので、このディレクトリのサンプルとは別物です。

## サンプルを追加するときの型

1 サンプル = 次の 2 点セットで追加します。

- `<slug>.yaml` — CJM / SBP / Outcome / EM の 4 DSL を含む完全なマップ
- `<slug>.md` — 解説(このマップで判断できること / 読み方 / 出典)。スクリーンショットは載せず、テキストで説明します

`docs/samples/*.yaml` は CI のテスト(`packages/dsl/src/utils/samples-validation.test.ts`)でスキーマと参照整合性が検証されます。4 DSL が揃っていないサンプルはテストで検出されます。
