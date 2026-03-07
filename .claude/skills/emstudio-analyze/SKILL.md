---
name: emstudio-analyze
description: "Enablement Map StudioのYAML DSLファイルを分析し、整合性チェックや改善提案を行います。「イネーブルメントマップを分析」「YAMLの整合性チェック」「DSLのレビュー」「enablement-mapの改善点」「EMマップの不足を指摘」「CJM/SBP/Outcome/EMの整合性を確認」などのキーワードで発動します。"
argument-hint: "<分析対象のYAMLファイルパス>"
---

# Enablement Map Studio DSL分析・改善提案

既存のYAML DSLファイルを読み込み、整合性チェック・改善提案・不足要素の指摘を行います。

## 共有リソース

- DSL仕様リファレンス: `../emstudio-core/references/dsl-spec.md`

## ワークフロー

### Step 1: DSL仕様の読み込み

`../emstudio-core/references/dsl-spec.md` を読み込み、DSLの型定義と参照関係を把握する。

### Step 2: YAMLファイルの読み込み

ユーザーが指定したYAMLファイルを読み込み、`---` 区切りで4つのDSLに分割する。
存在しないDSLがあれば記録する。

### Step 3: 構造チェック

各DSLについて以下を検証する:

| チェック項目 | 内容 |
|-------------|------|
| kind/version | 正しい値が設定されているか |
| 必須フィールド | 各型の必須フィールドが存在するか |
| ID形式 | `{kind}:{type}:{uuid}` 形式に従っているか |
| 値の範囲 | emotion_score (-2~2)、lane.kind (cjm/human/team/system) 等 |

### Step 4: 参照整合性チェック

DSL間の参照が正しいかを検証する:

1. CJM Action の `phase` → CJM Phase が存在するか
2. SBP Task の `lane` → SBP Lane が存在するか
3. SBP Task の `source_id` → CJM Action が存在するか
4. SBP Connection の `source/target` → SBP Task が存在するか
5. Outcome CSF の `source_id` → SBP Task が存在するか
6. EM Outcome の `source_id` → Outcome KPI が存在するか
7. EM Action の `source_id` → SBP Task が存在するか
8. EM Skill/Knowledge/Tool の `action_id` → EM Action が存在するか

### Step 5: カバレッジ分析

DSL間の網羅性を分析する:

| 分析項目 | 説明 |
|---------|------|
| CJM → SBP カバレッジ | CJMアクションのうち、SBPタスクで `source_id` 参照されているものの割合 |
| SBP → EM カバレッジ | SBPタスクのうち、EMアクションで `source_id` 参照されているものの割合 |
| EM リソースカバレッジ | EMアクションのうち、スキル・ナレッジ・ツールが紐づいているものの割合 |
| 学習コンテンツ充足度 | スキルのうち、学習コンテンツ（learnings）が設定されているものの割合 |
| CSF関連の充実度 | CSFに指定されたSBPタスクに関連するEMアクション・リソースの量 |

### Step 6: 改善提案の生成

分析結果に基づき、以下の観点で改善提案を行う:

1. **構造エラー**: 参照切れ、必須フィールド不足など（修正必須）
2. **カバレッジギャップ**: CJMアクションに対応するSBPタスクがない等（検討推奨）
3. **コンテンツ充実**: 説明フィールドが空、学習コンテンツ未設定など（品質向上）
4. **設計の一貫性**: フェーズの粒度のばらつき、タスク命名の統一性など

### Step 7: 結果の提示

以下の形式で分析結果を報告する:

```
## 分析サマリー

| DSL | 要素数 | エラー | 警告 |
|-----|--------|--------|------|
| CJM | phases: X, actions: Y | 0 | 1 |
| SBP | lanes: X, tasks: Y, connections: Z | 0 | 2 |
| Outcome | kgi: 1, csf: 1, kpi: 1 | 0 | 0 |
| EM | actions: X, skills: Y, knowledge: Z, tools: W | 1 | 3 |

## エラー（修正必須）
- ...

## 警告（検討推奨）
- ...

## 改善提案
- ...
```

## 注意事項

- 4つのDSL全てが揃っていなくても、存在するDSLのみで分析を実行する
- position/sizeフィールドの値はエディタ表示用のため、分析対象外とする
- 改善提案は優先度順（エラー > カバレッジギャップ > コンテンツ充実）で提示する
