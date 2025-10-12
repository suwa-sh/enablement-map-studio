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
├── ui/            # 共有UIコンポーネント（Toast/ConfirmDialog/ErrorDialog含む）
apps/
└── studio/        # メインVite+Reactアプリケーション
```

### 技術スタック

- **フロントエンド**: React 18+ + TypeScript + Vite
- **状態管理**: Zustand with persist middleware
- **ルーティング**: React Router v6
- **スタイリング**: Material-UI (MUI) v7
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
   - `persona`: ペルソナ情報 (オプション)
     - `name`: ペルソナ名 (必須)
     - `description`: ペルソナの説明 (オプション、複数行テキスト)
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
- **Undo/Redo機能**: `use-undo` ライブラリによる履歴管理
  - すべてのDSL更新操作が自動的に履歴に記録される
  - Undo/Redoボタンで状態を戻す・やり直すことが可能

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

### 通知システム

**MUI通知コンポーネント** ([packages/ui/src/components/](packages/ui/src/components/)):
- **ToastContext**: 情報・成功・エラー通知をSnackbar（MUI Alert）で表示
  - `useToast()` フックで `showToast()` を呼び出し
  - 自動クローズ（デフォルト6秒）、手動クローズ可能
  - 使用例: `showToast({ message: '保存しました', severity: 'success' })`
- **ConfirmDialogContext**: 確認ダイアログ（削除確認など）
  - `useConfirm()` フックで `confirm()` を呼び出し
  - Promise<boolean> を返す（OK: true, キャンセル: false）
  - すべての `window.confirm` を置き換え（非推奨化）
  - 使用例: `const confirmed = await confirm({ message: 'このアイテムを削除してもよろしいですか？' })`
- **ErrorDialogContext**: エラー詳細表示ダイアログ
  - `useErrorDialog()` フックで `showError()` を呼び出し
  - エラーメッセージ＋詳細スタックトレースを表示
  - 使用例: `showError({ message: 'ファイルの読み込みに失敗しました', details: error.message })`

**統合場所**:
- すべてのContextProviderは `AppShell.tsx` でラップ
- すべてのエディタから `@enablement-map-studio/ui` 経由でインポート

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
- **ペルソナカード**: テーブル上部にペルソナ情報を表示
  - Paper elevation={2}、cursor: pointer、ホバー時に背景色変化
  - 表示内容: "ペルソナ: {name}" のみ（説明は非表示）
  - クリックでPropertyPanelが開き、ペルソナ編集が可能
- フェーズとアクションをドラッグ&ドロップで並び替え可能
- 感情曲線をRechartsで可視化（高さ240px）

**操作**:
- **ペルソナ編集**: ペルソナカードクリック → PropertyPanel表示 → ペルソナ名・説明を編集 → SAVE
- フェーズ追加時、自動的に「アクション 1」を作成
- アクション追加はダイアログでフェーズ選択+名前入力
- ドラッグハンドル（≡）とクリックターゲットを分離（activationConstraint: 8px）
- **空状態からの直接作成**: CJMがnullの場合でも「フェーズ追加」「アクション追加」ボタンを表示
  - フェーズ追加時、CJM DSLを初期化してフェーズ+アクションを同時作成
  - メッセージ: "フェーズを追加する か YAML をロードしてください"

**プロパティパネル**:
- 幅: 画面の33vw（最小400px）
- **ペルソナ編集**:
  - タイトル: "ペルソナ"
  - ペルソナ名: TextField（1行）
  - 説明: TextField multiline（rows=6、複数行テキスト）
  - SAVE のみ（DELETEボタンなし、ペルソナは削除不可）
- **アクション編集順**: アクション → タッチポイント → 思考・感情 → 感情スコア
- **フェーズ編集**: フェーズ名のみ
- すべてのラベルを日本語化
- SAVEとDELETEボタンは同じサイズ（flex: 1）
- **タッチポイント・思考感情フィールド**: 改行可能（`.filter(Boolean)` を除去）
- アクション・フェーズ・ペルソナは排他的に表示（同時には表示されない）
- **削除確認**: DELETEボタンクリック時に `useConfirm()` で確認ダイアログを表示

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
- **Undo/Redo対応の重要な実装**:
  - **DSL ⇔ React Flow同期**: useEffectでDSLの `position`/`size` 変更をReact Flowノードに反映
    - レーン: `node.position`, `node.width`, `node.height`, `node.style.width/height` を更新
    - タスク: `node.position` を更新
  - **循環更新の防止**: フラグとカウンターで不要なDSL更新をスキップ
    - `skipNodesChangeRef`: PropertyPanel SAVE時のカウンターベース制御
    - `isDraggingRef`: ドラッグ操作中のフラグベース制御
    - `isResizingRef`: リサイズ操作中のフラグベース制御
  - **操作終了時の一括更新**: ドラッグ/リサイズ終了時に1回だけDSL更新を実行
    - `handleNodeDragStop`: 常にDSL更新（スナップ条件を削除）
    - `handleLaneResizeEnd`: 常にDSL更新（スナップ条件を削除）

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
- レーン初期サイズ: 幅1400px、高さ300px (`LANE_WIDTH`, `LANE_HEIGHT`)
- レーン追加時の自動配置: Y座標 = `index * (LANE_HEIGHT + LANE_SPACING)`
- DELETEキー・ボタンによる削除を即時DSLに反映
- **レーンの位置・サイズ永続化**:
  - `SbpLane`に`position?: { x: number; y: number }`と`size?: { width: number; height: number }`を追加
  - `dslToFlow()`: 保存された位置・サイズを読み込み、なければデフォルト値を使用
  - `updateDslFromFlow()`: React Flowノードから位置・サイズを抽出してDSLに保存
  - NodeResizerのサイズは`node.measured?.width/height`, `node.width/height`, `node.style?.width/height`の優先順で取得
  - `expandParent: false`で親ノードの自動リサイズを防止
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
- **タスクノードのアライメントガイド**: ドラッグ中に他のタスクとの中央揃えガイド（破線）を表示
  - 水平・垂直の中央位置が近い場合（閾値5px）に表示
  - スナップ機能: ガイド表示時に自動的に位置を調整
  - D&D終了後に破線を即座に非表示
- **レーンリサイズのアライメントガイド**: リサイズ中に他のレーン・タスクの端に吸着
  - 他のレーン・タスクの右端・下端との距離が10px以内で破線ガイドを表示
  - リサイズ終了時にスナップ位置を確定
  - `handleLaneResize()`, `handleLaneResizeEnd()` で実装
  - `resizeAlignmentLines` state でガイド線の状態管理
- **接続ハンドル**: タスクノードの4方向すべてに接続ハンドル
  - ホバー時に灰色の丸ハンドルを表示
  - クリック&ドラッグで接続開始
  - 双方向接続可能（矢印は常にD&D終了側）

**プロパティパネル**:
- 幅: 画面の33vw（最小400px）
- タスク編集: タスク名、レーン選択、削除
- レーン編集: レーン名、種別（CJMレーンは変更不可）
- SAVE時の即時反映（ID-based状態管理により）
- **削除確認**: DELETEボタンクリック時に `useConfirm()` で確認ダイアログを表示

**技術的詳細**:
- `flowConverter.ts`: DSL ⇔ React Flow 形式の相互変換
  - `dslToFlow()`: connections配列からエッジ生成、CJM readonly node IDに`cjm-readonly-`プレフィックス付与、レーン位置・サイズ読み込み
  - `updateDslFromFlow()`: エッジからconnections配列生成、CJM readonly nodeの位置情報も保存、レーン位置・サイズ保存
- `handleNodesChange`: レーン削除も含めたDSL更新
- `handleEdgesDelete`: エッジ削除時にCJM接続の`source_id`をクリア
- `handleConnect`: D&D接続時のsource/target入れ替えとCJM `source_id`自動設定
- `useAlignmentGuides`: タスクノードドラッグ時のアライメントガイドとスナップ機能のカスタムフック
- `handleLaneResize`: レーンリサイズ中のアライメントガイド表示（`resizeAlignmentLines` state更新）
- `handleLaneResizeEnd`: レーンリサイズ終了時のスナップ位置確定とガイド非表示
- `LANE_HEIGHT=300`, `LANE_SPACING=20`, `LANE_WIDTH=1400`

### Outcome Editorの実装詳細

**UI構成**:
- MUI Paper/Stack/Buttonによるカード型レイアウト
- レイアウト順序: CJM → SBP → 組織の求める成果
- CJMフェーズボタンによるフィルタリング機能
- SBPタスククリック選択（CSF設定）
- PropertyPanel（33vw幅、MUI Drawer）

**主要機能**:
- **フェーズフィルタリング**: CJMフェーズ選択時、CJMアクションと関連SBPタスクを表示
  - "すべて"ボタンで全アクション・タスク表示
  - フィルタリング時は空のレーンを非表示
- **CJMアクション表示**: CJM領域にフェーズごとにグルーピングして表示
  - 選択フェーズのアクションのみ表示（フィルタリング時）
  - カード型レイアウト（SBPタスクと同様のスタイル）
- **CSF設定**: SBPタスククリックで`primary_csf.source_id`を自動設定
- **KGI/CSF/KPI表示**: 「組織の求める成果」カード内に個別カード表示
  - KGIカード: 名前のみ
  - CSFカード: ソースタスク名 + 説明
  - KPIカード: 名前 + 説明 + フォーマット済み目標値
- **数値フォーマット**: `toLocaleString('ja-JP')`でカンマ区切り、小数点以下は0なら省略
- **自動初期化**: OutcomeがnullでSBP/CJMが存在する場合、useEffectで自動初期化

**PropertyPanel**:
- KGI名入力
- CSF: ソースタスク表示（readonly） + 説明入力
- KPI: 名前、説明、目標値（フォーカス時は数値、フォーカスアウト時はフォーマット）、ユニット選択
- フィールド順: KPI目標値を先に、ユニットを後に（"75" "%" の入力順）

**技術的詳細**:
- `useMemo`でフィルタリングロジック実装
- ID-based状態管理（selectedPhaseId）
- `OutcomeCanvas.tsx`: 読み取り専用ビュー
- `PropertyPanel.tsx`: 編集UI（Drawer）

### EM Editorの実装詳細

**UI構成** (2025年1月 - カードベースレイアウトに改訂):
- **エディタペイン** (上部): カード型レイアウトによるフィルタリング＆閲覧
  - レイアウト順序: 組織の求める成果 → 顧客 → 顧客の意思決定プロセス → 組織の価値提供プロセス → 必要な行動
  - 組織の求める成果カード（KGI/CSF/KPI表示）
  - 顧客カード（ペルソナ表示：名前＋説明、複数行テキスト対応）
  - 顧客の意思決定プロセスカード（CJMフェーズフィルタボタン群＋CJMアクション表示）
  - 組織の価値提供プロセスカード（SBPレーン・タスクカード、レーンフィルタボタン付き）
  - EM行動カード（クリックでPropertyPanel表示）
- **リソース一覧ペイン** (下部): react-resizable-panelsによるリサイズ可能なテーブル
  - **カードレイアウト**: Paper elevation={2} でラップ、padding 24px、grey.50背景色
  - エディタ領域の「求める成果」カードと同じ構造（カード内にテーブルを配置）
  - CSF/CJMフェーズ/CJMアクション/SBPレーン/SBPタスク/必要な行動/リンクタイプ/名前/URLカラム
  - CSF行（true）を緑色＋チェックボックスで強調表示
  - 全カラムでソート可能（昇順/降順）
  - テキスト検索フィルタ
  - 互い違いの背景色（白/薄いグレー）
  - ヘッダー: 明るいグレー背景
- **PropertyPanel** (右ペイン, 33vw幅):
  - 行動名入力
  - スキル一覧（学習コンテンツあり、`learnings[].title`フィールド使用）
  - ナレッジ一覧（URL付き）
  - ツール一覧（URL付き）
  - 各リソースの追加・削除機能
  - SAVE/DELETEボタン

**フィルタリング機能**:
- **CSFフィルタ**: CSFボタンをクリックすると、CSFに紐づく以下の要素のみ表示
  - CSFに紐づくCJMアクション
  - CSFに紐づくSBPレーン
  - CSFに紐づくSBPタスク
  - CSFに紐づくEM行動
- **CJMフェーズフィルタ**: 選択したフェーズに紐づくCJMアクション、SBPタスク、EM行動を表示
  - CJMアクション: 選択フェーズのアクションのみ表示
  - SBPタスク: 選択フェーズのCJMアクションにリンクされたタスクのみ表示
  - EM行動: フィルタリングされたSBPタスクにリンクされた行動のみ表示
- **SBPレーンフィルタ**: 選択したレーンに属するSBPタスク、EM行動を表示
- **フィルタ連携**: CSFフィルタが有効な場合、他のフィルタは無効化（CSFが最優先）

**リソース一覧テーブル**:
- **行の構造**: 各行は「SBPタスク × EM行動 × リソース（スキル/ナレッジ/ツール）」の組み合わせ
- **CSFカラム**: SBPタスクがCSF（`outcome.primary_csf.source_id`）と一致する場合true、read onlyチェックボックスで表示
- **CSF行の強調**: true行は背景色 `#c8e6c9`（緑）、太字
- **ソート機能**: 全カラムのヘッダーをクリックで昇順/降順切り替え（TableSortLabel）
- **フィルタ機能**: 検索欄（TextField）で全カラムを横断検索
- **スキル/学習コンテンツ**: `{スキル名} / {学習コンテンツtitle}` 形式で表示（`learning.title`を使用）
- **ナレッジ/ツール**: 名前のみ表示（URLは別カラム）

