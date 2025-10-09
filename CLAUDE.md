# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

## プロジェクト概要

**Enablement Map Studio** は、顧客体験からアウトカム創出までのエンドツーエンドプロセスを設計するための統合Webアプリケーションです。`---`で区切られた複数のDSL定義を含む単一のYAMLファイルを扱う4つの相互接続されたビジュアルエディタを提供することで、イネーブルメントサイクルの「整理ステージ」をサポートします。

## 必須コマンド

```bash
# 開発
pnpm dev              # 開発サーバーを起動 (http://localhost:5173)
pnpm build            # 全パッケージをビルド (TypeScript + Vite)
pnpm type-check       # TypeScript型チェックを実行

# コード品質
pnpm lint             # qltyチェックを実行 (biome, prettier, eslint)
pnpm format           # qltyフォーマットを実行

# テスト (実装時)
pnpm test             # Vitestでテストを実行
```

## ツール

- 利用方法がわからないツール、ライブラリは Context7_1 mcpで確認できます
- 画面で確認する場合 chrome-devtools mcpが利用できます。
- 問題の原因がわからない場合、相談役として mcp-codex-cli, mcp-gemini-cli mcpが利用できます
- ソースコードのアクセスには serena mcpが利用できます


## アーキテクチャ概要

### モノレポ構成

以下のパッケージを持つ **pnpm workspace モノレポ**:

```
packages/
├── dsl/           # DSL型定義、パーサー、バリデーター、参照チェック
├── store/         # localStorageによる永続化を持つZustandストア
├── ui/            # 共有UIコンポーネント (Tailwindデザインシステム)
apps/
└── studio/        # メインVite+Reactアプリケーション
```

### 技術スタック

- **フロントエンド**: React 18+ + TypeScript + Vite
- **状態管理**: Zustand with persist middleware
- **ルーティング**: React Router v6
- **スタイリング**: Tailwind CSS with custom design system
- **DSL処理**: js-yaml (parser), ajv (JSON Schema validation)
- **Linter/Formatter**: qlty (biome, prettier, eslint)
- **パッケージ管理**: pnpm workspaces

### データフローアーキテクチャ

**Single Source of Truth**: 4つすべてのエディタがlocalStorageに永続化されるZustandストアを共有します。

**YAML処理パイプライン**:
1. ユーザーがYAMLを読み込み → `parseYaml()` (js-yaml マルチドキュメント)
2. バリデーション → `validateDsl()` (ajv with JSON schemas)
3. 参照整合性チェック → `checkReferenceIntegrity()`
4. ストア更新 → Zustandが再レンダリングをトリガー
5. エクスポート → `exportYaml()` が全DSLを結合

**DSL間参照** (データモデル理解に重要):
- **SBP Task → CJM Action**: `source_id` がCJM action IDを参照
- **Outcome CSF → SBP Task**: `primary_csf.source_id` がSBP task IDを参照
- **EM Outcome → Outcome KPI**: `source_id` がoutcome KPI IDを参照
- **EM Action → SBP Task**: `source_id` がSBP task IDを参照

### 4つのDSLタイプ

各DSLは `kind` 識別子と `version` フィールドを持ちます (現在すべて "1.0"):

1. **CJM DSL** (`kind: 'cjm'`): カスタマージャーニーマップ
   - `phases[]`: ジャーニーフェーズ
   - `actions[]`: `emotion_score` (-2 から 2) を持つ顧客アクション
   - アクションは `phase` フィールド経由でフェーズを参照

2. **SBP DSL** (`kind: 'sbp'`): サービスブループリント
   - `lanes[]`: スイムレーン
   - `tasks[]`: オプションの `source_id` → CJM Action を持つタスク
   - タスクは `link_to[]` 配列経由で他のタスクとリンク
   - `readonly: true` はCJM由来 (表示専用) を意味

3. **Outcome DSL** (`kind: 'outcome'`): ビジネスアウトカム
   - **単一のKGI/CSF/KPI構造** (配列ではない):
     - `kgi`: 重要目標達成指標 (オブジェクト)
     - `primary_csf`: `source_id` → SBP Task を持つ重要成功要因
     - `primary_kpi`: 重要業績評価指標 (オブジェクト)

