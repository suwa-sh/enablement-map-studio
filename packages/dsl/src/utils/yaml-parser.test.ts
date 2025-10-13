import { describe, test, expect } from 'vitest';
import { parseYaml, exportYaml } from './yaml-parser';
import type { ParsedYaml, CjmDsl, SbpDsl, OutcomeDsl, EmDsl } from '../types';

describe('yaml-parser', () => {
  describe('parseYaml', () => {
    test('parseYaml_有効なCJM YAMLの場合_DSLオブジェクトが返却されること', () => {
      // Given: 有効なCJM YAML
      const yaml = `
kind: cjm
version: "1.0"
id: cjm:test-id
persona:
  name: Test User
  description: Test Description
phases:
  - id: cjm:phase:test-phase-id
    name: Test Phase
actions:
  - id: cjm:action:test-action-id
    phase: cjm:phase:test-phase-id
    name: Test Action
    touchpoints:
      - Web
    thoughts_feelings:
      - Happy
    emotion_score: 1
`;

      // When: YAMLをパース
      const result = parseYaml(yaml);

      // Then: CJM DSLが正しくパースされること
      expect(result.cjm).toBeDefined();
      expect(result.cjm?.kind).toBe('cjm');
      expect(result.cjm?.persona.name).toBe('Test User');
      expect(result.cjm?.phases).toHaveLength(1);
      expect(result.cjm?.actions).toHaveLength(1);
      expect(result.sbp).toBeNull();
      expect(result.outcome).toBeNull();
      expect(result.em).toBeNull();
    });

    test('parseYaml_複数ドキュメントを含む場合_全てのDSLが解析されること', () => {
      // Given: 複数のDSLを含むYAML
      const yaml = `
kind: cjm
version: "1.0"
id: cjm:test-id
persona:
  name: Test User
  description: Test Description
phases: []
actions: []
---
kind: sbp
version: "1.0"
id: sbp:test-id
lanes:
  - id: sbp:lane:test-lane-id
    name: Test Lane
    kind: human
tasks: []
connections: []
`;

      // When: YAMLをパース
      const result = parseYaml(yaml);

      // Then: 全てのDSLが正しくパースされること
      expect(result.cjm).toBeDefined();
      expect(result.cjm?.kind).toBe('cjm');
      expect(result.sbp).toBeDefined();
      expect(result.sbp?.kind).toBe('sbp');
      expect(result.outcome).toBeNull();
      expect(result.em).toBeNull();
    });

    test('parseYaml_バリデーションエラーの場合_エラーがスローされること', () => {
      // Given: 必須フィールドが欠けているYAML
      const invalidYaml = `
kind: cjm
persona:
  name: Test User
`;

      // When & Then: エラーがスローされること
      expect(() => parseYaml(invalidYaml)).toThrow(/Validation failed for cjm DSL/);
    });

    test('parseYaml_不正なYAML形式の場合_エラーがスローされること', () => {
      // Given: 不正なYAML形式
      const invalidYaml = `
kind: cjm
  invalid indentation
`;

      // When & Then: エラーがスローされること
      expect(() => parseYaml(invalidYaml)).toThrow(/YAML parse error/);
    });

    test('parseYaml_空のYAMLの場合_全てnullのオブジェクトが返却されること', () => {
      // Given: 空のYAML
      const emptyYaml = '';

      // When: YAMLをパース
      const result = parseYaml(emptyYaml);

      // Then: 全てnullであること
      expect(result.cjm).toBeNull();
      expect(result.sbp).toBeNull();
      expect(result.outcome).toBeNull();
      expect(result.em).toBeNull();
    });
  });

  describe('exportYaml', () => {
    test('exportYaml_CJM DSLオブジェクトの場合_YAML文字列が生成されること', () => {
      // Given: CJM DSLオブジェクト
      const cjm: CjmDsl = {
        kind: 'cjm',
        version: '1.0',
        id: 'cjm:test-id',
        persona: {
          name: 'Test User',
          description: 'Test Description',
        },
        phases: [
          {
            id: 'cjm:phase:test-phase-id',
            name: 'Test Phase',
          },
        ],
        actions: [],
      };
      const data: ParsedYaml = {
        cjm,
        sbp: null,
        outcome: null,
        em: null,
      };

      // When: YAMLをエクスポート
      const result = exportYaml(data);

      // Then: YAML文字列が生成されること
      expect(result).toContain('kind: cjm');
      expect(result).toContain('name: Test User');
      expect(result).toContain('Test Phase');
    });

    test('exportYaml_複数のDSLオブジェクトの場合_区切り文字で連結されること', () => {
      // Given: 複数のDSLオブジェクト
      const cjm: CjmDsl = {
        kind: 'cjm',
        version: '1.0',
        id: 'cjm:test-id',
        persona: {
          name: 'Test User',
          description: 'Test Description',
        },
        phases: [],
        actions: [],
      };
      const sbp: SbpDsl = {
        kind: 'sbp',
        version: '1.0',
        id: 'sbp:test-id',
        lanes: [
          {
            id: 'sbp:lane:test-lane-id',
            name: 'Test Lane',
            kind: 'human',
          },
        ],
        tasks: [],
        connections: [],
      };
      const data: ParsedYaml = {
        cjm,
        sbp,
        outcome: null,
        em: null,
      };

      // When: YAMLをエクスポート
      const result = exportYaml(data);

      // Then: ---で区切られていること
      expect(result).toContain('kind: cjm');
      expect(result).toContain('---');
      expect(result).toContain('kind: sbp');
    });

    test('exportYaml_空のデータの場合_空文字列が返却されること', () => {
      // Given: 空のデータ
      const data: ParsedYaml = {
        cjm: null,
        sbp: null,
        outcome: null,
        em: null,
      };

      // When: YAMLをエクスポート
      const result = exportYaml(data);

      // Then: 空文字列が返却されること
      expect(result).toBe('');
    });

    test('exportYaml_エクスポートした内容を再度パース可能であること', () => {
      // Given: DSLオブジェクト
      const cjm: CjmDsl = {
        kind: 'cjm',
        version: '1.0',
        id: 'cjm:test-id',
        persona: {
          name: 'Test User',
          description: 'Test Description',
        },
        phases: [],
        actions: [],
      };
      const originalData: ParsedYaml = {
        cjm,
        sbp: null,
        outcome: null,
        em: null,
      };

      // When: エクスポートして再度パース
      const yaml = exportYaml(originalData);
      const reparsedData = parseYaml(yaml);

      // Then: 元のデータと一致すること
      expect(reparsedData.cjm).toEqual(originalData.cjm);
    });
  });
});