**主要機能**:
- **「必要な行動を追加」ボタン**: 新規EM Action作成 → PropertyPanel自動表示
- **自動初期化**: EMがnullでOutcome/SBP/CJMが存在する場合、useEffectでEM初期化
  - `outcomes`配列に`{ id, source_id: outcome.primary_kpi.id }`を設定
- **Skills/Knowledge/Tools追加**: PropertyPanelの「追加」ボタンで即座に追加
  - スキル: `{ id, name, action_id, learnings: [] }`
    - 学習コンテンツ: `{ title, url }` （`title`フィールド使用、`id`なし）
    - インデックスベースの更新（`learningIndex`で識別）
  - ナレッジ: `{ id, name, action_id, url: '' }`
  - ツール: `{ id, name, action_id, url: '' }`
- **クリック外で閉じる**: PropertyPanel以外の領域をクリックするとパネルを閉じる（`stopPropagation()`で行動カードクリックを保護）

**PropertyPanel詳細**:
- 行動名入力
- スキル一覧: 各スキルに学習コンテンツ（`title`, `url`）を複数追加可能
  - 学習コンテンツのフィールド: `learning.title`（`name`ではない）
  - インデックスベースの更新で連動問題を解消
- ナレッジ一覧: 名前＋URL入力
- ツール一覧: 名前＋URL入力
- SAVE/DELETEボタン（DELETEは関連リソースも一括削除）
- **削除確認**: すべてのDELETEボタンクリック時に `useConfirm()` で確認ダイアログを表示（行動削除、スキル削除、学習コンテンツ削除、ナレッジ削除、ツール削除）

