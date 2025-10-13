# Development Guide

このドキュメントは、Enablement Map Studioの開発環境のセットアップ方法と開発ワークフローについて説明します。

## 前提条件

開発を始める前に、以下のツールがインストールされていることを確認してください：

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

### ツールのインストール

#### Node.js
- [公式サイト](https://nodejs.org/)からダウンロード
- または[nvm](https://github.com/nvm-sh/nvm)を使用してバージョン管理

#### pnpm
```bash
npm install -g pnpm
```

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/suwa-sh/enablement-map-studio.git
cd enablement-map-studio
```

### 2. 依存関係のインストール

```bash
pnpm install
```

このコマンドは、すべてのワークスペース（`packages/`と`apps/`）の依存関係をインストールします。

### 3. 開発サーバーの起動

```bash
pnpm dev
```

アプリケーションは http://localhost:5173 で起動します。

## 開発コマンド

### 開発サーバー起動

```bash
pnpm dev
```

Viteの開発サーバーを起動します。ファイルの変更を監視し、ホットリロードが有効になります。

### ビルド

```bash
pnpm build
```

すべてのパッケージとアプリケーションをプロダクション用にビルドします。出力は`apps/studio/dist/`に生成されます。

### Lint実行

```bash
pnpm lint
```

qlty（biome, prettier, eslint）を使用してコード品質をチェックします。

### フォーマット

```bash
pnpm format
```

qltyを使用してコードを自動フォーマットします。

### 型チェック

```bash
pnpm type-check
```

TypeScriptの型チェックを実行します（コンパイルなし）。

### テスト実行

```bash
pnpm test
```

Vitestでテストを実行します（実装時）。

## プロジェクト構造

```
enablement-map-studio/
├── .github/                 # GitHub Actions workflows
├── .qlty/                   # qlty設定
├── apps/
│   └── studio/             # メインアプリケーション（Vite + React）
│       ├── src/            # ソースコード
│       ├── public/         # 静的ファイル（sample.yamlなど）
│       └── dist/           # ビルド出力（生成される）
├── packages/
│   ├── dsl/                # DSL型定義・パーサー・バリデーター
│   ├── store/              # 状態管理（Zustand + persist）
│   ├── ui/                 # 共通UIコンポーネント（Toast/ConfirmDialog/ErrorDialog含む）
│   ├── editor-cjm/         # CJMエディタ
│   ├── editor-sbp/         # SBPエディタ
│   ├── editor-outcome/     # Outcomeエディタ
│   └── editor-em/          # EMエディタ
├── Dockerfile              # Docker multi-stage build
├── nginx.conf              # Nginx設定（SPA対応）
├── CLAUDE.md               # Claude Code用ガイド
└── REQUIREMENTS.md         # 詳細仕様
```

## ワークスペース構成

このプロジェクトは**pnpm workspaces**を使用したモノレポ構成です。各パッケージは独立しており、以下のように相互参照されています：

- `@enablement-map-studio/dsl` - DSL型定義とパーサー
- `@enablement-map-studio/store` - Zustandストア
- `@enablement-map-studio/ui` - 共通UIコンポーネント
- エディタパッケージ（cjm, sbp, outcome, em）

## Dockerイメージのローカルビルド

### ビルド

```bash
docker build -t enablement-map-studio:local .
```

### 実行

```bash
docker run -p 8080:80 enablement-map-studio:local
```

アプリケーションは http://localhost:8080 でアクセスできます。

### マルチプラットフォームビルド

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t enablement-map-studio:local .
```

## 開発ワークフロー

### DSLスキーマの変更

DSLスキーマを変更する場合、以下の手順を実行してください：

1. `packages/dsl/src/types/{dsl}.ts` のTypeScript型を更新
2. `packages/dsl/src/schemas/{dsl}.json` のJSONスキーマを更新
3. DSL間参照を追加する場合、`packages/dsl/src/utils/reference-check.ts` を更新
4. `apps/studio/public/sample.yaml` を更新
5. `pnpm build` を実行して検証

### 新しいエディタ機能の追加

1. 該当するエディタパッケージ（`packages/editor-*/`）を編集
2. 必要に応じてストア（`packages/store/`）を更新
3. UIコンポーネントを追加する場合は`packages/ui/`に配置
4. `pnpm dev`で動作確認

### 参照整合性のテスト

`apps/studio/public/sample.yaml`をUIで読み込み、ブラウザコンソールで参照チェック結果を確認してください。

## GitHub Actionsでの自動公開

このプロジェクトは、タグをpushすると自動的にGitHub Container Registry (ghcr.io) に公開されます。

### バージョンタグのルール

- **セマンティックバージョニング**: `major.minor.patch` 形式
  - `1.0.0`, `2.1.3`

### タグの作成と公開

```bash
# バージョンタグを作成
git tag 1.0.0

# タグをpush（自動的にビルド・公開される）
git push origin 1.0.0
```

### 生成されるイメージタグ

タグ `1.0.0` をpushすると、以下のイメージタグが生成されます：
- `ghcr.io/suwa-sh/enablement-map-studio:latest` - 最新リリース（常に更新）
- `ghcr.io/suwa-sh/enablement-map-studio:1.0.0` - 完全なバージョン
- `ghcr.io/suwa-sh/enablement-map-studio:1.0` - マイナーバージョン
- `ghcr.io/suwa-sh/enablement-map-studio:1` - メジャーバージョン
- `ghcr.io/suwa-sh/enablement-map-studio:sha-{commit}` - コミットSHA

### 注意事項

- mainブランチへのpushでは自動公開されません（タグpush時のみ）
- マルチプラットフォーム対応（linux/amd64, linux/arm64）
- GitHub Actionsのビルドログは[Actions]タブで確認できます

## トラブルシューティング

### ビルドエラー

```bash
# node_modulesをクリーンアップ
rm -rf node_modules
rm -rf packages/*/node_modules
rm -rf apps/*/node_modules

# 再インストール
pnpm install
```

### 型エラー

```bash
# 型チェックを実行して詳細を確認
pnpm type-check
```

### ポートが使用中

開発サーバーのデフォルトポート（5173）が使用中の場合、Viteは自動的に別のポートを使用します。コンソール出力を確認してください。

## 関連ドキュメント

- [README.md](./README.md) - プロジェクト概要とDocker利用方法
- [REQUIREMENTS.md](./REQUIREMENTS.md) - 詳細仕様
- [CLAUDE.md](./CLAUDE.md) - Claude Code用の実装ガイド
- [イネーブルメントのコンセプト](https://note.com/suwash/n/n02fa7e60d409)

## 貢献

プルリクエストを送信する前に：

1. `pnpm lint` でコード品質をチェック
2. `pnpm type-check` で型エラーがないことを確認
3. `pnpm build` でビルドが成功することを確認
4. 変更内容を明確に説明したコミットメッセージを作成

## ライセンス

MIT License
