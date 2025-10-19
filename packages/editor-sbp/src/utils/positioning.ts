import type { SbpTask } from '@enablement-map-studio/dsl';
import { snapPositionToGrid, GRID_SIZE } from './grid';

/**
 * タスクノードの想定サイズ
 * TaskNode.tsxのPaperコンポーネントは minWidth: 180, minHeight: 60 だが、
 * padding (p: 2 = 16px) やテキストの折り返しを考慮して、
 * 実際のレンダリングサイズに近い値を設定
 */
export const TASK_NODE_WIDTH = 200;
export const TASK_NODE_HEIGHT = 80;

/**
 * 重なり判定の閾値
 * この距離以内にタスクがある場合は重なっていると判定
 */
const OVERLAP_THRESHOLD = GRID_SIZE;

/**
 * 重なりを避けるためのオフセット量（グリッドサイズの倍数）
 */
const OFFSET_X = GRID_SIZE * 5; // 50px
const OFFSET_Y = GRID_SIZE * 5; // 50px

/**
 * 最大試行回数（無限ループを防ぐ）
 */
const MAX_ATTEMPTS = 100;

/**
 * 2つのタスクが重なっているかを判定
 */
function isOverlapping(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): boolean {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);

  // 両方の差分がノードサイズより小さく、かつ閾値以内なら重なっている
  return dx < TASK_NODE_WIDTH && dy < TASK_NODE_HEIGHT && dx < OVERLAP_THRESHOLD && dy < OVERLAP_THRESHOLD;
}

/**
 * 既存のタスクと重ならない位置を見つける
 *
 * @param existingTasks - 既存のタスク配列
 * @param targetLaneId - 新しいタスクを配置するレーンのID
 * @param defaultPosition - デフォルトの配置位置（通常は { x: 100, y: 100 }）
 * @returns 重ならない位置
 */
export function findNonOverlappingPosition(
  existingTasks: SbpTask[],
  targetLaneId: string,
  defaultPosition: { x: number; y: number } = { x: 100, y: 100 }
): { x: number; y: number } {
  // 同じレーン内のタスクのみを対象とする
  const tasksInSameLane = existingTasks.filter(
    (task) => task.lane === targetLaneId && task.position
  );

  // 既存タスクがない場合はデフォルト位置をグリッドにスナップして返す
  if (tasksInSameLane.length === 0) {
    return snapPositionToGrid(defaultPosition);
  }

  let candidatePosition = snapPositionToGrid(defaultPosition);
  let attempts = 0;

  // 重ならない位置が見つかるまで、右下にずらしていく
  while (attempts < MAX_ATTEMPTS) {
    let hasOverlap = false;

    for (const task of tasksInSameLane) {
      if (task.position && isOverlapping(candidatePosition, task.position)) {
        hasOverlap = true;
        break;
      }
    }

    // 重なりがなければその位置を返す
    if (!hasOverlap) {
      return candidatePosition;
    }

    // 重なりがある場合は右下にオフセット（常にグリッドにスナップ）
    candidatePosition = snapPositionToGrid({
      x: candidatePosition.x + OFFSET_X,
      y: candidatePosition.y + OFFSET_Y,
    });
    attempts++;
  }

  // 最大試行回数に達した場合は最後の候補位置を返す
  // （実際にはレーンのサイズ内で100回もずらせば必ず空きが見つかるはず）
  return candidatePosition;
}