**技術的詳細**:
- **EmCanvasCard.tsx**: カード型レイアウト、フィルタリングロジック（useMemo）
  - 1カラムレイアウト: 組織の求める成果、顧客、顧客の意思決定プロセス、組織の価値提供プロセス、必要な行動を縦に配置
  - 顧客カード: `cjm.persona`表示（名前＋説明、`whiteSpace: 'pre-wrap'`で複数行対応）
  - CJMアクション表示: フェーズごとにグルーピング、選択フェーズのみ表示
  - CSF関連データ計算: `csfFilterActive`フラグと`csfRelatedData`で管理
  - KPI表示フォーマット: `{名前}: {目標値}{ユニット}` （例: "申込完了率: 75%"）
  - レーンフィルタボタン群: `selectedLaneId`で管理、"すべて"ボタン付き
  - 行動カードクリック: `e.stopPropagation()`でパネル閉じを防止
  - フィルタリング強化: `visibleActions`にフェーズフィルタロジックを追加（CJMアクション → SBPタスク → EM行動の連動絞り込み）
- **EmTable.tsx**: ソート・フィルタリング機能付きテーブル、Paper elevation={2}でラップ
  - `sortColumn`, `sortOrder`, `filterText`で状態管理
  - `isCSF: boolean`でCSF行を判定（以前は`csfName: string`）
  - Checkbox表示: `<Checkbox checked={row.isCSF} disabled size="small" />`
  - 背景色: `index % 2 === 0 ? 'white' : 'grey.50'`（互い違い）
  - ヘッダー背景色: `grey.300`（明るいグレー）
  - CSF行強調: 背景色 `#c8e6c9`、太字
  - TableContainer: `maxHeight: 'calc(100vh - 500px)'`でスクロール対応
