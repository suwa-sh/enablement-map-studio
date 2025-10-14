import { test, expect } from '@playwright/test';

/**
 * スモークテスト
 * 基本的なアプリケーションの動作確認
 */
test.describe('スモークテスト', () => {
  test('アプリケーションが起動すること', async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('/');

    // ページタイトルが表示されること
    await expect(page).toHaveTitle(/Enablement Map Studio/i);
  });

  test('サンプルYAMLをロードできること', async ({ page }) => {
    await page.goto('/');

    // Load Sampleボタンをクリック
    await page.getByRole('button', { name: /Load Sample/i }).click();

    // CJMページにリダイレクトされること
    await expect(page).toHaveURL(/\/cjm/);

    // 数秒待機してページがロードされることを確認
    await page.waitForTimeout(2000);
  });

  test('各エディタページに遷移できること', async ({ page }) => {
    await page.goto('/');

    // CJMページ
    await page.goto('/cjm');
    await expect(page).toHaveURL(/\/cjm/);

    // SBPページ
    await page.goto('/sbp');
    await expect(page).toHaveURL(/\/sbp/);

    // Outcomeページ
    await page.goto('/outcome');
    await expect(page).toHaveURL(/\/outcome/);

    // EMページ
    await page.goto('/em');
    await expect(page).toHaveURL(/\/em/);
  });

  test('YAMLを保存できること', async ({ page }) => {
    await page.goto('/');

    // サンプルをロード
    await page.getByRole('button', { name: /Load Sample/i }).click();
    await page.waitForTimeout(1000);

    // File System Access APIをモック化
    await page.evaluate(() => {
      let savedContent = '';
      (window as any).showSaveFilePicker = async () => {
        return {
          createWritable: async () => ({
            write: async (data: string) => {
              savedContent = data;
            },
            close: async () => {},
          }),
          name: 'enablement-map.yaml',
        };
      };
    });

    // Save As...ボタンをクリック
    await page.getByRole('button', { name: /Save As\.\.\./i }).click();

    // Toast通知が表示されることを確認
    await expect(page.getByText(/保存しました/i)).toBeVisible();
  });

  test('Clear Canvasでデータをクリアできること', async ({ page }) => {
    await page.goto('/');

    // サンプルをロード
    await page.getByRole('button', { name: /Load Sample/i }).click();
    await page.waitForTimeout(1000);

    // Clear Canvasボタンをクリック
    await page.getByRole('button', { name: /Clear Canvas/i }).click();

    // 確認ダイアログが表示されること
    await expect(page.getByRole('dialog')).toBeVisible();

    // クリアボタンをクリック
    await page.getByRole('button', { name: /クリア/i }).click();

    // Save/Save As...ボタンが無効化されること（データがない状態）
    await expect(page.getByRole('button', { name: /^Save$/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Save As\.\.\./i })).toBeDisabled();
  });
});
