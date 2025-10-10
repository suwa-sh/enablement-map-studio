# Enablement Map Studio

A unified web application for designing end-to-end processes from customer experience to outcome creation.

[イネーブルメントで人材育成を成果につなげる](https://note.com/suwash/n/n02fa7e60d409)で紹介しているイネーブルメントのサイクルの内、整理ステージを支援するビジュアルエディタです。

## 概要

単一のYAMLファイル（`---`区切りで複数のDSLを含む）を読み込み、以下の4つのエディタビューをシームレスに切り替えながら、一気通貫で計画を立案・編集できます：

- **CJM Editor**: カスタマージャーニーマップの可視化
- **SBP Editor**: サービスブループリント（業務プロセスの可視化）
- **Outcome Editor**: ビジネス成果の定義（CSF/KPI）
- **EM Editor**: イネーブルメントマップ（行動、スキル、ナレッジ、ツール）

## 主な機能

### CJM Editor
- フェーズとアクションのドラッグ&ドロップによる並び替え
- 感情スコア (-2 ~ +2) による感情曲線の可視化
- タッチポイント・思考感情の複数行入力対応
- 空状態からの直接作成（ボタン常時表示）

### SBP Editor
- React Flowベースのフローダイアグラム
- CJM連動（CJMアクションを自動的にreadonly タスクとして表示）
- レーン種別（CJM, Human, Team, System）対応
- タスク追加ダイアログ（レーン選択 + 名前入力）
- 4方向接続ハンドル + アライメントガイド
- ドラッグ&ドロップによるタスク接続とCJM `source_id` 自動設定

### 共通機能
- localStorageによる永続化
- YAML形式でのインポート/エクスポート
- サンプルデータのロード
- Clear Canvasボタン（データクリア）
- Undo/Redo機能（実装予定）

## 技術スタック

- **言語**: TypeScript
- **フレームワーク**: React 18+
- **ビルドツール**: Vite
- **状態管理**: Zustand (with persist middleware)
- **ルーティング**: React Router v6
- **スタイリング**: Material-UI (MUI) v7 + Tailwind CSS
- **エディタUI**:
  - CJM: MUIテーブル + Recharts + @dnd-kit (ドラッグ&ドロップ)
  - SBP: @xyflow/react (フローダイアグラム)
- **DSL処理**: js-yaml, ajv
- **Linter/Formatter**: qlty (biome, prettier, eslint)
- **パッケージ管理**: pnpm workspaces

## 開発環境のセットアップ

### 前提条件

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/suwa-sh/enablement-map-studio.git
cd enablement-map-studio

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

アプリケーションは http://localhost:5173 で起動します。

## プロジェクト構造

```
enablement-map-studio/
├── .qlty/                    # qlty設定
├── apps/
│   └── studio/              # メインアプリケーション
├── packages/
│   ├── dsl/                 # DSL型定義・パーサー
│   ├── store/               # 状態管理（Zustand）
│   ├── ui/                  # 共通UIコンポーネント
│   ├── editor-cjm/          # CJMエディタ
│   ├── editor-sbp/          # SBPエディタ
│   ├── editor-outcome/      # Outcomeエディタ
│   └── editor-em/           # EMエディタ
├── tmp/                     # 仕様書・計画書
│   ├── em_studio.md        # 詳細仕様書
│   └── todo.md             # 開発計画
└── CLAUDE.md               # Claude Code用ガイド
```

## 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# Lint実行
pnpm lint

# フォーマット
pnpm format

# 型チェック
pnpm type-check

# テスト実行
pnpm test
```

## ライセンス

MIT License

## 貢献

このプロジェクトへの貢献を歓迎します。

## 関連リンク

- [仕様書](./REQUIREMENTS.md)
- [実装ガイド](./CLAUDE.md)
