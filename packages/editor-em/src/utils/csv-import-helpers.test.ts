import { describe, it, expect } from 'vitest';
import type { CjmDsl, SbpDsl, EmDsl } from '@enablement-map-studio/dsl';
import {
  findOrCreateCjmPhase,
  findOrCreateCjmAction,
  findOrCreateSbpLane,
  findOrCreateSbpTask,
  findOrCreateEmAction,
  processSkillResource,
  processKnowledgeResource,
  processToolResource,
} from './csv-import-helpers';

// Test data fixtures
const createBaseCjm = (): CjmDsl => ({
  kind: 'cjm',
  version: '1.0',
  id: 'cjm:test',
  persona: { name: 'Test User', description: 'Test Description' },
  phases: [
    { id: 'cjm:phase:existing', name: '既存フェーズ' },
  ],
  actions: [
    { id: 'cjm:action:existing', name: '既存アクション', phase: 'cjm:phase:existing', emotion_score: 1 },
  ],
});

const createBaseSbp = (): SbpDsl => ({
  kind: 'sbp',
  version: '1.0',
  id: 'sbp:test',
  lanes: [
    { id: 'sbp:lane:existing', name: '既存レーン', kind: 'team' },
  ],
  tasks: [
    { id: 'sbp:task:existing', name: '既存タスク', lane: 'sbp:lane:existing' },
  ],
  connections: [],
});

const createBaseEm = (): EmDsl => ({
  kind: 'em',
  version: '1.0',
  id: 'em:test',
  outcomes: [],
  actions: [
    { id: 'em:action:existing', name: '既存行動', source_id: 'sbp:task:existing' },
  ],
  skills: [
    {
      id: 'em:skill:existing',
      name: '既存スキル',
      action_id: 'em:action:existing',
      learnings: [
        { title: '既存学習', url: 'https://example.com/old' },
      ],
    },
  ],
  knowledge: [
    { id: 'em:knowledge:existing', name: '既存ナレッジ', action_id: 'em:action:existing', url: 'https://example.com/old' },
  ],
  tools: [
    { id: 'em:tool:existing', name: '既存ツール', action_id: 'em:action:existing', url: 'https://example.com/old' },
  ],
});

