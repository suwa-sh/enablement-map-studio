# Enablement Map Studio DSL仕様リファレンス

## 概要

Enablement Map Studioは、`---`区切りで4種類のDSLを含む単一YAMLファイルを扱います。
各DSLは`kind`フィールドで識別されます。

## ID形式

全てのDSL要素のIDは `{kind}:{type}:{uuid}` 形式です。
例: `cjm:action:123e4567-e89b-12d3-a456-426614174000`

## DSL間の参照関係

```
CJM Action ──source_id──> SBP Task ──source_id──> Outcome CSF
                            │
                            ├──source_id──> EM Action
                            │
Outcome KPI ──source_id──> EM Outcome
```

## 1. CJM (Customer Journey Map) DSL

```yaml
kind: cjm
version: '1.0'
id: cjm:{識別子}
persona:
  name: ペルソナ名
  description: ペルソナの説明（任意）
phases:
  - id: cjm:phase:{uuid}
    name: フェーズ名
actions:
  - id: cjm:action:{uuid}
    name: アクション名
    phase: cjm:phase:{uuid}       # phaseのIDを参照
    touchpoints:                   # 任意、文字列配列
      - タッチポイント1
    thoughts_feelings:             # 任意、文字列配列
      - 思考・感情1
    emotion_score: 0               # -2 ~ 2 の整数
```

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| persona.name | string | Yes | ペルソナ名 |
| persona.description | string | No | ペルソナの説明 |
| phases[].id | string | Yes | `cjm:phase:{uuid}` 形式 |
| phases[].name | string | Yes | フェーズ名 |
| actions[].id | string | Yes | `cjm:action:{uuid}` 形式 |
| actions[].name | string | Yes | アクション名 |
| actions[].phase | string | Yes | 所属するphaseのID |
| actions[].touchpoints | string[] | No | タッチポイント一覧 |
| actions[].thoughts_feelings | string[] | No | 思考・感情一覧 |
| actions[].emotion_score | number | Yes | 感情スコア (-2 ~ 2) |

## 2. SBP (Service Blueprint) DSL

```yaml
kind: sbp
version: '1.0'
id: sbp:{識別子}
lanes:
  - id: sbp:lane:{uuid}
    name: レーン名
    kind: human                    # cjm | human | team | system
    description: レーンの説明（任意）
    position:                      # 任意、エディタ上の位置
      x: 0
      y: 0
    size:                          # 任意、エディタ上のサイズ
      width: 1000
      height: 200
tasks:
  # 通常タスク（human/team/systemレーンに配置）
  - id: sbp:task:{uuid}
    lane: sbp:lane:{uuid}         # laneのIDを参照
    name: タスク名
    description: タスクの説明（任意）
    source_id: cjm:action:{uuid}  # 任意、CJMアクションへの参照（紐づけ）
    position:                      # 任意、エディタ上の位置
      x: 0
      y: 0
  # CJMレーン用readonlyタスク（CJMアクションをSBP画面に表示するため）
  - id: cjm:action:{uuid}         # CJMアクションのIDをそのまま使用
    lane: sbp:lane:{cjmレーンのuuid}
    name: アクション名             # CJMアクションと同じ名前
    readonly: true                 # 必須、readonlyにする
    position:
      x: 0
      y: 50
connections:
  - source: sbp:task:{uuid}       # 接続元タスクID（cjm:action:{uuid}も指定可）
    target: sbp:task:{uuid}       # 接続先タスクID（cjm:action:{uuid}も指定可）
    sourceHandle: right            # top | right | bottom | left
    targetHandle: left             # top | right | bottom | left
```

### CJMレーンとSBPタスクの連携パターン

SBP画面上でCJMアクションを表示し、かつSBPタスクと紐づけるには、以下の2つを組み合わせる:

1. **CJMレーンのreadonlyタスク**: CJMアクションのIDをそのままタスクIDに使い、`readonly: true` を設定。SBP画面上にCJMアクションを表示する役割。
2. **通常タスクの`source_id`**: human/team/systemレーンのタスクに `source_id: cjm:action:{uuid}` を設定。CJMアクションとの紐づけの役割。

```yaml
# 例: CJMアクション「要求を伝える」をSBP画面に表示し、開発チームのタスクと紐づける
tasks:
  # CJMレーンにreadonly表示（IDはCJMアクションのIDをそのまま使用）
  - id: cjm:action:communicate-requirements
    lane: sbp:lane:cjm
    name: 要求を伝える
    readonly: true
    position:
      x: 50
      y: 50
  # 開発チームのタスク（source_idでCJMアクションに紐づけ）
  - id: sbp:task:gather-requirements
    lane: sbp:lane:dev-team
    name: 機能定義を整理
    source_id: cjm:action:communicate-requirements
    position:
      x: 50
      y: 60
connections:
  # CJMアクション → 開発チームタスクの接続
  - source: cjm:action:communicate-requirements
    target: sbp:task:gather-requirements
    sourceHandle: bottom
    targetHandle: top
```

