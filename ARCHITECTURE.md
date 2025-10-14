# ARCHITECTURE

## 概要

Enablement Map Studioは、ブラウザ上で動作する単一ユーザー向けのWebアプリケーションです。
データはブラウザのlocalStorageに永続化され、File System Access APIを使用してローカルのYAMLファイルと直接読み書きできます。

### 実装済み機能

- **File System Access API**: ローカルファイルとの直接読み書き（Open File, Save, Save As...）
- **キーボードショートカット**: Ctrl+S / Cmd+S で上書き保存
- **未保存変更の検知**: ファイル名に `*` マークを表示、ブラウザ終了時に警告
- **Git連携サポート**: ローカルにcloneしたYAMLファイルを編集し、Gitでバージョン管理可能

### ブラウザサポート

| ブラウザ | サポート状況 |
|---------|-------------|
| Chrome 86+ | ✅ 完全サポート |
| Edge 86+ | ✅ 完全サポート |
| Safari 15.2+ | ✅ 完全サポート |
| Firefox | ❌ File System Access API 非対応 |

## アーキテクチャ (C4 Model)

### Level 1: システムコンテキスト

```mermaid
graph TB
    User[ユーザー]
    Studio[Enablement Map Studio]
    LocalStorage[(Browser localStorage)]
    FileSystem[ファイルシステム]

    User -->|編集操作| Studio
    Studio -->|永続化| LocalStorage
    Studio -->|YAML Import/Export| FileSystem
```

| 要素名 | 説明 |
|--------|------|
| ユーザー | 単一のブラウザユーザー |
| Enablement Map Studio | SPAアプリケーション (React + Vite) |
| Browser localStorage | ブラウザ内のデータストレージ |
| ファイルシステム | YAMLファイルのインポート/エクスポート先 |

### Level 2: コンテナ

```mermaid
graph TB
    User[ユーザー]

    subgraph Browser
        subgraph "React Application"
            CJM[CJM Editor]
            SBP[SBP Editor]
            Outcome[Outcome Editor]
            EM[EM Editor]
            Store[Zustand Store]
        end
        LocalStorage[(localStorage)]
    end

    FileSystem[YAML Files]

    User --> CJM
    User --> SBP
    User --> Outcome
    User --> EM

    CJM --> Store
    SBP --> Store
    Outcome --> Store
    EM --> Store

    Store --> LocalStorage
    Store --> FileSystem
```

| 要素名 | 説明 |
|--------|------|
| CJM Editor | カスタマージャーニーマップの編集UI |
| SBP Editor | サービスブループリントの編集UI |
| Outcome Editor | 成果定義の編集UI |
| EM Editor | イネーブルメントマップの編集UI |
| Zustand Store | アプリケーション全体の状態管理 |
| localStorage | ブラウザ内データ永続化 |
| YAML Files | データのインポート/エクスポート形式 |

### Level 3: コンポーネント

```mermaid
graph TB
    subgraph "Packages"
        subgraph "@enablement-map-studio/dsl"
            Types[Type Definitions]
            Parser[YAML Parser]
            Validator[Schema Validator]
            RefCheck[Reference Checker]
        end

        subgraph "@enablement-map-studio/store"
            StoreImpl[Store Implementation]
            Actions[Store Actions]
        end

        subgraph "@enablement-map-studio/ui"
            UIComponents[Shared UI Components]
        end

        subgraph "Editor Packages"
            EditorCJM[editor-cjm]
            EditorSBP[editor-sbp]
            EditorOutcome[editor-outcome]
            EditorEM[editor-em]
        end
    end

    subgraph "apps/studio"
        App[App Component]
        Shell[App Shell]
        FileOps[File Operations]
    end

    App --> Shell
    Shell --> EditorCJM
    Shell --> EditorSBP
    Shell --> EditorOutcome
    Shell --> EditorEM
    Shell --> FileOps

    EditorCJM --> StoreImpl
    EditorSBP --> StoreImpl
    EditorOutcome --> StoreImpl
    EditorEM --> StoreImpl

    StoreImpl --> Types
    FileOps --> Parser
    Parser --> Validator
    Parser --> RefCheck
```

