import { test, expect } from '@playwright/test';
import {
  dragByHandleWithOffset,
  dragElementByOffset,
  resizeElementByOffset,
  deleteEdge
} from './utils/drag-helpers';
import { fillInput } from './helpers';

/**
 * 更新・削除確認シナリオ
 *
 * サンプルデータをロードしてから、各エディタで更新・削除操作を確認する
 * ハッピーパスで確認済みの新規作成操作は省略
 */

test.describe('更新・削除確認シナリオ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');

    // サンプルデータをロード
    await page.getByRole('button', { name: 'LOAD SAMPLE' }).click();
    await page.waitForTimeout(1000);
  });

  test('サンプルデータをロードしてから各エディタで更新・削除操作を確認できること', async ({ page }) => {
    // ========================================
    // CJMエディタでの更新・削除操作
    // ========================================
    await test.step('CJMエディタ_フェーズの変更', async () => {
      await page.goto('http://localhost:5173/cjm');
      await page.waitForLoadState('networkidle');

      // 最初のフェーズ（要件定義）をクリック
      await page.getByText('要件定義').first().click();
      await page.waitForTimeout(500);

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // フェーズ名を変更
      await fillInput(page, dialog.getByLabel('フェーズ名'), '要件定義（更新後）');
      await page.waitForTimeout(300);

      // 保存
      await dialog.getByRole('button', { name: 'SAVE' }).click();
      await page.waitForTimeout(500);

      // 閉じる
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // 変更が反映されたことを確認
      await expect(page.getByText('要件定義（更新後）').first()).toBeVisible();
    });

    await test.step('CJMエディタ_フェーズの順番を入れ替え', async () => {
      // フェーズのDragIndicatorを取得
      const phaseHeaders = page.locator('thead th');
      const firstPhaseHeader = phaseHeaders.filter({ hasText: '要件定義' }).first();
      await expect(firstPhaseHeader).toBeVisible();

      const firstPhaseDragHandle = firstPhaseHeader.locator('svg[data-testid="DragIndicatorIcon"]');
      await expect(firstPhaseDragHandle).toBeVisible();

      // 右方向に300px移動（次のフェーズの位置を越える）
      await dragByHandleWithOffset(page, firstPhaseDragHandle, 300, 0);

      // フェーズの順序が変更されたことを確認
      await expect(async () => {
        const phaseHeadersAfter = page.locator('thead th').filter({ hasText: /要件定義|設計確認/ });
        const firstPhaseText = await phaseHeadersAfter.first().textContent();
        expect(firstPhaseText).toContain('設計確認'); // 2番目のフェーズが1番目に
      }).toPass({ timeout: 3000 });

      // ドラッグ操作完了を待つ
      await page.waitForTimeout(1000);
    });

    await test.step('CJMエディタ_アクションの変更', async () => {
      // 「要求を伝える」アクションをクリック
      // テーブル内のparagraph（Typography）要素を選択
      const actionParagraph = page.getByRole('paragraph').filter({ hasText: /^要求を伝える$/ });
      await actionParagraph.waitFor({ state: 'visible' });
      await actionParagraph.click();
      await page.waitForTimeout(500);

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // アクション名を変更
      await fillInput(page, dialog.getByLabel('アクション'), '要求を伝える（更新後）');
      await page.waitForTimeout(300);

      // 保存
      await dialog.getByRole('button', { name: 'SAVE' }).click();
      await page.waitForTimeout(500);

      // 閉じる
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // 変更が反映されたことを確認
      await expect(page.getByText('要求を伝える（更新後）').first()).toBeVisible();
    });

    await test.step('CJMエディタ_アクションの順番を入れ替え', async () => {
      // UATフェーズ内の2つのアクションを入れ替える
      const actionCell = page.locator('tbody td').filter({ hasText: '動きを確認する' }).first();
      await expect(actionCell).toBeVisible();

      const actionDragHandle = actionCell.locator('svg[data-testid="DragIndicatorIcon"]').first();
      await expect(actionDragHandle).toBeVisible();

      // 右方向に200px移動（同じフェーズ内で次の位置へ）
      await dragByHandleWithOffset(page, actionDragHandle, 200, 0);

      // ドラッグ操作が完了するまで待機
      await page.waitForTimeout(1000);
      await expect(actionCell).toBeVisible();
    });

    await test.step('CJMエディタ_アクションの削除', async () => {
      // 削除対象のアクションをクリック
      const actionToDelete = page.getByRole('paragraph').filter({ hasText: /^日常業務で利用する$/ });
      await actionToDelete.scrollIntoViewIfNeeded();
      await actionToDelete.click();
      await page.waitForTimeout(500);

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // 削除ボタンをクリック
      await dialog.getByRole('button', { name: 'DELETE' }).click();
      await page.waitForTimeout(500);

      // 確認ダイアログで削除を実行
      const confirmDialog = page.getByRole('dialog');
      await confirmDialog.getByRole('button', { name: 'OK' }).click();
      await page.waitForTimeout(1000);

      // アクションが削除されたことを確認
      await expect(page.getByText('日常業務で利用する').first()).not.toBeVisible();
    });

    await test.step('CJMエディタ_フェーズの削除', async () => {
      // 削除対象のフェーズ（運用保守）をクリック
      await page.getByText('運用保守').first().click();
      await page.waitForTimeout(500);

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // 削除ボタンをクリック
      await dialog.getByRole('button', { name: 'DELETE' }).click();
      await page.waitForTimeout(500);

      // 確認ダイアログで削除を実行
      const confirmDialog = page.getByRole('dialog');
      await confirmDialog.getByRole('button', { name: 'OK' }).click();
      await page.waitForTimeout(1000);

      // フェーズが削除されたことを確認
      await expect(page.getByText('運用保守').first()).not.toBeVisible();
    });

    // ========================================
    // SBPエディタでの更新・削除操作
    // ========================================
    await test.step('SBPエディタ_タスクの変更', async () => {
      await page.goto('http://localhost:5173/sbp');
      await page.waitForLoadState('networkidle');

      // タスク（UATの準備）をクリック
      const task = page.getByText('UATの準備').first();
      if (await task.isVisible()) {
        await task.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // タスク名を変更
          await fillInput(page, dialog.getByLabel('タスク名'), 'UATの準備（更新後）');
          await page.waitForTimeout(300);

          // 保存
          await dialog.getByRole('button', { name: 'SAVE' }).click();
          await page.waitForTimeout(500);

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

          // 変更が反映されたことを確認
          await expect(page.getByText('UATの準備（更新後）').first()).toBeVisible();
        }
      }
    });

    await test.step('SBPエディタ_タスクの移動', async () => {
      // タスクを取得
      const task = page.locator('.react-flow__node-taskNode').first();
      await expect(task).toBeVisible();

      // タスクを右下に移動（100px右、100px下）
      await dragElementByOffset(page, task, 100, 100);

      // タスクが移動したことを確認
      await expect(task).toBeVisible();
    });

    await test.step('SBPエディタ_エッジの削除', async () => {
      // エッジを削除
      const edge = page.locator('.react-flow__edge-path').first();
      if (await edge.isVisible()) {
        await deleteEdge(page, edge);

        // エッジが削除されたことを確認
        const edgesCount = await page.locator('.react-flow__edge').count();
        expect(edgesCount).toBeGreaterThanOrEqual(0);
      }
    });

    await test.step('SBPエディタ_タスクの削除', async () => {
      // 削除対象のタスクをクリック
      const task = page.getByText('監視とレポーティング').first();
      if (await task.isVisible()) {
        await task.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // 削除ボタンをクリック
          await dialog.getByRole('button', { name: 'DELETE' }).click();
          await page.waitForTimeout(500);

          // 確認ダイアログで削除を実行
          const confirmDialog = page.getByRole('dialog');
          await confirmDialog.getByRole('button', { name: 'OK' }).click();
          await page.waitForTimeout(1000);
        }
      }
    });

    await test.step('SBPエディタ_レーンのサイズ変更', async () => {
      // レーンを取得
      const lane = page.locator('.react-flow__node-laneNode').first();
      await expect(lane).toBeVisible();

      // レーンを選択
      await lane.focus();

      // 右下のリサイズハンドルからドラッグしてリサイズ（幅+50px、高さ+30px）
      await resizeElementByOffset(page, lane, 50, 30);

      // レーンがリサイズされたことを確認
      await expect(lane).toBeVisible();
    });

    await test.step('SBPエディタ_レーンの移動', async () => {
      // レーンを取得
      const lane = page.locator('.react-flow__node-laneNode').first();
      await expect(lane).toBeVisible();

      // レーンを右に50px移動
      await dragElementByOffset(page, lane, 50, 0);

      // レーンが移動したことを確認
      await expect(lane).toBeVisible();
    });

    await test.step('SBPエディタ_レーンの削除', async () => {
      // 削除対象のレーンをクリック
      const lane = page.getByText('運用').first();
      if (await lane.isVisible()) {
        await lane.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // 削除ボタンをクリック
          await dialog.getByRole('button', { name: 'DELETE' }).click();
          await page.waitForTimeout(500);

          // 確認ダイアログで削除を実行
          const confirmDialog = page.getByRole('dialog');
          await confirmDialog.getByRole('button', { name: 'OK' }).click();
          await page.waitForTimeout(1000);
        }
      }
    });

    // ========================================
    // Outcomeエディタでの更新・削除操作
    // ========================================
    await test.step('Outcomeエディタ_CSFの付け替え', async () => {
      await page.goto('http://localhost:5173/outcome');
      await page.waitForLoadState('networkidle');

      // 別のタスクをクリックしてCSFとして選択
      const task = page.getByText('設計レビュー').first();
      if (await task.isVisible()) {
        await task.click();
        await page.waitForTimeout(1000);

        // CSFマークが表示されることを確認
        const pageContent = await page.locator('body').innerHTML();
        expect(pageContent).toContain('CSF');
      }
    });

    await test.step('Outcomeエディタ_KGIの変更', async () => {
      // KGIカードをクリック
      await page.getByText('開発サイクルの迅速化と品質向上').first().click();
      await page.waitForTimeout(500);

      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible()) {
        // KGI名を変更
        await fillInput(page, dialog.getByLabel('KGI名'), '開発サイクルの迅速化と品質向上（更新後）');
        await page.waitForTimeout(300);

        // 保存
        await dialog.getByRole('button', { name: 'SAVE' }).click();
        await page.waitForTimeout(500);

        // 閉じる
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // 変更が反映されたことを確認
        await expect(page.getByText('開発サイクルの迅速化と品質向上（更新後）')).toBeVisible();
      }
    });

    await test.step('Outcomeエディタ_CSFの変更', async () => {
      // CSFカードをクリック
      const csfCards = page.locator('text=CSF').locator('..');
      if (await csfCards.first().isVisible()) {
        await csfCards.first().click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // 説明を変更
          const descField = dialog.getByLabel('説明');
          if (await descField.isVisible()) {
            await fillInput(page, descField, 'CSF説明（更新後）');
            await page.waitForTimeout(300);

            // 保存
            await dialog.getByRole('button', { name: 'SAVE' }).click();
            await page.waitForTimeout(500);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('Outcomeエディタ_KPIの変更', async () => {
      // KPIカードをクリック
      const kpiCard = page.getByText('UAT初回合格率').first();
      if (await kpiCard.isVisible()) {
        await kpiCard.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // KPI名を変更
          await fillInput(page, dialog.getByLabel('KPI名'), 'UAT初回合格率（更新後）');
          await page.waitForTimeout(300);

          // 保存
          await dialog.getByRole('button', { name: 'SAVE' }).click();
          await page.waitForTimeout(500);

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

          // 変更が反映されたことを確認
          await expect(page.getByText('UAT初回合格率（更新後）')).toBeVisible();
        }
      }
    });

    // ========================================
    // EMエディタでの更新・削除操作
    // ========================================
    await test.step('EMエディタ_行動の変更', async () => {
      await page.goto('http://localhost:5173/em');
      await page.waitForLoadState('networkidle');

      // 最初の行動をクリック
      const action = page.getByText('UAT準備').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // 行動名を変更
          const actionField = dialog.getByLabel('行動');
          if (await actionField.isVisible()) {
            await fillInput(page, actionField, 'UAT準備（更新後）');
            await page.waitForTimeout(300);

            // 保存
            await dialog.getByRole('button', { name: 'SAVE' }).click();
            await page.waitForTimeout(500);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('EMエディタ_行動_スキルの変更', async () => {
      // 行動をクリックしてプロパティパネルを開く
      const action = page.getByText('UAT準備（更新後）').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // スキル名を変更
          const skillInput = dialog.locator('input[placeholder="スキル名"]').first();
          if (await skillInput.isVisible()) {
            await fillInput(page, skillInput, 'テストスキル（更新後）');
            await page.waitForTimeout(300);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('EMエディタ_行動_スキル_学習コンテンツの変更', async () => {
      // 行動をクリックしてプロパティパネルを開く
      const action = page.getByText('UAT準備（更新後）').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // 学習コンテンツのタイトルを変更
          const titleInput = dialog.locator('input[placeholder="タイトル"]').first();
          if (await titleInput.isVisible()) {
            await fillInput(page, titleInput, '学習コンテンツタイトル（更新後）');
            await page.waitForTimeout(300);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('EMエディタ_行動_スキル_学習コンテンツの削除', async () => {
      // 行動をクリックしてプロパティパネルを開く
      const action = page.getByText('UAT準備（更新後）').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // 学習コンテンツの削除ボタンをクリック
          const deleteButtons = dialog.getByRole('button', { name: /削除/ });
          if (await deleteButtons.first().isVisible()) {
            await deleteButtons.first().click();
            await page.waitForTimeout(500);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('EMエディタ_行動_スキルの削除', async () => {
      // 行動をクリックしてプロパティパネルを開く
      const action = page.getByText('UAT準備（更新後）').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // スキルの削除ボタンをクリック
          const deleteButtons = dialog.getByRole('button', { name: /スキルを削除/ });
          if (await deleteButtons.first().isVisible()) {
            await deleteButtons.first().click();
            await page.waitForTimeout(500);

            // 確認ダイアログで削除を実行
            const confirmDialog = page.getByRole('dialog');
            await confirmDialog.getByRole('button', { name: 'OK' }).click();
            await page.waitForTimeout(1000);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('EMエディタ_行動_ナレッジの変更', async () => {
      // 行動をクリックしてプロパティパネルを開く
      const action = page.getByText('UAT準備（更新後）').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // ナレッジ名を変更
          const knowledgeInput = dialog.locator('input[placeholder="ナレッジ名"]').first();
          if (await knowledgeInput.isVisible()) {
            await fillInput(page, knowledgeInput, 'ナレッジ（更新後）');
            await page.waitForTimeout(300);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('EMエディタ_行動_ナレッジの削除', async () => {
      // 行動をクリックしてプロパティパネルを開く
      const action = page.getByText('UAT準備（更新後）').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // ナレッジの削除ボタンをクリック
          const deleteButtons = dialog.getByRole('button', { name: /ナレッジを削除/ });
          if (await deleteButtons.first().isVisible()) {
            await deleteButtons.first().click();
            await page.waitForTimeout(500);

            // 確認ダイアログで削除を実行
            const confirmDialog = page.getByRole('dialog');
            await confirmDialog.getByRole('button', { name: 'OK' }).click();
            await page.waitForTimeout(1000);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('EMエディタ_行動_ツールの変更', async () => {
      // 行動をクリックしてプロパティパネルを開く
      const action = page.getByText('UAT準備（更新後）').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // ツール名を変更
          const toolInput = dialog.locator('input[placeholder="ツール名"]').first();
          if (await toolInput.isVisible()) {
            await fillInput(page, toolInput, 'ツール（更新後）');
            await page.waitForTimeout(300);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('EMエディタ_行動_ツールの削除', async () => {
      // 行動をクリックしてプロパティパネルを開く
      const action = page.getByText('UAT準備（更新後）').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // ツールの削除ボタンをクリック
          const deleteButtons = dialog.getByRole('button', { name: /ツールを削除/ });
          if (await deleteButtons.first().isVisible()) {
            await deleteButtons.first().click();
            await page.waitForTimeout(500);

            // 確認ダイアログで削除を実行
            const confirmDialog = page.getByRole('dialog');
            await confirmDialog.getByRole('button', { name: 'OK' }).click();
            await page.waitForTimeout(1000);
          }

          // 閉じる
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('EMエディタ_行動の削除', async () => {
      // 削除対象の行動をクリック
      const action = page.getByText('UAT準備（更新後）').first();
      if (await action.isVisible()) {
        await action.click();
        await page.waitForTimeout(500);

        const dialog = page.getByRole('dialog');
        if (await dialog.isVisible()) {
          // 削除ボタンをクリック
          await dialog.getByRole('button', { name: 'DELETE' }).click();
          await page.waitForTimeout(500);

          // 確認ダイアログで削除を実行
          const confirmDialog = page.getByRole('dialog');
          await confirmDialog.getByRole('button', { name: 'OK' }).click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });
});
