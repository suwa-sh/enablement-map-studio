import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test, expect } from 'vitest';
import { load } from 'js-yaml';
import { parseYaml } from './yaml-parser';
import { checkReferenceIntegrity } from './reference-check';
import type { ParsedYaml } from '../types';

// docs/samples/ 配下のサンプル YAML が、スキーマ変更や参照切れで腐っていないことを検証する。
// サンプルは Open File でそのまま studio に読み込める「完全な 4 DSL」であることを保証する。
const samplesDir = join(dirname(fileURLToPath(import.meta.url)), '../../../../docs/samples');

const sampleFiles = readdirSync(samplesDir).filter((f) => f.endsWith('.yaml'));

describe('samples-validation', () => {
  test('samplesDir_docs/samplesに1つ以上のyamlがあること', () => {
    expect(sampleFiles.length).toBeGreaterThan(0);
  });

  describe.each(sampleFiles)('%s', (file) => {
    // Given: docs/samples/ のサンプル YAML(パースはテスト実行時まで遅延させ、
    // 失敗を per-sample のテスト失敗として報告する)
    const content = readFileSync(join(samplesDir, file), 'utf-8');
    let cache: ParsedYaml | undefined;
    const getParsed = (): ParsedYaml => {
      // When: アプリと同じパイプラインでパースする(スキーマ検証込み。失敗時は throw)
      cache ??= parseYaml(content);
      return cache;
    };

    test('parseYaml_サンプルを読み込んだ場合_4つのDSLがすべて存在すること', () => {
      // Then: parseYaml は欠落 DSL を null で返すため、4 DSL の存在を明示的に検証する
      const parsed = getParsed();
      expect(parsed.cjm).not.toBeNull();
      expect(parsed.sbp).not.toBeNull();
      expect(parsed.outcome).not.toBeNull();
      expect(parsed.em).not.toBeNull();
    });

    test('ドキュメント構成_サンプルを検査した場合_同一kindのドキュメントが重複しないこと', () => {
      // parseYaml は同一 kind を後勝ちで上書きするため、素の YAML から kind の出現回数を数える
      const kinds = content
        .split(/^---$/m)
        .map((doc) => (load(doc) as { kind?: string } | null)?.kind)
        .filter((kind): kind is string => Boolean(kind));
      const counts = new Map<string, number>();
      for (const kind of kinds) {
        counts.set(kind, (counts.get(kind) ?? 0) + 1);
      }
      const duplicated = [...counts.entries()].filter(([, count]) => count > 1);
      expect(duplicated).toEqual([]);
    });

    test('checkReferenceIntegrity_サンプルを検査した場合_クロス参照エラーがないこと', () => {
      const result = checkReferenceIntegrity(getParsed());
      expect(result.errors).toEqual([]);
      expect(result.valid).toBe(true);
    });

    test('内部参照_サンプルを検査した場合_スキーマ外の参照6種が全て解決できること', () => {
      const errors: string[] = [];
      const { cjm, sbp, outcome, em } = getParsed();

      // CJM action.phase → phase.id
      if (cjm) {
        const phaseIds = new Set(cjm.phases.map((p) => p.id));
        for (const action of cjm.actions) {
          if (!phaseIds.has(action.phase)) {
            errors.push(`cjm action ${action.id}: unknown phase ${action.phase}`);
          }
        }
      }
      // SBP task.lane → lane.id / connection.source・target → task.id
      if (sbp) {
        const laneIds = new Set(sbp.lanes.map((l) => l.id));
        const taskIds = new Set(sbp.tasks.map((t) => t.id));
        for (const task of sbp.tasks) {
          if (!laneIds.has(task.lane)) {
            errors.push(`sbp task ${task.id}: unknown lane ${task.lane}`);
          }
        }
        for (const conn of sbp.connections ?? []) {
          if (!taskIds.has(conn.source)) {
            errors.push(`sbp connection: unknown source ${conn.source}`);
          }
          if (!taskIds.has(conn.target)) {
            errors.push(`sbp connection: unknown target ${conn.target}`);
          }
        }
      }
      // SBP readonly タスク → CJM action.id(readonly ノードは対応する CJM action が
      // ある場合のみエディタに描画されるため、対応が無いと接続線が宙に浮く)
      if (sbp && cjm) {
        const cjmActionIds = new Set(cjm.actions.map((a) => a.id));
        for (const task of sbp.tasks.filter((t) => t.readonly)) {
          if (!cjmActionIds.has(task.id)) {
            errors.push(`sbp readonly task ${task.id}: no matching cjm action`);
          }
        }
      }
      // Outcome csf.kgi_id → kgi.id / kpi.csf_id → csf.id
      if (outcome) {
        if (outcome.primary_csf.kgi_id !== outcome.kgi.id) {
          errors.push(`outcome csf.kgi_id ${outcome.primary_csf.kgi_id} != kgi.id ${outcome.kgi.id}`);
        }
        if (outcome.primary_kpi.csf_id !== outcome.primary_csf.id) {
          errors.push(`outcome kpi.csf_id ${outcome.primary_kpi.csf_id} != csf.id ${outcome.primary_csf.id}`);
        }
      }
      // EM skill/knowledge/tool.action_id → action.id
      if (em) {
        const actionIds = new Set(em.actions.map((a) => a.id));
        for (const resource of [...(em.skills ?? []), ...(em.knowledge ?? []), ...(em.tools ?? [])]) {
          if (!actionIds.has(resource.action_id)) {
            errors.push(`em resource ${resource.id}: unknown action_id ${resource.action_id}`);
          }
        }
      }

      expect(errors).toEqual([]);
    });

    test('ID一意性_サンプルを検査した場合_全DSL横断でIDが重複しないこと', () => {
      // SBP の readonly タスクは CJM action のミラー表示のため同一 ID が仕様。除外する
      const { cjm, sbp, outcome, em } = getParsed();
      const ids: string[] = [
        ...(cjm ? cjm.phases.map((p) => p.id) : []),
        ...(cjm ? cjm.actions.map((a) => a.id) : []),
        ...(sbp ? sbp.lanes.map((l) => l.id) : []),
        ...(sbp ? sbp.tasks.filter((t) => !t.readonly).map((t) => t.id) : []),
        ...(outcome ? [outcome.kgi.id, outcome.primary_csf.id, outcome.primary_kpi.id] : []),
        ...(em ? em.outcomes.map((o) => o.id) : []),
        ...(em ? em.actions.map((a) => a.id) : []),
        ...(em?.skills ?? []).map((s) => s.id),
        ...(em?.knowledge ?? []).map((k) => k.id),
        ...(em?.tools ?? []).map((t) => t.id),
      ];
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(duplicates).toEqual([]);
    });
  });
});