- **PropertyPanelNew.tsx**: 学習コンテンツの`title`フィールド使用、インデックスベース更新
  - 学習コンテンツ: `learning.title`（`name`ではない）
  - 更新関数: `handleLearningChange(learningIndex: number, field: 'title' | 'url', value: string)`
  - インデックスベースの更新: `learnings.map((l, idx) => idx === learningIndex ? {...l, [field]: value} : l)`
- **EmEditor.tsx**: メインコンテナ、クリック外で閉じる機能、リソース一覧ペインのレイアウト管理
  - onClick handler: PropertyPanel以外のクリックで`setSelectedAction(null)`
  - PanelGroup (react-resizable-panels): エディタペインとリソース一覧ペインのリサイズ対応
  - リソース一覧ペイン: `<Box sx={{ height: '100%', bgcolor: 'grey.50', p: 3, overflow: 'auto' }}>` でEmTableをラップ（padding 24pxで視覚的分離）

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
- **MUI通知システム**: Toast/ConfirmDialog/ErrorDialog統合（uiパッケージに配置）
- ビルドシステム稼働中
- **CJM Editor完成**:
  - テーブルUI、ドラッグ&ドロップ、感情曲線、プロパティパネル
  - 空状態からの直接作成（フェーズ追加・アクション追加ボタン常時表示）
  - タッチポイント・思考感情フィールドの改行対応
  - ペルソナ表示・編集機能（カードクリック → PropertyPanel表示）
