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

- 利用方法がわからないツール、ライブラリは Context7 mcpで確認できます
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
- **スタイリング**: Material-UI (MUI) v7 + Tailwind CSS
- **DSL処理**: js-yaml (parser), ajv (JSON Schema validation)
- **エディタUI**:
  - CJM Editor: MUIテーブル + Recharts (感情曲線) + @dnd-kit (ドラッグ&ドロップ)
  - SBP Editor: @xyflow/react (フローダイアグラム)
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

[REQUIREMENTS.md](REQUIREMENTS.md) より:

1. **Outcome CSF構造**: `primary_csf.source_id` を持つ単一オブジェクト (配列ではない)
2. **SBP Task接続**: `link_to` は配列 (複数接続を許可)
3. **EMエディタ階層**: Outcome → CJM Phase → CJM Action → SBP Task → EM Actions → skills/knowledge/tools (1:1:1:1:n:m,o,p)
4. **CJM感情スコア**: -2 (非常にネガティブ) から +2 (非常にポジティブ)
5. **バージョン**: すべてのDSLは現在 "1.0"、バージョンチェックは未実装

### 重要な実装上の注意点

**React状態更新のベストプラクティス**:
1. **レンダリング中の状態更新を避ける**:
   - ❌ コンポーネント本体で直接 `updateSbp()` を呼び出す
   - ✅ `useEffect` 内で状態更新を実行
   - エラー: "Cannot update a component while rendering a different component"

2. **空状態からの直接作成**:
   - CJM/SBPエディタは `null` 状態でも追加ボタンを表示
   - 追加操作時にDSLを初期化してデータを同時作成
   - `setTimeout` による再帰呼び出しは使用しない（動作が不安定）

3. **useEffectの依存配列管理**:
   - 追加・削除・更新の検出をそれぞれ独立したuseEffectで実装
   - 新規アイテム検出: 既存IDセットと比較して差分を抽出
   - 削除アイテム検出: DSL IDセットと現在のノードを比較

4. **配列フィルタリングの注意**:
   - `.filter(Boolean)` は空文字列も除去するため、改行対応には不適切
   - タッチポイント・思考感情フィールドでは使用しない

### CJM Editorの実装詳細

**UI構成**:
- MUIテーブルベースのレイアウト
- フェーズとアクションをドラッグ&ドロップで並び替え可能
- 感情曲線をRechartsで可視化（高さ240px）

**操作**:
- フェーズ追加時、自動的に「アクション 1」を作成
- アクション追加はダイアログでフェーズ選択+名前入力
- ドラッグハンドル（≡）とクリックターゲットを分離（activationConstraint: 8px）
- **空状態からの直接作成**: CJMがnullの場合でも「フェーズ追加」「アクション追加」ボタンを表示
  - フェーズ追加時、CJM DSLを初期化してフェーズ+アクションを同時作成
  - メッセージ: "フェーズを追加する か YAML をロードしてください"

**プロパティパネル**:
- 幅: 画面の33vw（最小400px）
- アクション編集順: アクション → タッチポイント → 思考・感情 → 感情スコア
- すべてのラベルを日本語化
- SAVEとDELETEボタンは同じサイズ（flex: 1）
- **タッチポイント・思考感情フィールド**: 改行可能（`.filter(Boolean)` を除去）

**技術的詳細**:
- @dnd-kit/core, @dnd-kit/sortableでドラッグ&ドロップ実装
- フェーズとアクションそれぞれに独立したDndContext
- アクション行の列数をフェーズヘッダーのcolSpanと一致させる
- **初期化ロジック**: `handleAddPhase()`内で直接CJM DSLを作成（useEffectではなく同期的に初期化）

### SBP Editorの実装詳細

**UI構成**:
- @xyflow/react (React Flow) によるフローダイアグラム
- カスタムノードタイプ: `laneNode`, `taskNode`
- スイムレーン構造（レーンは親ノード、タスクは子ノード）
- ミニマップ、コントロールパネル、背景グリッド

**状態管理の重要な設計決定**:
- **ID-based状態管理**: オブジェクト参照ではなくIDで状態を管理
  - `selectedLaneId: string | null` (❌ `selectedLane: SbpLane | null` ではない)
  - 派生状態として `sbp.lanes.find(lane => lane.id === selectedLaneId)` で最新データを取得
  - これにより、Zustand更新時に常に最新データを参照可能
- **選択的useEffect更新**: パフォーマンス最適化のため、3つの独立したuseEffectを使用
  1. レーン更新・削除・追加の検出 (`[sbp.lanes, setNodes]`)
  2. タスク追加・削除の検出 (`[sbp.tasks, setNodes, setEdges]`)
  3. CJM readonlyノードの同期 (`[cjm, sbp.lanes, sbp.tasks, setNodes]`)
- **CJM存在時の自動初期化**: `useEffect`でCJMが存在しSBPがnullの場合、CJMレーンを含むSBPを自動初期化
  - レンダリング中の状態更新を避けるため、必ずuseEffectで実行