| 要素名 | 説明 |
|--------|------|
| Type Definitions | DSLの型定義 (CjmDsl, SbpDsl, OutcomeDsl, EmDsl) |
| YAML Parser | YAML形式のパース/エクスポート |
| Schema Validator | JSONスキーマによるバリデーション |
| Reference Checker | DSL間の参照整合性チェック |
| Store Implementation | Zustandストアの実装 (persist middleware) |
| Store Actions | loadYaml, exportYaml, updateCjm等のアクション |
| Shared UI Components | Toast, ConfirmDialog, ErrorDialog等 |
| Editor Packages | 各エディタの実装パッケージ |
| File Operations | YAML Import/Export/Sample Load/Clear Canvas |

## データモデル

### ER図

```mermaid
erDiagram
    CJM_DSL ||--|{ CJM_PHASE : contains
    CJM_DSL ||--|{ CJM_ACTION : contains
    CJM_DSL ||--o| CJM_PERSONA : has

    CJM_ACTION }o--|| CJM_PHASE : belongs_to

    SBP_DSL ||--|{ SBP_LANE : contains
    SBP_DSL ||--|{ SBP_TASK : contains

    SBP_TASK }o--|| SBP_LANE : belongs_to
    SBP_TASK }o--o| CJM_ACTION : references
    SBP_TASK }o--o{ SBP_TASK : links_to

    OUTCOME_DSL ||--|| OUTCOME_KGI : has
    OUTCOME_DSL ||--|| OUTCOME_CSF : has
    OUTCOME_DSL ||--|| OUTCOME_KPI : has

    OUTCOME_CSF }o--o| SBP_TASK : references

    EM_DSL ||--|{ EM_OUTCOME : contains
    EM_DSL ||--|{ EM_ACTION : contains
    EM_DSL ||--|{ EM_SKILL : contains
    EM_DSL ||--|{ EM_KNOWLEDGE : contains
    EM_DSL ||--|{ EM_TOOL : contains

    EM_OUTCOME }o--o| OUTCOME_KPI : references
    EM_ACTION }o--o| SBP_TASK : references
    EM_SKILL }o--|| EM_ACTION : belongs_to
    EM_KNOWLEDGE }o--|| EM_ACTION : belongs_to
    EM_TOOL }o--|| EM_ACTION : belongs_to
```

| エンティティ | 説明 |
|------------|------|
| CJM_DSL | カスタマージャーニーマップのルート |
| CJM_PERSONA | ペルソナ情報 |
| CJM_PHASE | ジャーニーのフェーズ |
| CJM_ACTION | 顧客のアクション |
| SBP_DSL | サービスブループリントのルート |
| SBP_LANE | スイムレーン (cjm/human/team/system) |
| SBP_TASK | タスク (業務プロセスのステップ) |
| OUTCOME_DSL | 成果定義のルート |
| OUTCOME_KGI | 重要目標達成指標 |
| OUTCOME_CSF | 重要成功要因 |
| OUTCOME_KPI | 重要業績評価指標 |
| EM_DSL | イネーブルメントマップのルート |
| EM_OUTCOME | 成果 |
| EM_ACTION | 必要な行動 |
| EM_SKILL | スキル |
| EM_KNOWLEDGE | ナレッジ |
| EM_TOOL | ツール |

### 参照関係

```mermaid
graph LR
    CJM_ACTION -->|source_id| SBP_TASK
    SBP_TASK -->|source_id| OUTCOME_CSF
    SBP_TASK -->|source_id| EM_ACTION
    OUTCOME_KPI -->|source_id| EM_OUTCOME
```

| 参照元 | 参照先 | フィールド | 説明 |
|-------|-------|-----------|------|
| SBP_TASK | CJM_ACTION | source_id | タスクが対応する顧客アクション |
| OUTCOME_CSF | SBP_TASK | source_id | CSFの根拠となるタスク |
| EM_ACTION | SBP_TASK | source_id | 行動が対応するタスク |
| EM_OUTCOME | OUTCOME_KPI | source_id | 成果が対応するKPI |

## 処理フロー

### YAML読み込みフロー

