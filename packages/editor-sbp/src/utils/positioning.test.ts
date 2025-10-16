import { describe, it, expect } from 'vitest';
import { findNonOverlappingPosition } from './positioning';
import type { SbpTask } from '@enablement-map-studio/dsl';

describe('findNonOverlappingPosition', () => {
  describe('既存タスクがない場合', () => {
    it('デフォルト位置をそのまま返す', () => {
      // Given: 既存タスクが存在しない
      const existingTasks: SbpTask[] = [];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: デフォルト位置 (100, 100) が返される
      expect(position).toEqual({ x: 100, y: 100 });
    });

    it('カスタムデフォルト位置を使用できる', () => {
      // Given: 既存タスクが存在せず、カスタムデフォルト位置を指定
      const existingTasks: SbpTask[] = [];
      const targetLaneId = 'lane-1';
      const customDefault = { x: 200, y: 150 };

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId, customDefault);

      // Then: カスタムデフォルト位置が返される
      expect(position).toEqual({ x: 200, y: 150 });
    });
  });

  describe('単一の重なり検出', () => {
    it('デフォルト位置にタスクがある場合_右下にオフセットする', () => {
      // Given: デフォルト位置 (100, 100) にタスクが既に存在
      const existingTasks: SbpTask[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          lane: 'lane-1',
          position: { x: 100, y: 100 },
        },
      ];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: 右下に50pxずつオフセットされた位置が返される
      expect(position).toEqual({ x: 150, y: 150 });
    });

    it('微妙にずれた位置も重なりと判定する', () => {
      // Given: デフォルト位置から5pxずれた位置にタスクが存在（閾値10px以内）
      const existingTasks: SbpTask[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          lane: 'lane-1',
          position: { x: 105, y: 105 },
        },
      ];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: 重なりと判定され、オフセットされる
      expect(position).toEqual({ x: 150, y: 150 });
    });
  });

  describe('複数の重なりでの斜め配置', () => {
    it('2つのタスクが重なっている場合_さらに右下にオフセットする', () => {
      // Given: デフォルト位置と1段階オフセット位置にタスクが存在
      const existingTasks: SbpTask[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          lane: 'lane-1',
          position: { x: 100, y: 100 },
        },
        {
          id: 'task-2',
          name: 'Task 2',
          lane: 'lane-1',
          position: { x: 150, y: 150 },
        },
      ];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: さらに右下にオフセットされた位置が返される
      expect(position).toEqual({ x: 200, y: 200 });
    });

    it('3つ以上の連続した重なりでも正しく配置される', () => {
      // Given: 3つのタスクが斜めに配置済み
      const existingTasks: SbpTask[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          lane: 'lane-1',
          position: { x: 100, y: 100 },
        },
        {
          id: 'task-2',
          name: 'Task 2',
          lane: 'lane-1',
          position: { x: 150, y: 150 },
        },
        {
          id: 'task-3',
          name: 'Task 3',
          lane: 'lane-1',
          position: { x: 200, y: 200 },
        },
      ];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: 4段階目の位置が返される
      expect(position).toEqual({ x: 250, y: 250 });
    });
  });

  describe('異なるレーンのタスクとの関係', () => {
    it('異なるレーンのタスクは干渉しない', () => {
      // Given: 別のレーンのタスクがデフォルト位置に存在
      const existingTasks: SbpTask[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          lane: 'lane-2', // 異なるレーン
          position: { x: 100, y: 100 },
        },
      ];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: デフォルト位置がそのまま返される（別レーンなので無視）
      expect(position).toEqual({ x: 100, y: 100 });
    });

    it('同じレーンのタスクのみを考慮する', () => {
      // Given: 複数レーンに複数タスクが存在
      const existingTasks: SbpTask[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          lane: 'lane-2',
          position: { x: 100, y: 100 },
        },
        {
          id: 'task-2',
          name: 'Task 2',
          lane: 'lane-1', // 同じレーン
          position: { x: 100, y: 100 },
        },
        {
          id: 'task-3',
          name: 'Task 3',
          lane: 'lane-3',
          position: { x: 150, y: 150 },
        },
      ];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: 同じレーンのタスク(task-2)のみを考慮してオフセットされる
      expect(position).toEqual({ x: 150, y: 150 });
    });
  });

  describe('エッジケース', () => {
    it('positionが未定義のタスクは無視する', () => {
      // Given: position が未定義のタスクが存在
      const existingTasks: SbpTask[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          lane: 'lane-1',
          // positionなし
        },
      ];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: デフォルト位置が返される（positionなしのタスクは無視）
      expect(position).toEqual({ x: 100, y: 100 });
    });

    it('十分に離れた位置のタスクは重ならないと判定される', () => {
      // Given: デフォルト位置から十分離れた位置にタスクが存在
      const existingTasks: SbpTask[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          lane: 'lane-1',
          position: { x: 400, y: 400 },
        },
      ];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: デフォルト位置がそのまま返される
      expect(position).toEqual({ x: 100, y: 100 });
    });

    it('空きスペースを見つける', () => {
      // Given: デフォルト位置と2段階オフセット位置にタスクが存在（1段階目は空き）
      const existingTasks: SbpTask[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          lane: 'lane-1',
          position: { x: 100, y: 100 },
        },
        {
          id: 'task-2',
          name: 'Task 2',
          lane: 'lane-1',
          position: { x: 200, y: 200 }, // 1段階飛ばし
        },
      ];
      const targetLaneId = 'lane-1';

      // When: 新しいタスクの位置を計算
      const position = findNonOverlappingPosition(existingTasks, targetLaneId);

      // Then: 空いている1段階目の位置が返される
      expect(position).toEqual({ x: 150, y: 150 });
    });
  });
});
