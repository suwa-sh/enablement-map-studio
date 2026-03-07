---
name: emstudio-deploy
description: "Enablement Map Studioのデプロイや運用を支援します。Dockerでのデプロイ、チームでのGit運用フロー構築、CI/CD設定などを案内します。「enablement-map-studioをデプロイ」「イネーブルメントマップのDockerセットアップ」「EMスタジオをチームで運用」「enablement-mapのGit運用」「EMスタジオの環境構築」などのキーワードで発動します。"
argument-hint: "<デプロイ先やチーム構成などの情報（任意）>"
---

# Enablement Map Studio デプロイ・運用支援

Enablement Map StudioのDockerデプロイとチームでのGit運用フロー構築を支援します。

## ワークフロー

### Step 1: 要件の確認

ユーザーに以下を確認する:

| 項目 | 選択肢 |
|------|--------|
| 用途 | 個人利用 / チーム利用 |
| デプロイ方式 | ローカルDocker / サーバーデプロイ / 開発環境(pnpm dev) |
| HTTPS | 必要 / 不要 |

### Step 2: Docker デプロイ

#### ローカル利用（最もシンプル）

```bash
docker run -p 8080:80 -p 8443:443 ghcr.io/suwa-sh/enablement-map-studio:latest
```

- HTTP: http://localhost:8080
- HTTPS: https://localhost:8443

#### docker-compose での運用

```yaml
services:
  enablement-map-studio:
    image: ghcr.io/suwa-sh/enablement-map-studio:latest
    ports:
      - "8080:80"
      - "8443:443"
    restart: unless-stopped
```

#### 利用可能なイメージタグ

| タグ | 説明 |
|------|------|
| `latest` | 最新リリース |
| `{version}` | 特定バージョン（例: 1.0.0） |
| `sha-{commit}` | 特定コミット |

#### HTTPS証明書

- 自己署名証明書がビルド時に自動生成される（100年有効）
- 対応SAN: localhost, *.localhost, 127.0.0.1, ::1, 0.0.0.0
- ブラウザで証明書警告が表示される場合は「詳細設定」→「続行」で進む

### Step 3: 開発環境セットアップ（ソースから実行する場合）

```bash
# 前提条件: Node.js 18+, pnpm 8+
git clone https://github.com/suwa-sh/enablement-map-studio.git
cd enablement-map-studio
pnpm install
pnpm dev
# http://localhost:5173 でアクセス
```

### Step 4: チームでのGit運用フロー

チームでYAMLファイルを共有する場合のリポジトリ構成を提案する。

#### 推奨リポジトリ構成

```
your-enablement-maps/
├── README.md                         # 運用ルール、利用手順
├── maps/
│   ├── project-a-enablement-map.yaml # プロジェクトA
│   └── project-b-enablement-map.yaml # プロジェクトB
└── .gitignore
```

#### 運用フロー

```bash
# 1. ブランチを作成
git checkout -b feature/update-cjm

# 2. Enablement Map Studioでファイルを開いて編集
# Open Fileボタンから maps/project-a-enablement-map.yaml を選択
# 編集後 Ctrl+S (Cmd+S) で保存

# 3. 変更をコミット・プッシュ
git add maps/project-a-enablement-map.yaml
git commit -m "feat: 顧客体験フローを更新"
git push origin feature/update-cjm

# 4. プルリクエストでレビュー
```

#### ファイル命名規則

- メインファイル: `enablement-map.yaml`
- 複数プロジェクト: `{project-name}-enablement-map.yaml`

### Step 5: サポートブラウザの案内

| ブラウザ | サポート | バージョン |
|---------|---------|-----------|
| Chrome | Yes | 86+ |
| Edge | Yes | 86+ |
| Safari | Yes | 15.2+ |
| Firefox | No | File System Access API非対応 |

File System Access APIを使ったファイル保存にはChrome/Edge/Safariが必要。

### Step 6: 結果の提示

- デプロイ方法のサマリー
- アクセスURL
- チーム運用の場合はREADMEテンプレートの提供

## 注意事項

- データはブラウザのlocalStorageに保存されるため、コンテナ再起動でもブラウザ側のデータは保持される
- チーム間のコンフリクト解決は通常のGitワークフローで対応
- リバースプロキシ配下で運用する場合は、ポートマッピングを適宜調整