**CJM連動の詳細**:
- `kind: 'cjm'` レーンに CJM actions を readonly タスクとして自動表示
- ノードID形式: `cjm-readonly-{actionId}`
- CJMアクションをphase順にソートして配置
- 既存のSBP taskと重複しない（`source_id`でチェック）
- CJM更新時に自動的に追加・削除・更新
- **CJMアクションの位置情報**: `position` フィールドでlocalStorageに永続化
  - ドラッグ移動した位置を保存し、リロード後も保持
  - CJM readonlyタスクもSBP DSLの`tasks`配列に`readonly: true`で保存

**レーン管理**:
- レーンノード: `id: "lane:{laneId}"`, `type: "laneNode"`
- レーン種別: `cjm` (readonly), `human`, `team`, `system`
- レーン追加時の自動配置: Y座標 = `index * (LANE_HEIGHT + LANE_SPACING)`
- DELETEキー・ボタンによる削除を即時DSLに反映
- **空状態からの直接作成**: SBPがnullの場合
  - CJMが存在する場合: 自動的にCJMレーンを含むSBPを初期化（useEffectで実行）
  - CJMが存在しない場合: "CJMを作成する か YAML をロードしてください" メッセージ表示

**タスク管理**:
- タスクノード: `id: taskId`, `type: "taskNode"`, `parentId: "lane:{laneId}"`
- **タスク追加ダイアログ**: レーン選択+タスク名入力（CJMレーンは選択肢から除外）
- **useEffectでの追加検出**: 新規タスクを検出してReact Flowノードを自動作成
- タスク間接続: `connections[]` 配列でハンドル位置も含めて管理
  - `sourceHandle`: 接続開始側のハンドル位置 (`'top' | 'right' | 'bottom' | 'left'`)
  - `targetHandle`: 接続終了側のハンドル位置 (`'top' | 'right' | 'bottom' | 'left'`)
  - 4方向すべてのハンドル接続を許可（JSONスキーマ、TypeScript型定義で対応済み）
- **D&D接続の仕様**:
  - D&D開始側のハンドルから矢印が出る
  - D&D終了側のハンドルに矢印が刺さる（`markerEnd`）
  - source/target入れ替えロジック: React FlowのデフォルトとユーザーUX期待値を調整
- **CJM接続の自動設定**:
  - CJM readonlyタスクから/へ接続時、自動的に通常タスクの`source_id`を設定
  - 双方向D&D対応（CJM→タスク、タスク→CJM）
  - エッジ削除時に`source_id`も自動削除

**UX改善機能**:
- **アライメントガイド**: ドラッグ中に他のタスクとの中央揃えガイド（破線）を表示
  - 水平・垂直の中央位置が近い場合（閾値10px）に表示
  - スナップ機能: ガイド表示時に自動的に位置を調整
  - D&D終了後に破線を即座に非表示
- **接続ハンドル**: タスクノードの4方向すべてに接続ハンドル
  - ホバー時に灰色の丸ハンドルを表示
  - クリック&ドラッグで接続開始
  - 双方向接続可能（矢印は常にD&D終了側）

**プロパティパネル**:
- 幅: 画面の33vw（最小400px）
- タスク編集: タスク名、レーン選択、削除
- レーン編集: レーン名、種別（CJMレーンは変更不可）
- SAVE時の即時反映（ID-based状態管理により）

**技術的詳細**:
- `flowConverter.ts`: DSL ⇔ React Flow 形式の相互変換
  - `dslToFlow()`: connections配列からエッジ生成、CJM readonly node IDに`cjm-readonly-`プレフィックス付与
  - `updateDslFromFlow()`: エッジからconnections配列生成、CJM readonly nodeの位置情報も保存
- `handleNodesChange`: レーン削除も含めたDSL更新
- `handleEdgesDelete`: エッジ削除時にCJM接続の`source_id`をクリア
- `handleConnect`: D&D接続時のsource/target入れ替えとCJM `source_id`自動設定
- `useAlignmentGuides`: アライメントガイドとスナップ機能のカスタムフック
- `LANE_HEIGHT=200`, `LANE_SPACING=20`, `LANE_WIDTH=1400`

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

**✅ 完了**:
- フェーズ1-3: モノレポ、TypeScript設定、全DSLインフラ
- 永続化とバリデーションを持つZustandストア
- UIコンポーネントライブラリ、アプリシェル、ファイル操作（Clear Canvasボタン追加）
- ビルドシステム稼働中
- **CJM Editor完成**:
  - テーブルUI、ドラッグ&ドロップ、感情曲線、プロパティパネル
  - 空状態からの直接作成（フェーズ追加・アクション追加ボタン常時表示）
  - タッチポイント・思考感情フィールドの改行対応
- **SBP Editor完成** (React Flow実装):
  - スイムレーン構造（レーン追加・削除・並び替え・種別変更）
  - CJM連動（readonly ノード自動同期、CJM存在時の自動初期化）
  - タスク追加・削除・接続管理（タスク追加ダイアログ、useEffectでの追加検出）
  - プロパティパネル統合（タスク・レーン編集）
  - ID-based状態管理による即時反映
  - レーン・タスクの即時CRUD反映

**⏳ 未着手**:
- Outcome Editor
- EM Editor

## 関連ドキュメント

- 詳細仕様: [REQUIREMENTS.md](REQUIREMENTS.md)
- 開発計画: [tmp/todo.md](tmp/todo.md)
- イネーブルメントコンセプト: https://note.com/suwash/n/n02fa7e60d409
