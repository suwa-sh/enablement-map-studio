# AI駆動開発 組織標準化マップ(サンプル解説)

AI コーディングツールを配布したあと、「使う人と使わない人の差が開き、組織として生産性が上がったのか確かめられない」という壁に向き合うためのマップです。個人差を組織標準で埋める導入設計を、成果 ↔ 行動 ↔ 知識・スキルのつながりとして表現しています。

このマップでは、AI ツールを配布された**現場エンジニアを「AI enablement サービスの内部顧客」として扱います**。カスタマージャーニーの主人公は現場エンジニアで、推進チーム・Champions・経営はその体験を支える裏方(サービス提供側)に置いています。

- サンプル YAML: [ai-dev-org-standardization.yaml](./ai-dev-org-standardization.yaml)
- 開き方: studio の「Open File」でこの YAML を選択します(手順は [samples/README](./README.md))

## このマップで判断できること

| 判断 | マップ上の場所 |
|---|---|
| 何を組織標準として固定し、何を現場の裁量に残すか | EM の「必要な行動」の【固定層】/【可変層】表記 |
| 標準をどう浸透させるか(強制でなく能力移転) | SBP の推進チーム・Champions レーンのタスク |
| AI 活用度をどう測り、どの指標と併読するか | Outcome の KPI 定義と、経営・EM レーンのタスク |
| 計測と標準化が逆効果になる罠をどう避けるか | EM のナレッジ「罠1〜罠4」と本書の「罠の回避」節 |

## 商談・導入検討で 3 分で見る順序

1. **CJM の感情曲線**(1 分): 配布直後〜個人試行の谷(心理・品質・時間・プロセスの障壁)と、golden path 以降の回復を見ます。「いまはこの谷のどこですか?」
2. **Outcome の KPI**(1 分): 「プロセス別 AI 組み込み度」が単独指標でなく、安定性指標と緊張させて併読する設計であることを見ます。「いま何で AI 活用を測っていますか? その指標は成果とつながっていますか?」
3. **EM の必要な行動**(1 分): 【固定層】と【可変層】の分け方を見ます。「いまツールやプロンプトまで標準で固定しようとしていませんか?」

**自組織版に差し替える項目**: ペルソナ(職種・障壁の実態)/ フェーズ名 / SBP のレーン(推進体制の実名)/ KPI の定義と目標値 / EM のツール(自組織の採用ツール)。golden path・guardrail・罠のナレッジは多くの組織でそのまま使えます。

## マップの読み方(4 つのエディタ)

### CJM: 現場エンジニアの旅

配布直後 → 個人試行 → 標準に乗る → 定着 → 還流 の 5 フェーズです。感情曲線が「障壁の谷」から golden path(推奨デフォルトの道)で回復する構造を表します。使わない理由がスキル不足ではなく複合障壁であることを、思考・感情の欄で示しています。

### SBP: 体験を支える 4 つの支援レーン

開発チーム(現場)/ 推進チーム(enabling team = 一時的に伴走して自走させる専門チーム)/ Champions・現場リーダー / 経営・EM の 4 レーンが、どの顧客体験をどのタスクで支えるかを接続線で示します。

### Outcome: 成果と CSF・KPI

KGI「顧客価値に届く成果をチーム横断で再現する(個人差の解消)」に対し、CSF(重要成功要因)は「Thinnest Viable Platform を整備する」= golden path を最も楽な道にすることです。強制ゲートは迂回されるため、ガードレール型の整備が採用を駆動します。

### EM: 必要な行動と知識・スキル

「必要な行動」の説明文に【固定層】/【可変層】を明記しています。画面下部のリソース一覧に、行動ごとのスキル(学習コンテンツつき)・ナレッジ(罠 1〜4 と golden path 事例)・ツールが並びます。

## 4 レイヤと 4 つの DSL の対応

このマップの元になった導入設計は 4 レイヤ(計測の軸 / 標準化の境界 / 浸透 / 罠の回避)で整理されています。レイヤと DSL は一対一対応ではなく、各レイヤの要素を DSL の責務に再配置しています。

| 導入設計のレイヤ | マップ上の表現 |
|---|---|
| レイヤ1 計測の軸 | CJM の障壁可視化(感情曲線)+ Outcome の KPI(緊張注記つき)+ 経営・EM レーンのタスク |
| レイヤ2 標準化の境界 | EM の【固定層】/【可変層】表記 + 推進チームの guardrail タスク |
| レイヤ3 浸透 | 推進チーム・Champions レーンのタスク + EM のスキル(学習コンテンツ) |
| レイヤ4 罠の回避 | EM のナレッジ「罠1〜罠4」+ 行動の説明文の注意書き + 本書「罠の回避」節 |

## 固定層と可変層のマトリクス

AI 領域はベストプラクティスの陳腐化が速いため、固定するのはツールに依存しない原則層だけに絞り、ツール・モデル・プロンプトは現場可変に残します。

| 工程 | 固定する型(組織標準・guardrail) | 可変に残す(現場のローカル試行) |
|---|---|---|
| 設計 | spec の構造(業務意図をユビキタス言語で、Given/When/Then)、人間レビューの必須化 | spec を起こすツール、詳細化の深さ |
| 実装 | 保守できないコードを受け入れない原則、バージョン管理 | モデル・IDE・プロンプト・補完設定、漸進化の粒度 |
| レビュー | 人間が責任を保持、自動チェックの CI 埋め込み | レビュー観点のローカル拡張、AI レビューア併用の有無 |
| テスト | テスト先行、placeholder と mock の検知 | テスト生成の自動化度合い、カバレッジ目標のチーム調整 |

## 罠の回避(4 つの反証と留保条件)

