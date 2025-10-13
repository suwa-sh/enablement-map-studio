import { Page, expect } from '@playwright/test';

/**
 * e2eテスト用の共通ヘルパー関数
 */

/**
 * localStorageをクリアしてアプリケーションをリセットする
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  // リロード後、アプリケーションが初期化されるまで待機
  await page.waitForLoadState('networkidle');
}

/**
 * サンプルYAMLファイルを読み込む
 */
export async function loadSampleYaml(page: Page) {
  // サンプルYAMLロードボタンをクリック
  await page.getByRole('button', { name: /Load Sample/i }).click();

  // データが読み込まれるまで待機（トースト通知とナビゲーションを待つ）
  await page.waitForTimeout(1000);
}

/**
 * 指定したエディタページに遷移する
 */
export async function navigateToEditor(
  page: Page,
  editor: 'cjm' | 'sbp' | 'outcome' | 'em'
) {
  await page.goto(`/${editor}`);
  await page.waitForLoadState('networkidle');
}

/**
 * プロパティパネルが開いていることを確認する
 */
export async function expectPropertyPanelOpen(page: Page) {
  await expect(
    page.locator('[role="complementary"], .property-panel')
  ).toBeVisible();
}

/**
 * プロパティパネルが閉じていることを確認する
 */
export async function expectPropertyPanelClosed(page: Page) {
  await expect(
    page.locator('[role="complementary"], .property-panel')
  ).not.toBeVisible();
}

/**
 * 確認ダイアログで「はい」を選択する
 */
export async function confirmDialog(page: Page) {
  // 確認ダイアログ内のボタンをクリック（クリア、削除など）
  const dialog = page.getByRole('dialog');
  const confirmButton = dialog.getByRole('button').filter({ hasText: /クリア|削除|Delete|Clear|OK/i });
  await confirmButton.click();
  await page.waitForTimeout(300);
}

/**
 * 確認ダイアログで「いいえ」を選択する
 */
export async function cancelDialog(page: Page) {
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /いいえ|No|キャンセル|Cancel/i })
    .click();
  await page.waitForTimeout(300);
}

/**
 * トースト通知が表示されることを確認する
 */
export async function expectToastMessage(page: Page, message: string | RegExp) {
  await expect(page.getByRole('alert').filter({ hasText: message })).toBeVisible({
    timeout: 5000,
  });
}

/**
 * YAMLをエクスポートする
 */
export async function exportYaml(page: Page): Promise<string> {
  // ダウンロード開始を待機するPromiseを作成
  const downloadPromise = page.waitForEvent('download');

  // YAMLエクスポートボタンをクリック
  await page.getByRole('button', { name: /Export YAML/i }).click();

  // ダウンロードを待機
  const download = await downloadPromise;

  // ダウンロードしたファイルの内容を読み込む
  const path = await download.path();
  if (!path) {
    throw new Error('Download path is null');
  }

  const fs = require('fs');
  return fs.readFileSync(path, 'utf-8');
}

/**
 * YAMLをインポートする
 */
export async function importYaml(page: Page, yamlContent: string) {
  // 一時ファイルを作成
  const fs = require('fs');
  const path = require('path');
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const tmpFile = path.join(tmpDir, `test-import-${Date.now()}.yaml`);
  fs.writeFileSync(tmpFile, yamlContent, 'utf-8');

  try {
    // ファイル選択イベントを待機
    const fileChooserPromise = page.waitForEvent('filechooser');

    // YAMLインポートボタンをクリック
    await page.getByRole('button', { name: /Load YAML/i }).click();

    // ファイルを選択
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(tmpFile);

    // データが読み込まれるまで待機（トースト通知とナビゲーションを待つ）
    await page.waitForTimeout(1000);
  } finally {
    // 一時ファイルを削除
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
}

/**
 * データをクリアする
 */
export async function clearData(page: Page) {
  // クリアボタンをクリック
  await page.getByRole('button', { name: /Clear Canvas/i }).click();

  // 確認ダイアログで「はい」を選択
  await confirmDialog(page);

  // データがクリアされるまで待機
  await page.waitForTimeout(500);
}
