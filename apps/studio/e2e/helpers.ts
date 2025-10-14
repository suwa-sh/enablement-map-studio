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

/**
 * 入力フィールドに値を入力するヘルパー関数
 * 既存のテキストを全選択してから新しい値を入力する
 *
 * @param page - Playwrightのページオブジェクト
 * @param locator - 入力フィールドのlocator
 * @param value - 入力する値
 */
export async function fillInput(page: Page, locator: any, value: string) {
  await locator.click();
  await locator.fill(''); // まず空にする
  // MUIのTextFieldが値の変更を認識するための短い待機
  await page.waitForTimeout(100);
  await locator.fill(value); // 新しい値を入力
  // 入力が確定するための短い待機
  await page.waitForTimeout(100);
}

/**
 * MUI Selectコンポーネントでオプションを選択するヘルパー関数
 *
 * @param page - Playwrightのページオブジェクト
 * @param selectId - SelectコンポーネントのID
 * @param optionName - 選択するオプションの名前
 */
export async function selectMuiOption(page: Page, selectId: string, optionName: string) {
  // Selectをクリックして開く
  const selectElement = page.locator(`#${selectId}`);
  await expect(selectElement).toBeVisible();
  await selectElement.click();

  // listboxが表示されるのを待つ
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();

  // オプションを選択（listboxスコープ内で検索）
  const option = listbox.getByRole('option', { name: optionName });
  await expect(option).toBeVisible();
  await option.click();

  // listboxが閉じるのを待つ
  await expect(listbox).not.toBeVisible();
}

/**
 * セクション内の「追加」ボタンを取得するヘルパー関数
 *
 * @param page - Playwrightのページオブジェクト
 * @param sectionText - セクションを識別するテキスト（例: "スキル (0)"）
 * @returns 追加ボタンのlocator
 */
export function getAddButtonInSection(page: Page, sectionText: string) {
  const section = page.locator(`text=${sectionText}`).locator('..');
  return section.getByText('追加');
}