describe('csv-import-helpers', () => {
  describe('findOrCreateCjmPhase', () => {
    it('findOrCreateCjmPhase_既存のフェーズが見つかる場合_同じフェーズを返すこと', () => {
      // Given
      const cjm = createBaseCjm();

      // When
      const result = findOrCreateCjmPhase(cjm, '既存フェーズ');

      // Then
      expect(result.phase).toEqual({ id: 'cjm:phase:existing', name: '既存フェーズ' });
      expect(result.cjm.phases).toHaveLength(1);
    });

    it('findOrCreateCjmPhase_新しいフェーズ名の場合_新しいフェーズを作成すること', () => {
      // Given
      const cjm = createBaseCjm();

      // When
      const result = findOrCreateCjmPhase(cjm, '新規フェーズ');

      // Then
      expect(result.phase).toBeDefined();
      expect(result.phase?.name).toBe('新規フェーズ');
      expect(result.phase?.id).toMatch(/^cjm:phase:/);
      expect(result.cjm.phases).toHaveLength(2);
    });

    it('findOrCreateCjmPhase_空文字の場合_nullを返すこと', () => {
      // Given
      const cjm = createBaseCjm();

      // When
      const result = findOrCreateCjmPhase(cjm, '');

      // Then
      expect(result.phase).toBeNull();
      expect(result.cjm.phases).toHaveLength(1);
    });

    it('findOrCreateCjmPhase_前後に空白がある場合_トリムされること', () => {
      // Given
      const cjm = createBaseCjm();

      // When
      const result = findOrCreateCjmPhase(cjm, '  新規フェーズ  ');

      // Then
      expect(result.phase?.name).toBe('新規フェーズ');
    });
  });

  describe('findOrCreateCjmAction', () => {
    it('findOrCreateCjmAction_既存のアクションが見つかる場合_同じアクションを返すこと', () => {
      // Given
      const cjm = createBaseCjm();

      // When
      const result = findOrCreateCjmAction(cjm, '既存アクション', 'cjm:phase:existing');

      // Then
      expect(result.action).toEqual({
        id: 'cjm:action:existing',
        name: '既存アクション',
        phase: 'cjm:phase:existing',
        emotion_score: 1,
      });
      expect(result.cjm.actions).toHaveLength(1);
    });

    it('findOrCreateCjmAction_新しいアクション名の場合_新しいアクションを作成すること', () => {
      // Given
      const cjm = createBaseCjm();

      // When
      const result = findOrCreateCjmAction(cjm, '新規アクション', 'cjm:phase:existing');

      // Then
      expect(result.action).toBeDefined();
      expect(result.action?.name).toBe('新規アクション');
      expect(result.action?.phase).toBe('cjm:phase:existing');
      expect(result.action?.emotion_score).toBe(0);
      expect(result.action?.id).toMatch(/^cjm:action:/);
      expect(result.cjm.actions).toHaveLength(2);
    });

    it('findOrCreateCjmAction_アクション名が空文字の場合_nullを返すこと', () => {
      // Given
      const cjm = createBaseCjm();

      // When
      const result = findOrCreateCjmAction(cjm, '', 'cjm:phase:existing');

      // Then
      expect(result.action).toBeNull();
      expect(result.cjm.actions).toHaveLength(1);
    });

    it('findOrCreateCjmAction_phaseIdがnullの場合_nullを返すこと', () => {
      // Given
      const cjm = createBaseCjm();

      // When
      const result = findOrCreateCjmAction(cjm, '新規アクション', null);

      // Then
      expect(result.action).toBeNull();
      expect(result.cjm.actions).toHaveLength(1);
    });

    it('findOrCreateCjmAction_前後に空白がある場合_トリムされること', () => {
      // Given
      const cjm = createBaseCjm();

      // When
      const result = findOrCreateCjmAction(cjm, '  新規アクション  ', 'cjm:phase:existing');

      // Then
      expect(result.action?.name).toBe('新規アクション');
    });
  });

  describe('findOrCreateSbpLane', () => {
    it('findOrCreateSbpLane_既存のレーンが見つかる場合_同じレーンを返すこと', () => {
      // Given
      const sbp = createBaseSbp();

      // When
      const result = findOrCreateSbpLane(sbp, '既存レーン');

      // Then
      expect(result.lane).toEqual({ id: 'sbp:lane:existing', name: '既存レーン', kind: 'team' });
      expect(result.sbp.lanes).toHaveLength(1);
    });

    it('findOrCreateSbpLane_新しいレーン名の場合_新しいレーンを作成すること', () => {
      // Given
      const sbp = createBaseSbp();

      // When
      const result = findOrCreateSbpLane(sbp, '新規レーン');

      // Then
      expect(result.lane).toBeDefined();
      expect(result.lane?.name).toBe('新規レーン');
      expect(result.lane?.kind).toBe('team');
      expect(result.lane?.id).toMatch(/^sbp:lane:/);
      expect(result.sbp.lanes).toHaveLength(2);
    });

    it('findOrCreateSbpLane_空文字の場合_nullを返すこと', () => {
      // Given
      const sbp = createBaseSbp();

      // When
      const result = findOrCreateSbpLane(sbp, '');

      // Then
      expect(result.lane).toBeNull();
      expect(result.sbp.lanes).toHaveLength(1);
    });

    it('findOrCreateSbpLane_前後に空白がある場合_トリムされること', () => {
      // Given
      const sbp = createBaseSbp();

      // When
      const result = findOrCreateSbpLane(sbp, '  新規レーン  ');

      // Then
      expect(result.lane?.name).toBe('新規レーン');
    });
  });

  describe('findOrCreateSbpTask', () => {
    it('findOrCreateSbpTask_既存のタスクが見つかる場合_同じタスクを返すこと', () => {
      // Given
      const sbp = createBaseSbp();

      // When
      const result = findOrCreateSbpTask(sbp, '既存タスク', 'sbp:lane:existing');

      // Then
      expect(result.task).toEqual({ id: 'sbp:task:existing', name: '既存タスク', lane: 'sbp:lane:existing' });
      expect(result.sbp.tasks).toHaveLength(1);
    });

    it('findOrCreateSbpTask_新しいタスク名の場合_新しいタスクを作成すること', () => {
      // Given
      const sbp = createBaseSbp();

      // When
      const result = findOrCreateSbpTask(sbp, '新規タスク', 'sbp:lane:existing');

      // Then
      expect(result.task).toBeDefined();
      expect(result.task?.name).toBe('新規タスク');
      expect(result.task?.lane).toBe('sbp:lane:existing');
      expect(result.task?.id).toMatch(/^sbp:task:/);
      expect(result.sbp.tasks).toHaveLength(2);
    });

    it('findOrCreateSbpTask_タスク名が空文字の場合_nullを返すこと', () => {
      // Given
      const sbp = createBaseSbp();

      // When
      const result = findOrCreateSbpTask(sbp, '', 'sbp:lane:existing');

      // Then
      expect(result.task).toBeNull();
      expect(result.sbp.tasks).toHaveLength(1);
    });

    it('findOrCreateSbpTask_laneIdがnullの場合_nullを返すこと', () => {
      // Given
      const sbp = createBaseSbp();

      // When
      const result = findOrCreateSbpTask(sbp, '新規タスク', null);

      // Then
      expect(result.task).toBeNull();
      expect(result.sbp.tasks).toHaveLength(1);
    });

    it('findOrCreateSbpTask_前後に空白がある場合_トリムされること', () => {
      // Given
      const sbp = createBaseSbp();

      // When
      const result = findOrCreateSbpTask(sbp, '  新規タスク  ', 'sbp:lane:existing');

      // Then
      expect(result.task?.name).toBe('新規タスク');
    });
  });

  describe('findOrCreateEmAction', () => {
    it('findOrCreateEmAction_既存の行動が見つかる場合_同じ行動を返すこと', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = findOrCreateEmAction(em, '既存行動', 'sbp:task:existing');

      // Then
      expect(result.action).toEqual({ id: 'em:action:existing', name: '既存行動', source_id: 'sbp:task:existing' });
      expect(result.em.actions).toHaveLength(1);
    });

    it('findOrCreateEmAction_新しい行動名の場合_新しい行動を作成すること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = findOrCreateEmAction(em, '新規行動', 'sbp:task:existing');

      // Then
      expect(result.action).toBeDefined();
      expect(result.action?.name).toBe('新規行動');
      expect(result.action?.source_id).toBe('sbp:task:existing');
      expect(result.action?.id).toMatch(/^em:action:/);
      expect(result.em.actions).toHaveLength(2);
    });

    it('findOrCreateEmAction_行動名が空文字の場合_nullを返すこと', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = findOrCreateEmAction(em, '', 'sbp:task:existing');

      // Then
      expect(result.action).toBeNull();
      expect(result.em.actions).toHaveLength(1);
    });

    it('findOrCreateEmAction_sourceIdがnullの場合_nullを返すこと', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = findOrCreateEmAction(em, '新規行動', null);

      // Then
      expect(result.action).toBeNull();
      expect(result.em.actions).toHaveLength(1);
    });

    it('findOrCreateEmAction_前後に空白がある場合_トリムされること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = findOrCreateEmAction(em, '  新規行動  ', 'sbp:task:existing');

      // Then
      expect(result.action?.name).toBe('新規行動');
    });
  });

  describe('processSkillResource', () => {
    it('processSkillResource_スラッシュなしのスキル名_シンプルなスキルを作成すること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processSkillResource(em, 'em:action:existing', '新規スキル', 'https://example.com/new');

      // Then
      const newSkill = result.skills?.find(s => s.name === '新規スキル');
      expect(newSkill).toBeDefined();
      expect(newSkill?.action_id).toBe('em:action:existing');
      expect(newSkill?.learnings).toEqual([]);
      expect(result.skills).toHaveLength(2);
    });

    it('processSkillResource_既存のシンプルスキルの場合_変更しないこと', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processSkillResource(em, 'em:action:existing', '既存スキル', 'https://example.com/new');

      // Then
      expect(result.skills).toHaveLength(1);
      expect(result.skills?.[0].id).toBe('em:skill:existing');
    });

    it('processSkillResource_スラッシュありのスキル名_学習コンテンツ付きスキルを作成すること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processSkillResource(em, 'em:action:existing', '新規スキル / 新規学習', 'https://example.com/new');

      // Then
      const newSkill = result.skills?.find(s => s.name === '新規スキル');
      expect(newSkill).toBeDefined();
      expect(newSkill?.action_id).toBe('em:action:existing');
      expect(newSkill?.learnings).toHaveLength(1);
      expect(newSkill?.learnings?.[0]).toEqual({ title: '新規学習', url: 'https://example.com/new' });
    });

    it('processSkillResource_既存スキルに新しい学習コンテンツを追加_配列に追加すること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processSkillResource(em, 'em:action:existing', '既存スキル / 新規学習', 'https://example.com/new');

      // Then
      const existingSkill = result.skills?.find(s => s.name === '既存スキル');
      expect(existingSkill?.learnings).toHaveLength(2);
      expect(existingSkill?.learnings?.[0]).toEqual({ title: '既存学習', url: 'https://example.com/old' });
      expect(existingSkill?.learnings?.[1]).toEqual({ title: '新規学習', url: 'https://example.com/new' });
    });

    it('processSkillResource_既存スキルの既存学習コンテンツ_URLを更新すること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processSkillResource(em, 'em:action:existing', '既存スキル / 既存学習', 'https://example.com/updated');

      // Then
      const existingSkill = result.skills?.find(s => s.name === '既存スキル');
      expect(existingSkill?.learnings).toHaveLength(1);
      expect(existingSkill?.learnings?.[0]).toEqual({ title: '既存学習', url: 'https://example.com/updated' });
    });

    it('processSkillResource_スラッシュの前後に空白がある場合_トリムされること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processSkillResource(em, 'em:action:existing', '新規スキル  /  新規学習  ', 'https://example.com/new');

      // Then
      const newSkill = result.skills?.find(s => s.name === '新規スキル');
      expect(newSkill?.learnings?.[0].title).toBe('新規学習');
    });
  });

  describe('processKnowledgeResource', () => {
    it('processKnowledgeResource_新しいナレッジの場合_新しいナレッジを作成すること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processKnowledgeResource(em, 'em:action:existing', '新規ナレッジ', 'https://example.com/new');

      // Then
      const newKnowledge = result.knowledge?.find(k => k.name === '新規ナレッジ');
      expect(newKnowledge).toBeDefined();
      expect(newKnowledge?.action_id).toBe('em:action:existing');
      expect(newKnowledge?.url).toBe('https://example.com/new');
      expect(result.knowledge).toHaveLength(2);
    });

    it('processKnowledgeResource_既存のナレッジの場合_URLを更新すること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processKnowledgeResource(em, 'em:action:existing', '既存ナレッジ', 'https://example.com/updated');

      // Then
      const existingKnowledge = result.knowledge?.find(k => k.name === '既存ナレッジ');
      expect(existingKnowledge?.id).toBe('em:knowledge:existing');
      expect(existingKnowledge?.url).toBe('https://example.com/updated');
      expect(result.knowledge).toHaveLength(1);
    });
  });

  describe('processToolResource', () => {
    it('processToolResource_新しいツールの場合_新しいツールを作成すること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processToolResource(em, 'em:action:existing', '新規ツール', 'https://example.com/new');

      // Then
      const newTool = result.tools?.find(t => t.name === '新規ツール');
      expect(newTool).toBeDefined();
      expect(newTool?.action_id).toBe('em:action:existing');
      expect(newTool?.url).toBe('https://example.com/new');
      expect(result.tools).toHaveLength(2);
    });

    it('processToolResource_既存のツールの場合_URLを更新すること', () => {
      // Given
      const em = createBaseEm();

      // When
      const result = processToolResource(em, 'em:action:existing', '既存ツール', 'https://example.com/updated');

      // Then
      const existingTool = result.tools?.find(t => t.name === '既存ツール');
      expect(existingTool?.id).toBe('em:tool:existing');
      expect(existingTool?.url).toBe('https://example.com/updated');
      expect(result.tools).toHaveLength(1);
    });
  });
});
