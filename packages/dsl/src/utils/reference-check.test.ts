import { describe, test, expect } from 'vitest';
import { checkReferenceIntegrity } from './reference-check';
import type { ParsedYaml, CjmDsl, SbpDsl, OutcomeDsl, EmDsl } from '../types';

describe('reference-check', () => {
  describe('checkReferenceIntegrity', () => {
    test('checkReferenceIntegrity_全ての参照が有効な場合_validがtrueであること', () => {
      // Given: 全ての参照が有効なDSLデータ
      const cjm: CjmDsl = {
        kind: 'cjm',
        version: '1.0',
        id: 'cjm:1',
        persona: {
          name: 'Test User',
          description: 'Test Description',
        },
        phases: [
          {
            id: 'cjm:phase:phase-1',
            name: 'Phase 1',
          },
        ],
        actions: [
          {
            id: 'cjm:action:action-1',
            phase: 'cjm:phase:phase-1',
            name: 'Action 1',
            touchpoints: ['Web'],
            thoughts_feelings: ['Happy'],
            emotion_score: 1,
          },
        ],
      };

      const sbp: SbpDsl = {
        kind: 'sbp',
        version: '1.0',
        id: 'sbp:1',
        lanes: [
          {
            id: 'sbp:lane:lane-1',
            name: 'Lane 1',
            kind: 'customer',
          },
        ],
        tasks: [
          {
            id: 'sbp:task:task-1',
            lane: 'sbp:lane:lane-1',
            name: 'Task 1',
            source_id: 'cjm:action:action-1', // 有効な参照
          },
        ],
        connections: [],
      };

      const outcome: OutcomeDsl = {
        kind: 'outcome',
        version: '1.0',
        id: 'outcome:1',
        kgi: {
          id: 'outcome:kgi:kgi-1',
          name: 'Test KGI',
        },
        primary_csf: {
          id: 'outcome:csf:csf-1',
          kgi_id: 'outcome:kgi:kgi-1',
          source_id: 'sbp:task:task-1', // 有効な参照
          rationale: 'CSF Rationale',
        },
        primary_kpi: {
          id: 'outcome:kpi:kpi-1',
          csf_id: 'outcome:csf:csf-1',
          name: 'KPI 1',
          target: '100',
        },
      };

      const em: EmDsl = {
        kind: 'em',
        version: '1.0',
        id: 'em:1',
        outcomes: [
          {
            id: 'em:outcome:outcome-1',
            source_id: 'outcome:kpi:kpi-1', // 有効な参照
          },
        ],
        actions: [
          {
            id: 'em:action:action-1',
            name: 'EM Action 1',
            source_id: 'sbp:task:task-1', // 有効な参照
          },
        ],
        skills: [],
        knowledge: [],
        tools: [],
      };

      const data: ParsedYaml = { cjm, sbp, outcome, em };

      // When: 参照整合性チェックを実行
      const result = checkReferenceIntegrity(data);

      // Then: validがtrueでエラーが0件であること
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('checkReferenceIntegrity_SBPからCJMへの参照が無効な場合_エラーが返却されること', () => {
      // Given: SBPからCJMへの無効な参照
      const cjm: CjmDsl = {
        kind: 'cjm',
        version: '1.0',
        id: 'cjm:1',
        persona: {
          name: 'Test User',
          description: 'Test Description',
        },
        phases: [],
        actions: [
          {
            id: 'cjm:action:action-1',
            phase: 'cjm:phase:phase-1',
            name: 'Action 1',
            touchpoints: ['Web'],
            thoughts_feelings: ['Happy'],
            emotion_score: 1,
          },
        ],
      };

      const sbp: SbpDsl = {
        kind: 'sbp',
        version: '1.0',
        id: 'sbp:1',
        lanes: [],
        tasks: [
          {
            id: 'sbp:task:task-1',
            lane: 'sbp:lane:lane-1',
            name: 'Task 1',
            source_id: 'cjm:action:non-existent', // 無効な参照
          },
        ],
        connections: [],
      };

      const data: ParsedYaml = { cjm, sbp, outcome: null, em: null };

      // When: 参照整合性チェックを実行
      const result = checkReferenceIntegrity(data);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing_reference');
      expect(result.errors[0].source).toBe('sbp:task');
      expect(result.errors[0].targetKind).toBe('cjm:action');
    });

    test('checkReferenceIntegrity_OutcomeからSBPへの参照が無効な場合_エラーが返却されること', () => {
      // Given: OutcomeからSBPへの無効な参照
      const sbp: SbpDsl = {
        kind: 'sbp',
        version: '1.0',
        id: 'sbp:1',
        lanes: [],
        tasks: [
          {
            id: 'sbp:task:task-1',
            lane: 'sbp:lane:lane-1',
            name: 'Task 1',
          },
        ],
        connections: [],
      };

      const outcome: OutcomeDsl = {
        kind: 'outcome',
        version: '1.0',
        id: 'outcome:1',
        kgi: {
          id: 'outcome:kgi:kgi-1',
          name: 'Test KGI',
        },
        primary_csf: {
          id: 'outcome:csf:csf-1',
          kgi_id: 'outcome:kgi:kgi-1',
          source_id: 'sbp:task:non-existent', // 無効な参照
          rationale: 'CSF Rationale',
        },
        primary_kpi: {
          id: 'outcome:kpi:kpi-1',
          csf_id: 'outcome:csf:csf-1',
          name: 'KPI 1',
          target: '100',
        },
      };

      const data: ParsedYaml = { cjm: null, sbp, outcome, em: null };

      // When: 参照整合性チェックを実行
      const result = checkReferenceIntegrity(data);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing_reference');
      expect(result.errors[0].source).toBe('outcome:csf');
      expect(result.errors[0].targetKind).toBe('sbp:task');
    });

    test('checkReferenceIntegrity_EMからSBPへの参照が無効な場合_エラーが返却されること', () => {
      // Given: EMからSBPへの無効な参照
      const sbp: SbpDsl = {
        kind: 'sbp',
        version: '1.0',
        id: 'sbp:1',
        lanes: [],
        tasks: [
          {
            id: 'sbp:task:task-1',
            lane: 'sbp:lane:lane-1',
            name: 'Task 1',
          },
        ],
        connections: [],
      };

      const em: EmDsl = {
        kind: 'em',
        version: '1.0',
        id: 'em:1',
        outcomes: [],
        actions: [
          {
            id: 'em:action:action-1',
            name: 'EM Action 1',
            source_id: 'sbp:task:non-existent', // 無効な参照
          },
        ],
        skills: [],
        knowledge: [],
        tools: [],
      };

      const data: ParsedYaml = { cjm: null, sbp, outcome: null, em };

      // When: 参照整合性チェックを実行
      const result = checkReferenceIntegrity(data);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing_reference');
      expect(result.errors[0].source).toBe('em:action');
      expect(result.errors[0].targetKind).toBe('sbp:task');
    });

    test('checkReferenceIntegrity_EMからOutcomeへの参照が無効な場合_エラーが返却されること', () => {
      // Given: EMからOutcomeへの無効な参照
      const outcome: OutcomeDsl = {
        kind: 'outcome',
        version: '1.0',
        id: 'outcome:1',
        kgi: {
          id: 'outcome:kgi:kgi-1',
          name: 'Test KGI',
        },
        primary_csf: {
          id: 'outcome:csf:csf-1',
          kgi_id: 'outcome:kgi:kgi-1',
          source_id: 'sbp:task:task-1',
          rationale: 'CSF Rationale',
        },
        primary_kpi: {
          id: 'outcome:kpi:kpi-1',
          csf_id: 'outcome:csf:csf-1',
          name: 'KPI 1',
          target: '100',
        },
      };

      const em: EmDsl = {
        kind: 'em',
        version: '1.0',
        id: 'em:1',
        outcomes: [
          {
            id: 'em:outcome:outcome-1',
            source_id: 'outcome:kpi:non-existent', // 無効な参照
          },
        ],
        actions: [],
        skills: [],
        knowledge: [],
        tools: [],
      };

      const data: ParsedYaml = { cjm: null, sbp: null, outcome, em };

      // When: 参照整合性チェックを実行
      const result = checkReferenceIntegrity(data);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing_reference');
      expect(result.errors[0].source).toBe('em:outcome');
      expect(result.errors[0].targetKind).toBe('outcome:kpi');
    });

    test('checkReferenceIntegrity_複数の無効な参照がある場合_全てのエラーが返却されること', () => {
      // Given: 複数の無効な参照
      const cjm: CjmDsl = {
        kind: 'cjm',
        version: '1.0',
        id: 'cjm:1',
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
        id: 'sbp:1',
        lanes: [],
        tasks: [
          {
            id: 'sbp:task:task-1',
            lane: 'sbp:lane:lane-1',
            name: 'Task 1',
            source_id: 'cjm:action:non-existent-1', // 無効な参照1
          },
          {
            id: 'sbp:task:task-2',
            lane: 'sbp:lane:lane-1',
            name: 'Task 2',
            source_id: 'cjm:action:non-existent-2', // 無効な参照2
          },
        ],
        connections: [],
      };

      const data: ParsedYaml = { cjm, sbp, outcome: null, em: null };

      // When: 参照整合性チェックを実行
      const result = checkReferenceIntegrity(data);

      // Then: validがfalseで複数のエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    test('checkReferenceIntegrity_参照元のDSLが存在しない場合_チェックがスキップされること', () => {
      // Given: SBPが存在しないデータ（Outcomeのチェックがスキップされる）
      const outcome: OutcomeDsl = {
        kind: 'outcome',
        version: '1.0',
        id: 'outcome:1',
        kgi: {
          id: 'outcome:kgi:kgi-1',
          name: 'Test KGI',
        },
        primary_csf: {
          id: 'outcome:csf:csf-1',
          kgi_id: 'outcome:kgi:kgi-1',
          source_id: 'sbp:task:non-existent', // SBPが存在しないのでチェックされない
          rationale: 'CSF Rationale',
        },
        primary_kpi: {
          id: 'outcome:kpi:kpi-1',
          csf_id: 'outcome:csf:csf-1',
          name: 'KPI 1',
          target: '100',
        },
      };

      const data: ParsedYaml = { cjm: null, sbp: null, outcome, em: null };

      // When: 参照整合性チェックを実行
      const result = checkReferenceIntegrity(data);

      // Then: validがtrueでエラーが0件であること（チェックがスキップされる）
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('checkReferenceIntegrity_source_idがundefinedの場合_エラーが返却されないこと', () => {
      // Given: source_idがundefinedのタスク
      const cjm: CjmDsl = {
        kind: 'cjm',
        version: '1.0',
        id: 'cjm:1',
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
        id: 'sbp:1',
        lanes: [],
        tasks: [
          {
            id: 'sbp:task:task-1',
            lane: 'sbp:lane:lane-1',
            name: 'Task 1',
            // source_id is undefined
          },
        ],
        connections: [],
      };

      const data: ParsedYaml = { cjm, sbp, outcome: null, em: null };

      // When: 参照整合性チェックを実行
      const result = checkReferenceIntegrity(data);

      // Then: validがtrueでエラーが0件であること
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