```mermaid
sequenceDiagram
    participant User
    participant FileOps
    participant Store
    participant Parser
    participant Validator
    participant RefChecker
    participant LocalStorage

    User->>FileOps: Load YAML
    FileOps->>Parser: parseYaml(content)
    Parser->>Parser: yaml.loadAll()
    Parser->>Validator: validateDsl(doc)
    Validator-->>Parser: validation result
    Parser-->>FileOps: ParsedYaml
    FileOps->>Store: loadYaml(content)
    Store->>RefChecker: checkReferenceIntegrity(parsed)
    RefChecker-->>Store: ReferenceCheckResult
    Store->>LocalStorage: persist state
    LocalStorage-->>Store: OK
    Store-->>FileOps: OK
    FileOps-->>User: Success Toast
```

| ステップ | 説明 |
|---------|------|
| 1. Load YAML | ユーザーがYAMLファイルを選択 |
| 2. parseYaml | js-yamlでパース (複数ドキュメント対応) |
| 3. validateDsl | ajvでJSONスキーマ検証 |
| 4. loadYaml | Zustandストアに格納 |
| 5. checkReferenceIntegrity | DSL間の参照整合性チェック |
| 6. persist | localStorage に永続化 |
| 7. Success Toast | 成功通知を表示 |

### YAML出力フロー

```mermaid
sequenceDiagram
    participant User
    participant FileOps
    participant Store
    participant Parser
    participant FileSystem

    User->>FileOps: Export YAML
    FileOps->>Store: exportYaml()
    Store->>Parser: exportYaml(state)
    Parser->>Parser: yaml.dump(doc) x N
    Parser-->>Store: YAML string
    Store-->>FileOps: YAML string
    FileOps->>FileOps: create Blob
    FileOps->>FileSystem: download file
    FileSystem-->>User: enablement-map.yaml
    FileOps-->>User: Success Toast
```

| ステップ | 説明 |
|---------|------|
| 1. Export YAML | ユーザーがエクスポートを実行 |
| 2. exportYaml | Zustandストアから状態を取得 |
| 3. yaml.dump | 各DSLをYAML形式にシリアライズ |
| 4. create Blob | ファイルとしてダウンロード可能な形式に変換 |
| 5. download file | ブラウザのダウンロード機能で保存 |
| 6. Success Toast | 成功通知を表示 |

### エディタ操作フロー

```mermaid
sequenceDiagram
    participant User
    participant Editor
    participant Store
    participant RefChecker
    participant LocalStorage

    User->>Editor: Edit DSL Element
    Editor->>Editor: Update local state
    Editor->>Store: updateCjm/updateSbp/etc(dsl)
    Store->>Store: set state
    Store->>RefChecker: checkReferences()
    RefChecker-->>Store: ReferenceCheckResult
    Store->>LocalStorage: persist
    LocalStorage-->>Store: OK
    Store-->>Editor: state updated
    Editor-->>User: UI re-render
```

| ステップ | 説明 |
|---------|------|
| 1. Edit Element | ユーザーがUI上で要素を編集 |
| 2. Update local state | エディタ内のReact stateを更新 |
| 3. updateXxx | Zustandストアの更新アクションを実行 |
| 4. checkReferences | 参照整合性を自動チェック |
| 5. persist | localStorageに永続化 |
| 6. UI re-render | 変更がUIに反映される |

## 制約と課題

### 現状の制約

| 項目 | 内容 |
|------|------|
| ユーザー数 | 単一ユーザーのみ (ブラウザごとに独立) |
| データ共有 | YAMLファイルの手動エクスポート/インポートのみ |
| 同時編集 | 不可能 (最後に保存した内容で上書き) |
| バージョン管理 | なし (Undo/Redoはセッション内のみ) |
| 認証・認可 | なし |
| データバックアップ | ユーザー自身がYAMLファイルを保存 |
| 衝突解決 | なし (手動マージが必要) |

### 課題

| 課題 | 説明 |
|------|------|
| データ消失リスク | localStorageのクリアでデータが失われる |
| 共同作業の困難さ | 複数人での編集は手動でのファイル共有が必要 |
| 変更履歴の欠如 | 誰がいつ何を変更したか追跡できない |
| 衝突の手動解決 | 複数人が並行編集すると手動マージが必要 |
| スケーラビリティ | 大規模チームでの利用には不向き |
