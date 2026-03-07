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

## 他スキルからの参照方法

```markdown
DSL仕様は `../emstudio-core/references/dsl-spec.md` を参照してください。
```
