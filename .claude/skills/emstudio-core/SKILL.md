---
name: emstudio-core
description: "Enablement Map Studioの共有リソースを提供する内部スキルです。他のemstudio系スキルから参照されます。直接トリガーされることは想定していません。"
user-invokable: false
---

# Enablement Map Studio 共有リソース

Enablement Map Studioは、YAML DSLで定義されたCJM/SBP/Outcome/EMの4つのエディタを提供するWebアプリケーションです。

## 提供リソース

| リソース | パス | 内容 |
|---------|------|------|
| DSL仕様リファレンス | `references/dsl-spec.md` | 4種類のDSLの型定義、ID形式、参照関係、YAMLサンプル |
| 公開サンプルのSBPレイアウト規約 | `references/sample-layout.md` | CJMとの対応、主経路、間隔、画面確認の基準 |

## 他スキルからの参照方法

```markdown
DSL仕様は `../emstudio-core/references/dsl-spec.md` を参照してください。
```

公開サンプルを作成または検証する場合は、`../emstudio-core/references/sample-layout.md`も参照してください。
