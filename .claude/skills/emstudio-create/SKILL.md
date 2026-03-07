---
name: emstudio-create
description: "Enablement Map StudioのYAML DSLファイルを新規作成します。ヒアリング内容、既存資料、業務フロー、組織情報などからCJM/SBP/Outcome/EMの4種類のDSLを生成します。「イネーブルメントマップを作りたい」「CJMを作成」「サービスブループリントをYAMLに」「成果定義を作りたい」「EMマップを生成」「enablement-map-studioのYAMLを作って」などのキーワードで発動します。"
argument-hint: "<入力情報（ヒアリングメモ、業務フロー資料、ペルソナ情報など）>"
---

# Enablement Map Studio YAML DSL 作成支援

ヒアリング内容や既存資料から、Enablement Map Studioで利用可能なYAML DSLファイルを生成します。

## 共有リソース

- DSL仕様リファレンス: `../emstudio-core/references/dsl-spec.md`

## 出力先

デフォルト: カレントディレクトリに `enablement-map.yaml`
ユーザーが別のファイル名やディレクトリを指定した場合はそちらに従う。

## ワークフロー

### Step 1: DSL仕様の読み込み

`../emstudio-core/references/dsl-spec.md` を読み込み、DSLの型定義と参照関係を把握する。

### Step 2: 入力情報の収集

ユーザーから以下の情報を収集する。全てが揃っていなくても、あるものから段階的に作成可能。

| 情報 | 対応DSL | 必須度 |
|------|---------|--------|
| ペルソナ（顧客像） | CJM | 推奨 |
| 顧客の行動フロー（フェーズ、アクション） | CJM | 推奨 |
| 組織の業務プロセス（チーム、タスク） | SBP | 推奨 |
| 事業目標（KGI）、重要成功要因（CSF）、KPI | Outcome | 任意 |
| 必要な行動、スキル、ナレッジ、ツール | EM | 任意 |

不足している情報がある場合は、ユーザーに質問して補完する。

### Step 3: CJM DSLの生成

1. ペルソナ情報から `persona` セクションを作成
2. 顧客の行動フローから `phases` と `actions` を作成
3. 各アクションに `touchpoints`、`thoughts_feelings`、`emotion_score` を設定
4. IDは `cjm:phase:{uuid}`, `cjm:action:{uuid}` 形式で生成

### Step 4: SBP DSLの生成

1. 組織のチーム構成から `lanes` を作成（kind: human/team/system）
2. CJMレーンを追加（kind: cjm）
3. CJMレーンにreadonlyタスクを配置: **CJMアクションのIDをそのままタスクIDに使用**し、`readonly: true` を設定（`source_id` は不要）
4. 各チームのタスクを作成し、対応するCJMアクションへの `source_id` を設定（紐づけ）
5. CJMレーンreadonlyタスクと各チームタスク間の `connections` を設定（`source: cjm:action:{uuid}` → `target: sbp:task:{uuid}`）
6. `position` と `size` は省略可能（エディタで調整可能）

### Step 5: Outcome DSLの生成

1. 事業目標から `kgi` を作成
2. CSFとなるSBPタスクを特定し、`primary_csf` を作成
3. KPIの名前、定義、単位、目標値から `primary_kpi` を作成

### Step 6: EM DSLの生成

1. Outcome KPIへの参照として `outcomes` を作成
2. CSFに関連するSBPタスクに対して `actions` を作成
3. 各アクションに必要な `skills`、`knowledge`、`tools` を作成
4. スキルには `learnings`（学習コンテンツ）を追加

### Step 7: YAMLファイルの組み立て

4つのDSLを `---` 区切りで結合し、CJM → SBP → Outcome → EM の順でYAMLファイルを生成する。

### Step 8: 検証

生成したYAMLの検証ポイント:

1. **ID形式**: 全てのIDが `{kind}:{type}:{uuid}` 形式であること
2. **参照整合性**: `source_id`, `action_id`, `lane`, `phase` 等の参照先が存在すること
3. **必須フィールド**: 各DSLの必須フィールドが全て設定されていること
4. **emotion_score**: -2 ~ 2 の範囲内であること
5. **lane.kind**: `cjm`, `human`, `team`, `system` のいずれかであること

### Step 9: 結果の提示

- 生成したYAMLファイルのパスを報告
- 各DSLの要素数のサマリーを表示
- Enablement Map Studioでの開き方を案内:
  - `docker run -p 8080:80 -p 8443:443 ghcr.io/suwa-sh/enablement-map-studio:latest`
  - ブラウザで https://localhost:8443 を開き、Open FileボタンからYAMLファイルを選択

## 注意事項

- position/sizeフィールドは省略しても、エディタ上で自動配置・手動調整が可能
- SBPのCJMレーン用readonlyタスクは `id: cjm:action:{uuid}`（CJMアクションのIDをそのまま使用）+ `readonly: true` で作成する。`source_id` は付けない
- SBPの通常タスク（human/team/systemレーン）に `source_id: cjm:action:{uuid}` を設定してCJMアクションと紐づける
- connectionsでは `cjm:action:{uuid}` をsource/targetに指定できる（CJMレーンreadonlyタスクへの接続）
- connections のハンドル位置（top/right/bottom/left）はタスク間の論理的な流れに合わせて設定
- 入力情報が不十分な場合は、まずCJMとSBPだけを作成し、OutcomeとEMは後から追加する方針を提案