4. **EM DSL** (`kind: 'em'`): イネーブルメントマップ
   - `outcomes[]`: `source_id` 経由でOutcome KPIにリンク
   - `actions[]`: `source_id` 経由でSBP tasksへのイネーブルメントアクション
   - `skills[]`, `knowledge[]`, `tools[]`: `action_id` 経由でリンクされるリソース

### 状態管理の詳細

**Zustand Store** ([packages/store/src/store.ts](packages/store/src/store.ts)):
- 4つのDSLオブジェクトを保持: `cjm`, `sbp`, `outcome`, `em` (すべてnullable)
- メソッド: `loadYaml()`, `exportYaml()`, DSLタイプごとの `update*()`
- 更新時に参照整合性チェックを自動実行
- localStorageに永続化: `enablement-map-studio-storage`

**参照チェック** ([packages/dsl/src/utils/reference-check.ts](packages/dsl/src/utils/reference-check.ts)):
- `checkReferenceIntegrity()`: すべてのDSL間参照を検証
- `buildHierarchyChain()`: EMエディタ用にOutcome → CJM Phaseチェーンをトレース
- 結果は `referenceCheck` 状態に格納 (警告、非ブロッキング)

### TypeScript設定

**Composite Projects**: すべてのパッケージがプロジェクト参照のために `"composite": true` を使用。

**パッケージtsconfigの主要なオーバーライド**:
- `"noEmit": false` (compositeに必須)
- `"allowImportingTsExtensions": false` (emitと互換性なし)
- `"resolveJsonModule": true` (dslパッケージがJSONスキーマをインポート)

**パスマッピング**:
```typescript
"@enablement-map-studio/dsl": ["./packages/dsl/src"]
"@enablement-map-studio/store": ["./packages/store/src"]
"@enablement-map-studio/ui": ["./packages/ui/src"]
```

## 重要な実装詳細

### ID生成

**形式**: `{kind}:{type}:{uuid}`
- 例: `cjm:action:123e4567-e89b-12d3-a456-426614174000`
- [packages/dsl/src/utils/id-generator.ts](packages/dsl/src/utils/id-generator.ts) の `generateId()` を使用

### 重要な仕様決定事項

[tmp/em_studio.md](tmp/em_studio.md) より:

1. **Outcome CSF構造**: `primary_csf.source_id` を持つ単一オブジェクト (配列ではない)
2. **SBP Task接続**: `link_to` は配列 (複数接続を許可)
3. **EMエディタ階層**: Outcome → CJM Phase → CJM Action → SBP Task → EM Actions → skills/knowledge/tools (1:1:1:1:n:m,o,p)
4. **CJM感情スコア**: -2 (非常にネガティブ) から +2 (非常にポジティブ)
5. **バージョン**: すべてのDSLは現在 "1.0"、バージョンチェックは未実装

### 開発ワークフロー

**DSLスキーマの変更**:
1. `packages/dsl/src/types/{dsl}.ts` のTypeScript型を更新
2. `packages/dsl/src/schemas/{dsl}.json` のJSONスキーマを更新
3. DSL間参照を追加する場合、`reference-check.ts` を更新
4. [apps/studio/public/sample.yaml](apps/studio/public/sample.yaml) を更新
5. `pnpm build` を実行して検証

**参照整合性のテスト**:
sample.yamlをUIで読み込み、ブラウザコンソールで参照チェック結果を確認。

## 現在の状況

**✅ 完了** (フェーズ1-3):
- モノレポ、TypeScript設定、全DSLインフラ
- 永続化とバリデーションを持つZustandストア
- UIコンポーネントライブラリ、アプリシェル、ファイル操作
- ビルドシステム稼働中

**⏳ 次** (フェーズ4):
- ビジュアルエディタ (現在プレースホルダー)
- D3.js/Konva.jsのキャンバスエディタ統合

## 関連ドキュメント

- 詳細仕様: [tmp/em_studio.md](tmp/em_studio.md)
- 開発計画: [tmp/todo.md](tmp/todo.md)
- イネーブルメントコンセプト: https://note.com/suwash/n/n02fa7e60d409
