import { describe, test, expect } from 'vitest';
import { validateDsl, validateCjmDsl, validateSbpDsl, validateOutcomeDsl, validateEmDsl } from './validator';
import type { CjmDsl, SbpDsl, OutcomeDsl, EmDsl } from '../types';

describe('validator', () => {
  describe('validateCjmDsl', () => {
    test('validateCjmDsl_有効なCJM DSLの場合_validがtrueであること', () => {
      // Given: 有効なCJM DSL
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
        actions: [
          {
            id: 'cjm:action:test-action-id',
            phase: 'cjm:phase:test-phase-id',
            name: 'Test Action',
            touchpoints: ['Web'],
            thoughts_feelings: ['Happy'],
            emotion_score: 1,
          },
        ],
      };

      // When: バリデーションを実行
      const result = validateCjmDsl(cjm);

      // Then: validがtrueであること
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('validateCjmDsl_必須フィールドが欠けている場合_エラーが返却されること', () => {
      // Given: personaが欠けているCJM DSL
      const invalidCjm = {
        kind: 'cjm',
        phases: [],
        actions: [],
      };

      // When: バリデーションを実行
      const result = validateCjmDsl(invalidCjm);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    test('validateCjmDsl_emotion_scoreが範囲外の場合_エラーが返却されること', () => {
      // Given: emotion_scoreが範囲外のCJM DSL
      const invalidCjm = {
        kind: 'cjm',
        version: '1.0',
        id: 'cjm:test-id',
        persona: {
          name: 'Test User',
          description: 'Test Description',
        },
        phases: [],
        actions: [
          {
            id: 'cjm:action:test-action-id',
            phase: 'cjm:phase:test-phase-id',
            name: 'Test Action',
            touchpoints: ['Web'],
            thoughts_feelings: ['Happy'],
            emotion_score: 5, // 範囲外（-2 to 2のはず）
          },
        ],
      };

      // When: バリデーションを実行
      const result = validateCjmDsl(invalidCjm);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateSbpDsl', () => {
    test('validateSbpDsl_有効なSBP DSLの場合_validがtrueであること', () => {
      // Given: 有効なSBP DSL
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
        tasks: [
          {
            id: 'sbp:task:test-task-id',
            lane: 'sbp:lane:test-lane-id',
            name: 'Test Task',
          },
        ],
        connections: [],
      };

      // When: バリデーションを実行
      const result = validateSbpDsl(sbp);

      // Then: validがtrueであること
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('validateSbpDsl_必須フィールドが欠けている場合_エラーが返却されること', () => {
      // Given: lanesが欠けているSBP DSL
      const invalidSbp = {
        kind: 'sbp',
        tasks: [],
      };

      // When: バリデーションを実行
      const result = validateSbpDsl(invalidSbp);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateOutcomeDsl', () => {
    test('validateOutcomeDsl_有効なOutcome DSLの場合_validがtrueであること', () => {
      // Given: 有効なOutcome DSL
      const outcome: OutcomeDsl = {
        kind: 'outcome',
        id: 'outcome:test-id',
        kgi: {
          id: 'outcome:kgi:test-kgi-id',
          name: 'Test KGI',
        },
        primary_csf: {
          id: 'outcome:csf:test-csf-id',
          kgi_id: 'outcome:kgi:test-kgi-id',
          source_id: 'sbp:task:test-task-id',
          rationale: 'Test rationale',
        },
        primary_kpi: {
          id: 'outcome:kpi:test-kpi-id',
          csf_id: 'outcome:csf:test-csf-id',
          name: 'Test KPI',
          target: 100,
        },
      };

      // When: バリデーションを実行
      const result = validateOutcomeDsl(outcome);

      // Then: validがtrueであること
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('validateOutcomeDsl_必須フィールドが欠けている場合_エラーが返却されること', () => {
      // Given: kgiが欠けているOutcome DSL
      const invalidOutcome = {
        kind: 'outcome',
        id: 'outcome:test-id',
        primary_csf: {
          id: 'outcome:csf:test-csf-id',
          kgi_id: 'outcome:kgi:test-kgi-id',
          source_id: 'sbp:task:test-task-id',
          rationale: 'Test rationale',
        },
        primary_kpi: {
          id: 'outcome:kpi:test-kpi-id',
          csf_id: 'outcome:csf:test-csf-id',
          name: 'Test KPI',
          target: 100,
        },
      };

      // When: バリデーションを実行
      const result = validateOutcomeDsl(invalidOutcome);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateEmDsl', () => {
    test('validateEmDsl_有効なEM DSLの場合_validがtrueであること', () => {
      // Given: 有効なEM DSL
      const em: EmDsl = {
        kind: 'em',
        id: 'em:test-id',
        outcomes: [],
        actions: [],
        skills: [],
        knowledge: [],
        tools: [],
      };

      // When: バリデーションを実行
      const result = validateEmDsl(em);

      // Then: validがtrueであること
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('validateEmDsl_必須フィールドが欠けている場合_エラーが返却されること', () => {
      // Given: actionsが欠けているEM DSL
      const invalidEm = {
        kind: 'em',
        id: 'em:test-id',
        outcomes: [],
        skills: [],
        knowledge: [],
        tools: [],
      };

      // When: バリデーションを実行
      const result = validateEmDsl(invalidEm);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateDsl', () => {
    test('validateDsl_CJM DSLが有効な場合_validがtrueでkindがcjmであること', () => {
      // Given: 有効なCJM DSL
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

      // When: バリデーションを実行
      const result = validateDsl(cjm);

      // Then: validがtrueでkindがcjmであること
      expect(result.valid).toBe(true);
      expect(result.kind).toBe('cjm');
    });

    test('validateDsl_SBP DSLが有効な場合_validがtrueでkindがsbpであること', () => {
      // Given: 有効なSBP DSL
      const sbp: SbpDsl = {
        kind: 'sbp',
        version: '1.0',
        id: 'sbp:test-id',
        lanes: [],
        tasks: [],
        connections: [],
      };

      // When: バリデーションを実行
      const result = validateDsl(sbp);

      // Then: validがtrueでkindがsbpであること
      expect(result.valid).toBe(true);
      expect(result.kind).toBe('sbp');
    });

    test('validateDsl_Outcome DSLが有効な場合_validがtrueでkindがoutcomeであること', () => {
      // Given: 有効なOutcome DSL
      const outcome: OutcomeDsl = {
        kind: 'outcome',
        id: 'outcome:test-id',
        kgi: {
          id: 'outcome:kgi:test-kgi-id',
          name: 'Test KGI',
        },
        primary_csf: {
          id: 'outcome:csf:test-csf-id',
          kgi_id: 'outcome:kgi:test-kgi-id',
          source_id: 'sbp:task:test-task-id',
          rationale: 'Test rationale',
        },
        primary_kpi: {
          id: 'outcome:kpi:test-kpi-id',
          csf_id: 'outcome:csf:test-csf-id',
          name: 'Test KPI',
          target: 100,
        },
      };

      // When: バリデーションを実行
      const result = validateDsl(outcome);

      // Then: validがtrueでkindがoutcomeであること
      expect(result.valid).toBe(true);
      expect(result.kind).toBe('outcome');
    });

    test('validateDsl_EM DSLが有効な場合_validがtrueでkindがemであること', () => {
      // Given: 有効なEM DSL
      const em: EmDsl = {
        kind: 'em',
        id: 'em:test-id',
        outcomes: [],
        actions: [],
        skills: [],
        knowledge: [],
        tools: [],
      };

      // When: バリデーションを実行
      const result = validateDsl(em);

      // Then: validがtrueでkindがemであること
      expect(result.valid).toBe(true);
      expect(result.kind).toBe('em');
    });

    test('validateDsl_kindが不明な場合_エラーが返却されること', () => {
      // Given: 不明なkindを持つオブジェクト
      const unknownKind = {
        kind: 'unknown',
        data: 'test',
      };

      // When: バリデーションを実行
      const result = validateDsl(unknownKind);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown DSL kind: unknown');
    });

    test('validateDsl_オブジェクトでない場合_エラーが返却されること', () => {
      // Given: オブジェクトでないデータ
      const notAnObject = 'not an object';

      // When: バリデーションを実行
      const result = validateDsl(notAnObject);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Data must be an object');
    });

    test('validateDsl_nullの場合_エラーが返却されること', () => {
      // Given: nullデータ
      const nullData = null;

      // When: バリデーションを実行
      const result = validateDsl(nullData);

      // Then: validがfalseでエラーが含まれること
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Data must be an object');
    });
  });
});
