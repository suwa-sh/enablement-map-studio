import { test, expect, Locator, Page } from '@playwright/test';

/**
 * ハッピーパス: キャンバスクリアから全エディタでのデータ作成
 *
 * シナリオの流れ:
 * 1. キャンバスクリア
 * 2. CJM: ペルソナ設定、フェーズ追加x2、アクション追加
 * 3. SBP: CJM同期確認、レーン追加x2、タスク追加、エッジ接続
 * 4. Outcome: SBP同期確認、CSF選択、KGI/CSF/KPI設定
 * 5. EM: Outcome同期確認、行動追加、スキル/学習コンテンツ/ナレッジ/ツール追加、リソース一覧確認
 */

/**
 * 入力フィールドに値を入力するヘルパー関数
 * 既存のテキストを全選択してから新しい値を入力する
 *
 * @param page - Playwrightのページオブジェクト
 * @param locator - 入力フィールドのlocator
 * @param value - 入力する値
 */
async function fillInput(page: Page, locator: Locator, value: string) {
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
async function selectMuiOption(page: Page, selectId: string, optionName: string) {
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
function getAddButtonInSection(page: Page, sectionText: string) {
  const section = page.locator(`text=${sectionText}`).locator('..');
  return section.getByText('追加');
}

test.describe('ハッピーパス: キャンバスクリアから全エディタでのデータ作成', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
  });

  test('キャンバスクリアからCJM/SBP/Outcome/EMで完全なデータを作成できること', async ({ page }) => {
    // ========================================
    // ステップ1: キャンバスクリア
    // ========================================
    await test.step('キャンバスクリア', async () => {
      // サンプルをロード（クリアするデータがない場合のため）
      await page.getByRole('button', { name: 'LOAD SAMPLE' }).click();

      // キャンバスクリア実行
      await page.getByRole('button', { name: 'CLEAR CANVAS' }).click();

      // 確認ダイアログでクリアを実行
      const confirmDialog = page.getByRole('dialog');
      await expect(confirmDialog.getByText('すべてのデータをクリアしてもよろしいですか')).toBeVisible();
      await confirmDialog.getByRole('button', { name: 'クリア' }).click();

      // CLEAR CANVASボタンが無効化されていることでクリア完了を確認
      await expect(page.getByRole('button', { name: 'CLEAR CANVAS' })).toBeDisabled();
    });

    // ========================================
    // ステップ2: CJMエディタでデータ作成
    // ========================================
    await test.step('CJMエディタ_初期状態確認', async () => {
      await page.goto('http://localhost:5173/cjm');
      await page.waitForLoadState('networkidle');

      // クリア後の初期状態では、フェーズ追加ボタンのみ表示されている
      await expect(page.getByRole('button', { name: 'フェーズ追加' })).toBeVisible();
      await expect(page.getByText('フェーズを追加する か YAML をロードしてください')).toBeVisible();
    });

    await test.step('CJMエディタ_フェーズ追加_1つ目', async () => {
      // フェーズ追加ボタンをクリック
      await page.getByRole('button', { name: 'フェーズ追加' }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // フェーズ名を変更
      await fillInput(page, dialog.getByLabel('フェーズ名'), '認識');

      // 保存
      await dialog.getByRole('button', { name: 'SAVE' }).click();

      // プロパティパネルを閉じる
      await page.keyboard.press('Escape');

      // フェーズが追加されたことを確認
      await expect(page.getByText('認識').first()).toBeVisible();
      await expect(page.getByText('アクション 1').first()).toBeVisible();
    });

    await test.step('CJMエディタ_フェーズ追加_2つ目', async () => {
      // 2つ目のフェーズを追加
      await page.getByRole('button', { name: 'フェーズ追加' }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // フェーズ名を変更
      await fillInput(page, dialog.getByLabel('フェーズ名'), '検討');

      // 保存
      await dialog.getByRole('button', { name: 'SAVE' }).click();

      // プロパティパネルを閉じる
      await page.keyboard.press('Escape');

      // 2つ目のフェーズが追加されたことを確認
      await expect(page.getByText('検討').first()).toBeVisible();
      await expect(page.getByText('アクション 1').first()).toBeVisible();
    });

    await test.step('CJMエディタ_ペルソナ設定', async () => {
      // ペルソナをクリックして設定（フェーズ追加後に表示される）
      await page.getByText('（未設定 - クリックして設定）').click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // ペルソナ名を入力
      await fillInput(page, dialog.getByLabel('ペルソナ名'), 'テスト利用者');

      // 説明を入力
      await fillInput(page, dialog.getByLabel('説明'), 'システムを利用するテストユーザー');

      // 保存
      await dialog.getByRole('button', { name: 'SAVE' }).click();

      // 閉じる
      await page.keyboard.press('Escape');

      // ペルソナが設定されたことを確認
      await expect(page.getByText('テスト利用者')).toBeVisible();
    });

    await test.step('CJMエディタ_アクション編集_1つ目', async () => {
      // 1つ目のアクションをクリック
      await page.getByText('アクション 1').first().click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // アクション名を変更
      // Clear: 'アクション'
      await fillInput(page, dialog.getByLabel('アクション'), '課題を認識する');

      // タッチポイントを入力
      await fillInput(page, dialog.getByLabel('タッチポイント'), '営業担当者との会話');

      // 保存
      await dialog.getByRole('button', { name: 'SAVE' }).click();

      // 閉じる
      await page.keyboard.press('Escape');

      // アクションが更新されたことを確認（テーブル内のparagraphを選択）
      await expect(page.getByRole('paragraph').filter({ hasText: /^課題を認識する$/ })).toBeVisible();
    });

    await test.step('CJMエディタ_アクション編集_2つ目', async () => {
      // 2つ目のアクションをクリック
      await page.getByText('アクション 1').first().click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // アクション名を変更
      // Clear: 'アクション'
      await fillInput(page, dialog.getByLabel('アクション'), '解決策を検討する');

      // 保存
      await dialog.getByRole('button', { name: 'SAVE' }).click();

      // 閉じる
      await page.keyboard.press('Escape');

      // アクションが更新されたことを確認（テーブル内のparagraphを選択）
      await expect(page.getByRole('paragraph').filter({ hasText: /^解決策を検討する$/ })).toBeVisible();
    });

    // ========================================
    // ステップ3: SBPエディタでデータ作成
    // ========================================
    await test.step('SBPエディタ_CJMの内容が同期されていることを確認', async () => {
      await page.goto('http://localhost:5173/sbp');
      await page.waitForLoadState('networkidle');

      // CJMで作成したアクションが表示されていることを確認
      await expect(page.getByText('課題を認識する').first()).toBeVisible();
      await expect(page.getByText('解決策を検討する').first()).toBeVisible();
    });

    await test.step('SBPエディタ_レーン追加_1つ目', async () => {
      // レーン追加ボタンをクリック
      await page.getByRole('button', { name: /レーン.*追加/ }).click();

      // 新しいレーンが追加されたことを確認
      await expect(page.getByText('新しいレーン').first()).toBeVisible();

      // プロパティダイアログで名前を変更
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Clear: 'レーン名'
      await fillInput(page, dialog.getByLabel('レーン名'), '営業');

      // 保存
      await dialog.getByRole('button', { name: 'SAVE' }).click();

      // 閉じる
      await page.keyboard.press('Escape');

      // レーン名が変更されたことを確認
      await expect(page.getByText('営業').first()).toBeVisible();
    });

    await test.step('SBPエディタ_レーン追加_2つ目', async () => {
      // 2つ目のレーン追加
      await page.getByRole('button', { name: /レーン.*追加/ }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Clear: 'レーン名'
      await fillInput(page, dialog.getByLabel('レーン名'), '開発');

      // 保存
      await dialog.getByRole('button', { name: 'SAVE' }).click();

      // 閉じる
      await page.keyboard.press('Escape');

      // 2つ目のレーンが追加されたことを確認
      await expect(page.getByText('開発').first()).toBeVisible();
    });

    await test.step('SBPエディタ_タスク追加_営業レーン', async () => {
      // タスク追加ボタンをクリック
      await page.getByRole('button', { name: /タスク.*追加/ }).click();

      // タスク追加ダイアログでタスク名を入力
      const taskDialog = page.getByRole('dialog', { name: 'タスク追加' });
      await expect(taskDialog).toBeVisible();

      // レーンを選択（1つ目のレーンはデフォルトで選択されているので、そのまま使用）
      // 明示的に選択する場合は以下をアンコメント
      // const laneCombobox = taskDialog.getByRole('combobox');
      // await laneCombobox.click();
      // await page.getByRole('option', { name: '営業' }).click();

      await fillInput(page, taskDialog.getByLabel('タスク名'), 'ヒアリング');

      // 追加ボタンをクリック
      await taskDialog.getByRole('button', { name: '追加' }).click();

      // ダイアログが閉じるのを待つ
      await expect(taskDialog).not.toBeVisible();

      // タスクが追加されたことを確認
      await expect(page.getByText('ヒアリング').first()).toBeVisible();

      // プロパティパネルが開いている場合は閉じる
      await page.keyboard.press('Escape');
    });

    await test.step('SBPエディタ_画面調整', async () => {
      // React Flowのauto-fitボタンをクリックして、全要素を表示
      const fitViewButton = page.getByRole('button', { name: 'Fit view' });
      await expect(fitViewButton).toBeVisible();
      await fitViewButton.click();
    });

    await test.step('SBPエディタ_タスク追加_開発レーン', async () => {
      // 2つ目のタスク追加
      await page.getByRole('button', { name: /タスク.*追加/ }).click();

      const taskDialog = page.getByRole('dialog', { name: 'タスク追加' });
      await expect(taskDialog).toBeVisible();

      // レーンを選択（MUI Select）
      await selectMuiOption(page, 'lane-select', '開発');

      // レーンが変更されたことを確認
      await expect(taskDialog.getByRole('combobox')).toContainText('開発');

      await fillInput(page, taskDialog.getByLabel('タスク名'), '要件定義');

      // 追加ボタンをクリック
      await taskDialog.getByRole('button', { name: '追加' }).click();

      // ダイアログが閉じるのを待つ
      await expect(taskDialog).not.toBeVisible();

      // 2つ目のタスクが追加されたことを確認
      await expect(page.getByText('要件定義').first()).toBeVisible();
    });

    // Note: エッジの接続はReact Flowのドラッグ操作が必要なため、
    // Playwrightでのテストが複雑になる。ここでは追加したタスクが表示されることを確認するに留める。

    // ========================================
    // ステップ4: Outcomeエディタでデータ作成
    // ========================================
    await test.step('Outcomeエディタ_SBPの内容が同期されていることを確認', async () => {
      await page.goto('http://localhost:5173/outcome');
      await page.waitForLoadState('networkidle');

      // SBPで作成したタスクが表示されていることを確認
      const pageContent = await page.locator('body').innerHTML();
      expect(pageContent).toContain('ヒアリング');
      expect(pageContent).toContain('要件定義');
    });

    await test.step('Outcomeエディタ_CSF選択とKGI/KPI設定', async () => {
      // ヒアリングタスクをクリックしてCSFとして選択
      await page.getByText('ヒアリング').first().click();

      // CSFチップが表示されることを確認
      await expect(page.getByText('CSF').nth(1)).toBeVisible();

      // プロパティパネル内のKGI名前フィールドが表示されるのを待つ
      // (Drawerは persistent なので常にDOMに存在するが、openプロパティで制御される)
      const kgiNameField = page.getByRole('textbox', { name: '名前' }).first();
      await expect(kgiNameField).toBeVisible();

      // KGI名を入力
      await fillInput(page, kgiNameField, '顧客満足度向上');

      // CSF説明を入力
      const csfDescField = page.getByRole('textbox', { name: '説明' }).first();
      await fillInput(page, csfDescField, '顧客ニーズの正確な把握');

      // KPI名を入力
      const kpiNameField = page.getByRole('textbox', { name: '名前' }).nth(1);
      await fillInput(page, kpiNameField, 'ヒアリング完了率');

      // 目標値を入力
      const targetField = page.getByLabel('目標値');
      await fillInput(page, targetField, '95');

      // 単位を選択（MUI Select）
      await selectMuiOption(page, 'unit-select', '%');

      // SAVEボタンをクリック
      await page.getByRole('button', { name: 'SAVE' }).click();

      // データが保存されたことを確認（メインエリアに表示される）
      // プロパティパネルは persistent なので開いたままでOK
      await expect(page.getByText('顧客満足度向上')).toBeVisible();
      await expect(page.getByText('ヒアリング完了率')).toBeVisible();

      // 95% が表示されることを確認
      const pageContent = await page.locator('body').innerHTML();
      expect(pageContent).toContain('95');
      expect(pageContent).toContain('%');
    });

    // ========================================
    // ステップ5: EMエディタでデータ作成
    // ========================================
    await test.step('EMエディタ_Outcomeの内容が同期されていることを確認', async () => {
      await page.goto('http://localhost:5173/em');
      await page.waitForLoadState('networkidle');

      // Outcomeで設定した内容が表示されていることを確認
      const pageContent = await page.locator('body').innerHTML();
      expect(pageContent).toContain('ヒアリング完了率');
      expect(pageContent).toContain('ヒアリング');
    });

    await test.step('EMエディタ_CSFタスクに行動を追加', async () => {
      // ヒアリングタスクを選択
      await page.getByText('ヒアリング').first().click();

      // 「必要な行動を追加」ボタンをクリック
      const addActionButton = page.getByRole('button', { name: '必要な行動を追加' });
      await expect(addActionButton).toBeVisible();
      await addActionButton.click();

      // プロパティパネルが開くことを確認（「スキル (0)」テキストが表示される）
      await expect(page.getByText('スキル (0)')).toBeVisible();
    });

    await test.step('EMエディタ_行動にスキル・ナレッジ・ツールを追加', async () => {
      // スキル追加ボタンをクリック
      const addSkillButton = getAddButtonInSection(page, 'スキル (0)');
      await expect(addSkillButton).toBeVisible();
      await addSkillButton.click();

      // スキル名を入力（デフォルト値「新しいスキル」が入っている）
      const skillNameInput = page.getByLabel('スキル名').last();
      await expect(skillNameInput).toBeVisible();
      await fillInput(page, skillNameInput, 'ヒアリングスキル');

      // 学習コンテンツ追加ボタンをクリック
      const addContentButton = getAddButtonInSection(page, '学習コンテンツ (0)');
      await expect(addContentButton).toBeVisible();
      await addContentButton.click();

      // 学習コンテンツの名前を入力（デフォルト値「新しい学習コンテンツ」が入っている）
      const contentNameInput = page.getByLabel('名前').last();
      await expect(contentNameInput).toBeVisible();
      await fillInput(page, contentNameInput, 'ヒアリング研修');

      // URLを入力
      const contentUrlInput = page.getByLabel('URL').last();
      await expect(contentUrlInput).toBeVisible();
      await fillInput(page, contentUrlInput, 'https://example.com/hearing-training');

      // ナレッジ追加ボタンをクリック
      const addKnowledgeButton = getAddButtonInSection(page, 'ナレッジ (0)');
      await expect(addKnowledgeButton).toBeVisible();
      await addKnowledgeButton.click();

      // ナレッジ名を入力（デフォルト値「新しいナレッジ」が入っている）
      const knowledgeNameInput = page.getByLabel('名前').last();
      await expect(knowledgeNameInput).toBeVisible();
      await fillInput(page, knowledgeNameInput, 'ヒアリングチェックリスト');

      // ナレッジURLを入力
      const knowledgeUrlInput = page.getByLabel('URL').last();
      await expect(knowledgeUrlInput).toBeVisible();
      await fillInput(page, knowledgeUrlInput, 'https://example.com/hearing-checklist');

      // ツール追加ボタンをクリック
      const addToolButton = getAddButtonInSection(page, 'ツール (0)');
      await expect(addToolButton).toBeVisible();
      await addToolButton.click();

      // ツール名を入力（デフォルト値「新しいツール」が入っている）
      const toolNameInput = page.getByLabel('名前').last();
      await expect(toolNameInput).toBeVisible();
      await fillInput(page, toolNameInput, 'ヒアリングシート');

      // ツールURLを入力
      const toolUrlInput = page.getByLabel('URL').last();
      await expect(toolUrlInput).toBeVisible();
      await fillInput(page, toolUrlInput, 'https://example.com/hearing-sheet');

      // SAVEボタンをクリック
      await page.getByRole('button', { name: 'SAVE' }).click();

      // プロパティパネル外をクリックして閉じる
      await page.locator('body').click({ position: { x: 100, y: 300 } });
    });

    await test.step('EMエディタ_リソース一覧に登録内容が反映されていることを確認', async () => {
      // リソース一覧テーブルを確認
      const tableContent = await page.locator('table').first().textContent();

      // 追加したリソースが表示されていることを確認
      expect(tableContent).toContain('ヒアリングスキル');
      expect(tableContent).toContain('ヒアリング研修');
      expect(tableContent).toContain('ヒアリングチェックリスト');
      expect(tableContent).toContain('ヒアリングシート');

      // CSFに関連する行が表示されていることを確認
      expect(tableContent).toContain('CSF');
    });

    // ========================================
    // ステップ6: YAMLエクスポート/インポートの確認
    // ========================================
    await test.step('YAMLエクスポート', async () => {
      await page.goto('http://localhost:5173/');
      await page.waitForLoadState('networkidle');

      // YAMLをエクスポート
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'EXPORT YAML' }).click();
      const download = await downloadPromise;
      const downloadPath = await download.path();

      // ダウンロードが成功したことを確認
      expect(downloadPath).toBeTruthy();

      // ダウンロードパスを次のステップで使用するために保存
      (page as any)._downloadPath = downloadPath;
    });

    await test.step('データクリア後にYAMLインポート', async () => {
      // データをクリア
      await page.getByRole('button', { name: 'CLEAR CANVAS' }).click();

      const confirmDialog = page.getByRole('dialog');
      await confirmDialog.getByRole('button', { name: 'クリア' }).click();

      // Export YAMLボタンが無効化されていることを確認
      await expect(page.getByRole('button', { name: 'EXPORT YAML' })).toBeDisabled();

      // ダウンロードしたYAMLを再インポート
      const downloadPath = (page as any)._downloadPath;
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: 'LOAD YAML' }).click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(downloadPath!);

      // データが復元されたことを確認（CJMページに遷移）
      await expect(page).toHaveURL(/\/cjm/);
      await expect(page.getByText('テスト利用者')).toBeVisible();
    });

    // ========================================
    // ステップ7: localStorageへの永続化確認
    // ========================================
    await test.step('localStorageへの永続化確認', async () => {
      // ページをリロード
      await page.reload();
      await page.waitForLoadState('networkidle');

      // データが保持されていることを確認
      await page.goto('http://localhost:5173/cjm');
      await page.waitForLoadState('networkidle');

      // ペルソナ情報が保持されていることを確認
      await expect(page.getByText('テスト利用者')).toBeVisible();

      // フェーズ情報が保持されていることを確認
      await expect(page.getByText('認識').first()).toBeVisible();
      await expect(page.getByText('検討').first()).toBeVisible();
    });
  });
});
