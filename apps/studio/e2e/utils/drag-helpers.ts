import { Page, Locator } from '@playwright/test';

/**
 * 要素をオフセット分ドラッグ&ドロップする
 * @dnd-kit および React Flow のポインターイベントに対応
 * @param page Playwrightのページオブジェクト
 * @param locator 要素のロケータ
 * @param xOffset X方向の移動距離（ピクセル）
 * @param yOffset Y方向の移動距離（ピクセル）
 * @param steps ドラッグのステップ数（デフォルト: 4）
 */
export async function dragElementByOffset(
  page: Page,
  locator: Locator,
  xOffset: number,
  yOffset: number,
  steps = 4
): Promise<void> {
  // 要素の位置とサイズを取得
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }

  // 要素の中心座標を計算
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // ドラッグ操作を実行（ポインターイベントを使用）
  await locator.scrollIntoViewIfNeeded();
  await page.mouse.move(centerX, centerY);
  await page.mouse.down({ button: 'left' });
  await page.waitForTimeout(30); // activation delay/threshold を尊重
  await page.mouse.move(centerX + xOffset, centerY + yOffset, { steps });
  await page.mouse.up();
}

/**
 * 要素をリサイズする（右下のハンドルからドラッグ）
 * @param page Playwrightのページオブジェクト
 * @param locator 要素のロケータ
 * @param widthDelta 幅の変化量（ピクセル）
 * @param heightDelta 高さの変化量（ピクセル）
 * @param steps ドラッグのステップ数（デフォルト: 4）
 */
export async function resizeElementByOffset(
  page: Page,
  locator: Locator,
  widthDelta: number,
  heightDelta: number,
  steps = 4
): Promise<void> {
  // 要素の位置とサイズを取得
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }

  // 右下の座標を計算
  const rightBottomX = box.x + box.width;
  const rightBottomY = box.y + box.height;

  // リサイズ操作を実行（ポインターイベントを使用）
  await locator.scrollIntoViewIfNeeded();
  await page.mouse.move(rightBottomX, rightBottomY);
  await page.mouse.down({ button: 'left' });
  await page.waitForTimeout(30); // activation delay を尊重
  await page.mouse.move(rightBottomX + widthDelta, rightBottomY + heightDelta, { steps });
  await page.mouse.up();
}

/**
 * ドラッグインジケータアイコンを使って要素をドラッグ
 * @dnd-kit で実装された並び替えに使用
 * アイコンの親要素（listenersを持つBox）をターゲットにする
 * @param page Playwrightのページオブジェクト
 * @param dragHandleIconLocator ドラッグハンドルアイコン（DragIndicator）のロケータ
 * @param xOffset X方向の移動距離（ピクセル）
 * @param yOffset Y方向の移動距離（ピクセル）
 * @param steps ドラッグのステップ数（デフォルト: 4）
 */
export async function dragByHandleWithOffset(
  page: Page,
  dragHandleIconLocator: Locator,
  xOffset: number,
  yOffset: number,
  steps = 4
): Promise<void> {
  // アイコンではなく、listenersを持つ親要素をターゲットにする
  const handleParent = dragHandleIconLocator.locator('..');
  const box = await handleParent.boundingBox();
  if (!box) {
    throw new Error('Drag handle not found or not visible');
  }

  // ドラッグハンドルの中心座標を計算
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // ドラッグ操作を実行（ポインターイベントを使用）
  await handleParent.scrollIntoViewIfNeeded();
  await page.mouse.move(centerX, centerY);
  await page.mouse.down({ button: 'left' });
  await page.waitForTimeout(30); // @dnd-kit の activation constraint を尊重

  // activation constraint (distance: 8) を超えるために、最初に10px移動してから目的地へ
  const activationDistance = 10;
  if (xOffset !== 0) {
    await page.mouse.move(centerX + (xOffset > 0 ? activationDistance : -activationDistance), centerY);
  } else if (yOffset !== 0) {
    await page.mouse.move(centerX, centerY + (yOffset > 0 ? activationDistance : -activationDistance));
  }
  await page.waitForTimeout(10);

  // 最終位置まで移動
  await page.mouse.move(centerX + xOffset, centerY + yOffset, { steps });
  await page.mouse.up();
}

/**
 * エッジ（線）を選択して削除する
 * React Flowで使用
 * @param page Playwrightのページオブジェクト
 * @param edgeLocator エッジのロケータ
 */
export async function deleteEdge(page: Page, edgeLocator: Locator): Promise<void> {
  // エッジを選択
  await edgeLocator.focus();
  await page.waitForTimeout(300);

  // Deleteキーで削除
  await page.keyboard.press('Delete');
  await page.waitForTimeout(500); // 削除完了を待つ
}