- **SBP Editor完成** (React Flow実装):
  - スイムレーン構造（レーン追加・削除・並び替え・種別変更）
  - CJM連動（readonly ノード自動同期、CJM存在時の自動初期化）
  - タスク追加・削除・接続管理（タスク追加ダイアログ、useEffectでの追加検出）
  - プロパティパネル統合（タスク・レーン編集）
  - ID-based状態管理による即時反映
  - レーン・タスクの即時CRUD反映

- **Outcome Editor完成**:
  - CJMフェーズフィルタリング
  - SBPタスククリックCSF設定
  - KGI/CSF/KPI個別カード表示（「求める成果」カード内にネスト）
  - 数値フォーマット対応
  - PropertyPanel統合
- **EM Editor完成** (カードベースレイアウト):
  - エディタペイン: カード型UI、1カラムレイアウト
  - フィルタリング機能: CSF/CJMフェーズ/SBPレーン
  - リソース一覧テーブル: Paper elevation={2}でカードラップ、ソート・検索・CSF強調表示
  - PropertyPanel: スキル/ナレッジ/ツール編集（学習コンテンツ`title`フィールド対応）
  - クリック外で閉じる機能
  - すべての削除操作に確認ダイアログ統合（5箇所）

**⏳ 改善予定**:
- すべてのエディタのUX改善

## 関連ドキュメント

- 詳細仕様: [REQUIREMENTS.md](REQUIREMENTS.md)
- 開発計画: [tmp/todo.md](tmp/todo.md)
- イネーブルメントコンセプト: https://note.com/suwash/n/n02fa7e60d409
