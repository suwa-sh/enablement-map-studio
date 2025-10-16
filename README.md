# Enablement Map Studio

![](./docs/images/hero.png)

「**成果**」・「成果に必要な**行動**」・「行動に必要な**知識/スキル**」  を一貫して定義できるビジュアルエディタです。

![](https://assets.st-note.com/production/uploads/images/30783773/picture_pc_488167be7837d639b2e8bcfec0b174e2.png)

Enablement Map Studio は、組織やチームの「成果につながる行動の構造」を **1つのマップ（Enablement Map）** として定義・共有・再利用できます。成果につながる行動の構造とは、「顧客の意思決定プロセス（CJM）」→「組織の価値提供プロセス（SBP）」→「組織の求める成果（Outcome）」→「必要な行動と紐づく知識/スキル（Enablement Map）」のつながりです。

![](https://assets.st-note.com/production/uploads/images/30783789/picture_pc_2ab997e4ad6986bfd433b95e4bc6e6ee.png)

## 背景

多くの企業では、学習と実践が分断され、成果との接続が曖昧になっています。

職種を問わず「成果につながる学習・実践」を進めるためには、成果・行動・知識/スキルがつながる**構造を描く**ことが重要です。
[記事: イネーブルメントで人材育成を成果につなげる](https://note.com/suwash/n/n02fa7e60d409)で紹介しているイネーブルメントのサイクルの内、整理ステージで実施する内容です。
Enablement Map Studio は、この整理ステージを支援して、「**成果から逆算した行動と知識/スキルのつながり**」を共通言語化します。

このプロダクトは、DX推進や人材育成での「ナレッジ共有・行動設計」、プロジェクトマネジメント、教育設計、UX設計、DevOps改善など、あらゆる領域で利用可能な共通基盤を目指しています。


## クイックスタート

### Dockerで利用

```bash
# イメージを取得（最新バージョン）
docker pull ghcr.io/suwa-sh/enablement-map-studio:latest

# コンテナを起動
docker run -p 8080:80 -p 8443:443 ghcr.io/suwa-sh/enablement-map-studio:latest
```

アプリケーションは以下のURLでアクセスできます：
- HTTP: http://localhost:8080
- HTTPS: https://localhost:8443

> **注意**: HTTPSアクセスでは自己署名証明書を使用しています。ブラウザで証明書警告が表示されますが、「詳細設定」→「localhost にアクセスする（安全ではありません）」で進むことができます。

## サポートブラウザ

Enablement Map Studioは、File System Access APIを使用してローカルファイルの読み書きを行います。以下のブラウザでの利用を推奨します。

| ブラウザ | サポート | バージョン |
|---------|---------|-----------|
| Google Chrome | ✅ | 86+ |
| Microsoft Edge | ✅ | 86+ |
| Safari | ✅ | 15.2+ |
| Firefox | ❌ | 非対応 |

> **注意**: Firefoxは File System Access API に対応していないため、ファイルの保存機能が制限されます。Chrome、Edge、Safariでの利用を推奨します。

## 概要

単一のYAMLファイル（\`---\`区切りで複数のDSLを含む）を読み込み、以下の4つのエディタビューをシームレスに切り替えながら、一気通貫で計画を立案・編集できます：

| レイヤ | 目的 | 対応Editor | DSL kind |
|--------|------|-------------|-----------|
| 顧客体験 | 成果が出るまでに顧客が取る行動（カスタマージャーニーマップ）の整理 | CJM Editor | `cjm` |
| 業務プロセス | 顧客の行動を次に進めるために必要な、組織の行動（サービスブループリント）の整理 | SBP Editor | `sbp` |
| 成果定義 | 組織が求める成果（KGI・CSF・KPI）の整理 | Outcome Editor | `outcome` |
| イネーブルメント | 成果に至る行動・必要な知識/スキル（イネーブルメントマップ）の整理 | EM Editor | `em` |

> ここで指しているKPIは、[CSFを特定して単一の数字の変化を追いかけるKPI](https://note.com/suwash/n/n7c5fb05a1009)です。

## 主な機能

### CJM Editor

![](https://share.cleanshot.com/xTJzT9SM+)

- ペルソナの表示・編集
- フェーズとアクションの表示・編集
  - ドラッグ&ドロップによる並び替え
- タッチポイント、思考・感情の表示・編集
- 感情スコア (-2 ~ +2) による感情曲線の可視化

### SBP Editor

![](https://share.cleanshot.com/ZdN4GMyl+)

- React Flowベースのフローダイアグラム
- CJMの定義内容と連動
- レーンの追加、更新、削除、リサイズ、位置変更
- タスクの追加、更新、削除、位置変更
- ドラッグ&ドロップによるタスク接続

### Outcome Editor

![](https://share.cleanshot.com/5QMXtVkq+)

- CJM、SBPの定義内容と連動
- SBPタスクから、CSFを選択
- KGI、CSF、KPIの表示・編集
- CJMフェーズに紐づく、SBPタスクのフィルタリング

### EM Editor

![](https://share.cleanshot.com/xM9kd44R+)

- CJM、SBP、Outcomeの定義内容と連動
- SBPタスクに、必要な行動を追加・更新、削除
- 行動に、スキル・ナレッジ・ツールを紐づけ
- 紐づけたスキル・ナレッジ・ツールを一覧表示、CSVダウンロード、CSV一括登録

### 共通機能

- localStorageによる永続化
- YAMLファイルを開く/保存
  - **Open File**: ローカルのYAMLファイルを開く（Ctrl+O / Cmd+O）
  - **Save**: 開いているファイルに上書き保存（Ctrl+S / Cmd+S）
  - **Save As...**: 別名で保存（Ctrl+Shift+S / Cmd+Shift+S）
- サンプルデータのロード
- キャンバスのクリア
- Undo（Ctrl+Z / Cmd+Z）
- Redo（Ctrl+Shift+Z / Cmd+Shift+Z）

## チームで利用する場合

Enablement Map Studioは、個人で利用するエディタです。チームで定義を共有する場合は、Gitを使ったチーム開発を想定しています。以下のワークフローで、YAMLファイルをバージョン管理できます。

### 基本的な流れ

```bash
# 1. リポジトリをクローン
git clone https://github.com/your-org/your-enablement-map.git
cd your-enablement-map

# 2. ブランチを作成
git checkout -b feature/update-cjm

# 3. Enablement Map Studioでファイルを開く
# Open Fileボタンから enablement-map.yaml を選択

# 4. エディタで編集して保存
# Ctrl+S (Cmd+S) で上書き保存

# 5. 変更をコミット
git add enablement-map.yaml
git commit -m "feat: 顧客体験フローを更新"

# 6. プッシュしてプルリクエスト
git push origin feature/update-cjm
```

### ファイル名の推奨

- メインファイル: `enablement-map.yaml`
- 複数プロジェクト: `project-name-enablement-map.yaml`

### コラボレーション

- YAMLファイルをGitで管理することで、変更履歴を追跡できます
- プルリクエストでレビューを受けられます
- コンフリクトが発生した場合は、通常のGitワークフローで解決できます

## 技術スタック

- **言語**: TypeScript
- **フレームワーク**: React 18+
- **ビルドツール**: Vite
- **状態管理**: Zustand (with persist middleware)
- **ルーティング**: React Router v6
- **スタイリング**: Material-UI (MUI) v7
- **エディタUI**:
  - CJM: MUIテーブル + Recharts + @dnd-kit (ドラッグ&ドロップ)
  - SBP: @xyflow/react (フローダイアグラム)
  - Outcome: MUI Paper/Stack/Button + フィルタリング機能
  - EM: MUI Paper/Stack/Button + react-resizable-panels + TableSortLabel
- **DSL処理**: js-yaml, ajv
- **テスト**:
  - ユニットテスト: Vitest
  - e2eテスト: Playwright (ドラッグ&ドロップを含む包括的なシナリオテスト)
- **Linter/Formatter**: qlty (biome, prettier, eslint)
- **パッケージ管理**: pnpm workspaces

## Dockerイメージ

### 利用可能なタグ

- \`latest\` - 最新リリースバージョン
- \`{version}\` - 特定のバージョン（例: \`1.0.0\`, \`1.0\`, \`1\`）
- \`sha-{commit}\` - 特定のコミット

### カスタムポート

```bash
# 別のポートで起動
docker run -p 3000:80 -p 3443:443 ghcr.io/suwa-sh/enablement-map-studio:latest

# 特定のバージョンを指定
docker run -p 3000:80 -p 3443:443 ghcr.io/suwa-sh/enablement-map-studio:1.0.0
```

### HTTPS証明書について

Dockerイメージには、100年間有効な自己署名証明書が含まれています。証明書には以下のアドレスが登録されています：

- `localhost`, `*.localhost`
- `127.0.0.1` (IPv4ループバック)
- `::1` (IPv6ループバック)
- `0.0.0.0`

ローカルネットワーク内の他のIPアドレス（例: `192.168.x.x`）でアクセスする場合も、ブラウザで証明書警告を許可することで利用できます。

### データの永続化

このアプリケーションは**ブラウザのlocalStorage**にデータを保存します。Dockerコンテナを再起動してもブラウザ側のデータは保持されます。

## 開発に参加する

- 仕様の情報は、[REQUIREMENTS.md](./REQUIREMENTS.md) を参照してください。
- 構成の情報は、[ARCHITECTURE.md](./ARCHITECTURE.md) を参照してください。
- 開発ルールの情報は、[DEVELOPMENT.md](./DEVELOPMENT.md) を参照してください。

## 関連ドキュメント

- [イネーブルメントのコンセプト](https://note.com/suwash/n/n02fa7e60d409)
- [KPIマネジメントのコンセプト](https://note.com/suwash/n/n7c5fb05a1009)

## ライセンス

MIT License
