/**
 * グリッドスナップのユーティリティ関数
 */

/** グリッドサイズ（px） */
export const GRID_SIZE = 10;

/**
 * 座標値をグリッドにスナップする
 * @param value - スナップする値
 * @param gridSize - グリッドサイズ（デフォルト: GRID_SIZE）
 * @returns グリッドにスナップされた値
 */
export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * 位置座標をグリッドにスナップする
 * @param position - {x, y}座標
 * @param gridSize - グリッドサイズ（デフォルト: GRID_SIZE）
 * @returns グリッドにスナップされた座標
 */
export function snapPositionToGrid(
  position: { x: number; y: number },
  gridSize: number = GRID_SIZE
): { x: number; y: number } {
  return {
    x: snapToGrid(position.x, gridSize),
    y: snapToGrid(position.y, gridSize),
  };
}

/**
 * サイズをグリッドにスナップする
 * @param size - {width, height}サイズ
 * @param gridSize - グリッドサイズ（デフォルト: GRID_SIZE）
 * @returns グリッドにスナップされたサイズ
 */
export function snapSizeToGrid(
  size: { width: number; height: number },
  gridSize: number = GRID_SIZE
): { width: number; height: number } {
  return {
    width: snapToGrid(size.width, gridSize),
    height: snapToGrid(size.height, gridSize),
  };
}