マップの EM ナレッジ「罠1〜罠4」の中身です。楽観的な導入計画を疑うための一次エビデンスで、それぞれ留保条件があります(YAML 側には載せていないので、引用時はこの節を参照してください)。

| 罠 | 要旨 | 留保条件 |
|---|---|---|
| 罠1 指標 gaming(GitClear 2025) | コミット数や行数で生産性を測り続けると、AI 由来の保守性劣化が広がる。コピペ行数がリファクタ行数を史上初めて逆転し、5 行以上の重複ブロックが約 8 倍に増加 | 「AI 採用と相関する」であり RCT ではない。因果は断定されていない |
| 罠2 主観と実態の乖離(METR RCT) | 経験豊富な OSS 開発者が AI 利用時に 19% 遅くなった。本人たちは体験後もなお 20% 短縮したと誤認 | n=16 の RCT。著者自身が「多くの開発者に一般化できると主張しない」と留保。未経験者・不慣れなコードベースには当てはまらない可能性 |
| 罠3 AI は増幅器(DORA) | AI はチームを直さず、既にあるものを増幅する。弱い計測・弱いプロセスを増幅すると逆効果 | 2024 年版の「スループット悪化」は 2025 年版で正に反転(安定性懸念は残存)。年次スナップショットで変わる |
| 罠4 標準と実態の乖離(Stack Overflow / KPMG) | 開発者の不信 46% が信頼 33% を上回る。44% が無許可または不適切な方法で AI を使用 | サーベイ(自己申告)であり行動観測ではない |

## KPI 設計の注意(単一 KPI の制約)

このツールの Outcome は主要 KPI を 1 本だけ持つ構造です。そのため KPI「プロセス別 AI 組み込み度」の定義文に「単独で評価しない」と明記しています。実運用では次の指標セットと必ず緊張させて併読してください。

- DORA 安定性(Change Failure Rate = 変更失敗率)
- 知覚指標(開発者の満足度。SPACE フレームワークは「最低 3 次元、うち 1 つは知覚指標」を推奨)
- rework 率(受け入れ後の手戻り)・レビュー時間

## 国内各社の公式数値

現場提案の根拠として使える、各社が公式に公開した定量です(公式テックブログの一次情報のみ。流布している二次情報の数値は採用していません)。

| 企業 | 型 | 公式公開された定量 |
|---|---|---|
| ラクス | プロセス別 AI コミット度、SDD 型化(進行中) | 全社 AI 生成比率 43.3%→58.3%(サーベイ第 1 回→第 2 回)。上流工程チーム 20%台→50〜60%超。モバイル PR/day iOS 0.346→3.059 |
| メルカリ | Agent-Spec Driven Development、Notion 中央ナレッジ、AI Task Force 約 100 名 | 社員 AI 活用率 95%。AI 担当コード生成率 約 70%。開発スピード 前年比 64% |
| DeNA | 特化型サブエージェント、レビュー指摘のドキュメント自動反映、仕様駆動分析 | 人間レビュー回数/PR 7.2→2.7。コメント数/PR 6.0→1.9。SDA でデバッグ時間 7 割→2〜3 割 |
| ZOZO | 2 コマンド標準化、進捗管理表フォーマット | 数百名規模で利用(効果測定は今後の課題と明記) |

## 出典一覧

- 起点・国内事例
  - [AI駆動開発の組織標準化に向き合う(RAKUS Developers Blog)](https://tech-blog.rakus.co.jp/entry/20260615/ai-adoption-standardization)
  - [メルカリ AI-Native Company](https://engineering.mercari.com/blog/entry/20251225-mercari-ai-native-company/)
  - [DeNA 育てるほど楽になる AI 開発体制](https://engineering.dena.com/blog/2026/01/ai-driven-develop/)
  - [DeNA 仕様駆動分析(SDA)](https://engineering.dena.com/blog/2026/04/spec-driven-analytics/)
  - [ZOZO AI駆動開発を 2 コマンドで組織標準に](https://techblog.zozo.com/entry/ai-development-two-commands)
- 計測フレームワーク
  - [The SPACE of Developer Productivity(ACM Queue)](https://queue.acm.org/detail.cfm?id=3454124)
  - [DORA 2024 Report](https://dora.dev/research/2024/dora-report/)
  - [Announcing the 2025 DORA Report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)
- 標準化境界・浸透
  - [Spotify Golden Paths](https://engineering.atspotify.com/2020/08/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem)
  - [Scaling Appsec at Netflix(paved road)](https://netflixtechblog.medium.com/scaling-appsec-at-netflix-6a13d7ab6043)
  - [Guardrails, Not Gatekeepers](https://platformsecurity.com/blog/guardrails-not-gatekeepers-platform-security-scales-with-engineering)
  - [Team Topologies Key Concepts](https://teamtopologies.com/key-concepts)
  - [Spec-driven development(Thoughtworks)](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices)
  - [Ten Simple Rules for AI-Assisted Coding(arXiv)](https://arxiv.org/abs/2510.22254)
  - [Driving Copilot adoption in your company(GitHub Docs)](https://docs.github.com/en/copilot/tutorials/rolling-out-github-copilot-at-scale/enabling-developers/driving-copilot-adoption-in-your-company)
- 反証
  - [GitClear AI Copilot Code Quality 2025(PDF)](https://gitclear-public.s3.us-west-2.amazonaws.com/GitClear-AI-Copilot-Code-Quality-2025.pdf)
  - [METR: Measuring the Impact of Early-2025 AI on Experienced Developers](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
  - [Stack Overflow Developer Survey 2025(AI)](https://survey.stackoverflow.co/2025/ai/)
  - [KPMG Trust, attitudes and use of AI 2025](https://kpmg.com/us/en/media/news/trust-in-ai-2025.html)
