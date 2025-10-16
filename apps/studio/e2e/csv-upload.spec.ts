import { test, expect } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * CSV一括登録機能のテスト
 *
 * EMエディタのリソース一覧でCSVファイルをアップロードして、
 * CJM、SBP、EMの各DSLが正しく更新されることを確認する
 */

test.describe('CSV一括登録機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    // サンプルデータをロード
    await page.getByRole('button', { name: 'LOAD SAMPLE' }).click();
    await page.waitForTimeout(1000);

    // EMエディタに移動
    await page.goto('http://localhost:5173/em');
    await page.waitForLoadState('networkidle');
  });

  test('CSVダウンロードでリソース一覧をエクスポートできること', async ({ page }) => {
    // リソース一覧が表示されていることを確認
    await expect(page.getByRole('heading', { name: 'リソース一覧' })).toBeVisible();

    // CSVダウンロードボタンをクリック
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'CSVダウンロード' }).click(),
    ]);

    // ダウンロードされたファイルが正しいことを確認
    expect(download.suggestedFilename()).toMatch(/^リソース一覧_\d{8}_\d{6}\.csv$/);

    // ダウンロードしたファイルの内容を確認
    const csvContent = await download.createReadStream().then(stream => {
      return new Promise<string>((resolve) => {
        const chunks: Buffer[] = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      });
    });

    // BOMが付いていることを確認
    expect(csvContent.charCodeAt(0)).toBe(0xFEFF);

    // ヘッダー行が正しいことを確認
    const lines = csvContent.slice(1).split('\n'); // BOMをスキップ
    expect(lines[0]).toBe('CSF,CJMフェーズ,CJMアクション,SBPレーン,SBPタスク,必要な行動,リソースタイプ,リソース,URL');

    // データ行が存在することを確認
    expect(lines.length).toBeGreaterThan(1);
  });

  test('既存のリソースを更新するCSVをアップロードできること', async ({ page }) => {
    // テスト用のCSVファイルを作成
    const tmpDir = join(process.cwd(), 'tmp');
    mkdirSync(tmpDir, { recursive: true });

    const csvContent = `CSF,CJMフェーズ,CJMアクション,SBPレーン,SBPタスク,必要な行動,リソースタイプ,リソース,URL
○,UAT,動きを確認する,開発チーム,UATの準備,UATシナリオに基づきテストケースを設計する,ツール,JIRA (テスト管理),https://jira.local/updated`;

    const csvPath = join(tmpDir, 'test-update.csv');
    writeFileSync(csvPath, '\uFEFF' + csvContent, 'utf-8'); // BOM付きで保存

    // CSVアップロードボタンをクリック
    const fileInput = page.locator('input[type="file"][accept=".csv"]');
    await fileInput.setInputFiles(csvPath);

    // トースト通知が表示されることを確認
    await expect(page.getByText('CSVファイルからリソースを一括登録しました')).toBeVisible({ timeout: 5000 });

    // リソース一覧で更新されたURLを確認
    const updatedLink = page.getByRole('link', { name: 'https://jira.local/updated' });
    await expect(updatedLink).toBeVisible();
  });

  test('新しいリソースを追加するCSVをアップロードできること', async ({ page }) => {
    // テスト用のCSVファイルを作成
    const tmpDir = join(process.cwd(), 'tmp');
    mkdirSync(tmpDir, { recursive: true });

    const csvContent = `CSF,CJMフェーズ,CJMアクション,SBPレーン,SBPタスク,必要な行動,リソースタイプ,リソース,URL
,UAT,動きを確認する,開発チーム,UATの準備,UATシナリオに基づきテストケースを設計する,ツール,新しいツール,https://example.com/new-tool`;

    const csvPath = join(tmpDir, 'test-create.csv');
    writeFileSync(csvPath, '\uFEFF' + csvContent, 'utf-8');

    // CSVアップロードボタンをクリック
    const fileInput = page.locator('input[type="file"][accept=".csv"]');
    await fileInput.setInputFiles(csvPath);

    // トースト通知が表示されることを確認
    await expect(page.getByText('CSVファイルからリソースを一括登録しました')).toBeVisible({ timeout: 5000 });

    // リソース一覧で新しいリソースを確認
    await expect(page.getByText('新しいツール')).toBeVisible();
    await expect(page.getByRole('link', { name: 'https://example.com/new-tool' })).toBeVisible();
  });

  test('新しいCJMフェーズとアクションを作成するCSVをアップロードできること', async ({ page }) => {
    // テスト用のCSVファイルを作成
    const tmpDir = join(process.cwd(), 'tmp');
    mkdirSync(tmpDir, { recursive: true });

    const csvContent = `CSF,CJMフェーズ,CJMアクション,SBPレーン,SBPタスク,必要な行動,リソースタイプ,リソース,URL
,新規フェーズ,新規アクション,新規レーン,新規タスク,新規行動,ナレッジ,新規ナレッジ,https://example.com/knowledge`;

    const csvPath = join(tmpDir, 'test-create-all.csv');
    writeFileSync(csvPath, '\uFEFF' + csvContent, 'utf-8');

    // CSVアップロードボタンをクリック
    const fileInput = page.locator('input[type="file"][accept=".csv"]');
    await fileInput.setInputFiles(csvPath);

    // トースト通知が表示されることを確認
    await expect(page.getByText('CSVファイルからリソースを一括登録しました')).toBeVisible({ timeout: 5000 });

    // CJMエディタに移動して新しいフェーズとアクションを確認
    await page.goto('http://localhost:5173/cjm');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('新規フェーズ')).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: /^新規アクション$/ })).toBeVisible();

    // SBPエディタに移動して新しいレーンとタスクを確認
    await page.goto('http://localhost:5173/sbp');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('新規レーン')).toBeVisible();
    await expect(page.getByText('新規タスク')).toBeVisible();

    // EMエディタに戻って新しい行動とナレッジを確認
    await page.goto('http://localhost:5173/em');
    await page.waitForLoadState('networkidle');
    // 「必要な行動」セクションで確認
    await expect(page.getByRole('paragraph').filter({ hasText: '新規行動' })).toBeVisible();
    // リソース一覧テーブルで確認
    await expect(page.getByRole('cell', { name: '新規ナレッジ' })).toBeVisible();
  });

  test('スキルと学習コンテンツを追加するCSVをアップロードできること', async ({ page }) => {
    // テスト用のCSVファイルを作成
    const tmpDir = join(process.cwd(), 'tmp');
    mkdirSync(tmpDir, { recursive: true });

    const csvContent = `CSF,CJMフェーズ,CJMアクション,SBPレーン,SBPタスク,必要な行動,リソースタイプ,リソース,URL
,UAT,動きを確認する,開発チーム,UATの準備,UATシナリオに基づきテストケースを設計する,スキル/学習コンテンツ,新規スキル / 新規学習コンテンツ,https://example.com/learning`;

    const csvPath = join(tmpDir, 'test-skill-learning.csv');
    writeFileSync(csvPath, '\uFEFF' + csvContent, 'utf-8');

    // CSVアップロードボタンをクリック
    const fileInput = page.locator('input[type="file"][accept=".csv"]');
    await fileInput.setInputFiles(csvPath);

    // トースト通知が表示されることを確認
    await expect(page.getByText('CSVファイルからリソースを一括登録しました')).toBeVisible({ timeout: 5000 });

    // リソース一覧で新しいスキルと学習コンテンツを確認
    await expect(page.getByText('新規スキル / 新規学習コンテンツ')).toBeVisible();
    await expect(page.getByRole('link', { name: 'https://example.com/learning' })).toBeVisible();
  });

  test('不正なCSVフォーマットでエラーが表示されること', async ({ page }) => {
    // テスト用の不正なCSVファイルを作成（カラム数が不足）
    const tmpDir = join(process.cwd(), 'tmp');
    mkdirSync(tmpDir, { recursive: true });

    const csvContent = `CSF,CJMフェーズ,CJMアクション
○,UAT,動きを確認する`;

    const csvPath = join(tmpDir, 'test-invalid.csv');
    writeFileSync(csvPath, '\uFEFF' + csvContent, 'utf-8');

    // CSVアップロードボタンをクリック
    const fileInput = page.locator('input[type="file"][accept=".csv"]');
    await fileInput.setInputFiles(csvPath);

    // エラートースト通知が表示されることを確認
    await expect(page.getByText('CSVのカラム数が不正です。9列必要です。')).toBeVisible({ timeout: 5000 });
  });

  test('空のCSVファイルでエラーが表示されること', async ({ page }) => {
    // テスト用の空のCSVファイルを作成
    const tmpDir = join(process.cwd(), 'tmp');
    mkdirSync(tmpDir, { recursive: true });

    const csvPath = join(tmpDir, 'test-empty.csv');
    writeFileSync(csvPath, '', 'utf-8');

    // CSVアップロードボタンをクリック
    const fileInput = page.locator('input[type="file"][accept=".csv"]');
    await fileInput.setInputFiles(csvPath);

    // エラートースト通知が表示されることを確認
    await expect(page.getByText('CSVファイルが空です')).toBeVisible({ timeout: 5000 });
  });
});