**注意**: CJMレーンのreadonlyタスクに `source_id` は不要。IDがCJMアクションと一致していることで自動的に紐づく。

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| lanes[].kind | string | Yes | `cjm`, `human`, `team`, `system` のいずれか |
| lanes[].description | string | No | レーンの説明 |
| lanes[].position | {x,y} | No | エディタ上の位置（10pxグリッドスナップ） |
| lanes[].size | {width,height} | No | エディタ上のサイズ（10pxグリッドスナップ） |
| tasks[].lane | string | Yes | 所属するlaneのID |
| tasks[].description | string | No | タスクの説明 |
| tasks[].source_id | string | No | CJMアクションへの参照ID（通常タスク用） |
| tasks[].readonly | boolean | No | CJMレーンのreadonlyタスクで `true` を設定 |
| tasks[].position | {x,y} | No | エディタ上の位置 |
| connections[].sourceHandle | string | Yes | `top`, `right`, `bottom`, `left` |
| connections[].targetHandle | string | Yes | `top`, `right`, `bottom`, `left` |

## 3. Outcome DSL

```yaml
kind: outcome
version: '1.0'
id: oc:{識別子}
kgi:
  id: oc:kgi
  name: KGI名（重要目標達成指標）
primary_csf:
  id: oc:csf
  kgi_id: oc:kgi                  # KGIのIDを参照
  source_id: sbp:task:{uuid}     # SBPタスクへの参照（CSFとなるタスク）
  rationale: CSFである理由
primary_kpi:
  id: oc:kpi
  csf_id: oc:csf                  # CSFのIDを参照
  name: KPI名
  definition: KPIの定義（任意）
  unit: '%'                       # 単位（任意）
  target: 90                      # 目標値
```

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| kgi.name | string | Yes | 重要目標達成指標の名前 |
| primary_csf.kgi_id | string | Yes | KGIのID |
| primary_csf.source_id | string | Yes | CSFとなるSBPタスクのID |
| primary_csf.rationale | string | Yes | CSFとした理由 |
| primary_kpi.name | string | Yes | KPI名 |
| primary_kpi.definition | string | No | KPIの計算定義 |
| primary_kpi.unit | string | No | 単位（%, 件, 円 等） |
| primary_kpi.target | number | Yes | 目標値 |

## 4. EM (Enablement Map) DSL

```yaml
kind: em
version: '1.0'
id: em:{識別子}
outcomes:
  - id: em:outcome:{uuid}
    source_id: oc:kpi              # Outcome KPIへの参照
actions:
  - id: em:act:{uuid}
    name: アクション名
    description: アクションの説明（任意）
    source_id: sbp:task:{uuid}     # SBPタスクへの参照
skills:
  - id: em:skill:{uuid}
    name: スキル名
    action_id: em:act:{uuid}       # EMアクションへの参照
    learnings:                      # 任意、学習コンテンツ配列
      - title: コンテンツタイトル
        url: https://example.com
knowledge:
  - id: em:knowledge:{uuid}
    name: ナレッジ名
    action_id: em:act:{uuid}
    url: https://example.com
tools:
  - id: em:tool:{uuid}
    name: ツール名
    action_id: em:act:{uuid}
    url: https://example.com
```

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| outcomes[].source_id | string | Yes | Outcome KPIのID |
| actions[].name | string | Yes | 行動名 |
| actions[].description | string | No | 行動の説明 |
| actions[].source_id | string | Yes | SBPタスクのID |
| skills[].action_id | string | Yes | EMアクションのID |
| skills[].learnings | array | No | 学習コンテンツ（title + url） |
| knowledge[].action_id | string | Yes | EMアクションのID |
| knowledge[].url | string | Yes | ナレッジのURL |
| tools[].action_id | string | Yes | EMアクションのID |
| tools[].url | string | Yes | ツールのURL |

## YAMLファイル構造

4つのDSLを `---` で区切って1ファイルにまとめます。順序は CJM → SBP → Outcome → EM です。

```yaml
kind: cjm
version: '1.0'
# ... CJM定義
---
kind: sbp
version: '1.0'
# ... SBP定義
---
kind: outcome
version: '1.0'
# ... Outcome定義
---
kind: em
version: '1.0'
# ... EM定義
```

## 参照整合性ルール

以下の参照が正しく設定されている必要があります:

1. **CJM Action → Phase**: `action.phase` が存在する `phase.id` を指すこと
2. **SBP Task → Lane**: `task.lane` が存在する `lane.id` を指すこと
3. **SBP Task → CJM Action**: `task.source_id`（任意）が存在する CJM `action.id` を指すこと
4. **SBP Connection → Task**: `connection.source/target` が存在する `task.id` を指すこと
5. **Outcome CSF → SBP Task**: `csf.source_id` が存在する SBP `task.id` を指すこと
6. **EM Outcome → Outcome KPI**: `outcome.source_id` が存在する `kpi.id` を指すこと
7. **EM Action → SBP Task**: `action.source_id` が存在する SBP `task.id` を指すこと
8. **EM Skill/Knowledge/Tool → EM Action**: `*.action_id` が存在する EM `action.id` を指すこと
