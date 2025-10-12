import type { SbpDsl } from '@enablement-map-studio/dsl';

/**
 * 入力フィールドにフォーカスがあるかチェック
 */
export function isInputFocused(): boolean {
  const target = document.activeElement as HTMLElement;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
}

/**
 * レーンと関連タスク・接続を削除した新しいSBPを返す
 * @param sbp - 現在のSBP DSL
 * @param laneId - 削除するレーンのID
 * @returns 削除後の新しいSBP DSL
 */
export function deleteLaneWithRelatedData(sbp: SbpDsl, laneId: string): SbpDsl {
  // 削除対象のレーンに属するタスクIDを収集
  const deletedTaskIds = sbp.tasks
    .filter((task) => task.lane === laneId)
    .map((task) => task.id);

  // レーンをフィルタリング
  const updatedLanes = sbp.lanes.filter((lane) => lane.id !== laneId);

  // タスクをフィルタリング
  const updatedTasks = sbp.tasks.filter((task) => task.lane !== laneId);

  // 接続をフィルタリング（削除されたタスクに関連する接続を除外）
  const updatedConnections = sbp.connections.filter(
    (conn) =>
      !deletedTaskIds.includes(conn.source) &&
      !deletedTaskIds.includes(conn.target)
  );

  return {
    ...sbp,
    lanes: updatedLanes,
    tasks: updatedTasks,
    connections: updatedConnections,
  };
}

/**
 * タスクと関連接続を削除した新しいSBPを返す
 * @param sbp - 現在のSBP DSL
 * @param taskId - 削除するタスクのID
 * @returns 削除後の新しいSBP DSL
 */
export function deleteTaskWithRelatedData(sbp: SbpDsl, taskId: string): SbpDsl {
  // タスクをフィルタリング
  const updatedTasks = sbp.tasks.filter((task) => task.id !== taskId);

  // 接続をフィルタリング（削除されたタスクに関連する接続を除外）
  const updatedConnections = sbp.connections.filter(
    (conn) => conn.source !== taskId && conn.target !== taskId
  );

  return {
    ...sbp,
    tasks: updatedTasks,
    connections: updatedConnections,
  };
}
