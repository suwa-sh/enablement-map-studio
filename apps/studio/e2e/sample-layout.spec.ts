import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

type Pair = readonly [source: string, target: string];

interface SampleLayout {
  fileName: string;
  taskCount: number;
  cjmLinks: readonly Pair[];
  mainLinks: readonly Pair[];
}

const samples: readonly SampleLayout[] = [
  {
    fileName: 'ai-dev-org-standardization.yaml',
    taskCount: 17,
    cjmLinks: [
      ['cjm-readonly-cjm:action:wait-and-see', 'sbp:task:hear-barriers'],
      ['cjm-readonly-cjm:action:try-personally', 'sbp:task:design-metrics'],
      ['cjm-readonly-cjm:action:follow-golden-path', 'sbp:task:build-tvp'],
      ['cjm-readonly-cjm:action:learn-by-pairing', 'sbp:task:pairing-retro'],
      ['cjm-readonly-cjm:action:daily-use', 'sbp:task:review-ai-output'],
      ['cjm-readonly-cjm:action:feedback-improvement', 'sbp:task:promote-local-improvements'],
    ],
    mainLinks: [
      ['sbp:task:hear-barriers', 'sbp:task:design-metrics'],
      ['sbp:task:design-metrics', 'sbp:task:build-tvp'],
      ['sbp:task:build-tvp', 'sbp:task:pairing-retro'],
      ['sbp:task:pairing-retro', 'sbp:task:review-ai-output'],
      ['sbp:task:review-ai-output', 'sbp:task:promote-local-improvements'],
    ],
  },
  {
    fileName: 'enterprise-ai-reach-value.yaml',
    taskCount: 16,
    cjmLinks: [
      ['cjm-readonly-cjm:action:licensed-unclear', 'sbp:task:setup-controls'],
      ['cjm-readonly-cjm:action:generic-trial', 'sbp:task:split-reach-value'],
      ['cjm-readonly-cjm:action:blocked-by-rules', 'sbp:task:define-dept-guardrails'],
      ['cjm-readonly-cjm:action:focus-usecases', 'sbp:task:select-usecases'],
      ['cjm-readonly-cjm:action:work-within-guardrails', 'sbp:task:coach-guardrail-use'],
      ['cjm-readonly-cjm:action:confirm-value', 'sbp:task:measure-value'],
      ['cjm-readonly-cjm:action:redefine-role', 'sbp:task:redefine-roles'],
    ],
    mainLinks: [
      ['sbp:task:setup-controls', 'sbp:task:split-reach-value'],
      ['sbp:task:split-reach-value', 'sbp:task:define-dept-guardrails'],
      ['sbp:task:define-dept-guardrails', 'sbp:task:select-usecases'],
      ['sbp:task:select-usecases', 'sbp:task:coach-guardrail-use'],
      ['sbp:task:coach-guardrail-use', 'sbp:task:measure-value'],
      ['sbp:task:measure-value', 'sbp:task:redefine-roles'],
    ],
  },
  {
    fileName: 'ai-operating-model-redesign.yaml',
    taskCount: 20,
    cjmLinks: [
      ['cjm-readonly-cjm:action:select-process', 'sbp:task:select-process'],
      ['cjm-readonly-cjm:action:run-experiment', 'sbp:task:run-experiment'],
      ['cjm-readonly-cjm:action:redesign-operating-model', 'sbp:task:assign-owner'],
      ['cjm-readonly-cjm:action:measure-outcome', 'sbp:task:define-metric'],
      ['cjm-readonly-cjm:action:evaluate-evidence', 'sbp:task:evaluate-evidence'],
      ['cjm-readonly-cjm:action:update-decision', 'sbp:task:update-decision'],
    ],
    mainLinks: [
      ['sbp:task:select-process', 'sbp:task:run-experiment'],
      ['sbp:task:run-experiment', 'sbp:task:assign-owner'],
      ['sbp:task:assign-owner', 'sbp:task:redesign-five-processes'],
      ['sbp:task:redesign-five-processes', 'sbp:task:define-metric'],
      ['sbp:task:define-metric', 'sbp:task:confirm-measurement-route'],
      ['sbp:task:confirm-measurement-route', 'sbp:task:evaluate-evidence'],
      ['sbp:task:evaluate-evidence', 'sbp:task:update-decision'],
    ],
  },
];

test.use({ viewport: { width: 1800, height: 1100 } });

for (const sample of samples) {
  test(`${sample.fileName}のSBPレイアウトが公開サンプル規約を満たす`, async ({ page }) => {
    const yaml = readFileSync(path.resolve('docs/samples', sample.fileName), 'utf8');

    await page.goto('/');
    await page.evaluate(
      ({ content, fileName }) => {
        (window as any).showOpenFilePicker = async () => [
          {
            name: fileName,
            getFile: async () => new File([content], fileName, { type: 'text/yaml' }),
          },
        ];
      },
      { content: yaml, fileName: sample.fileName }
    );

    await page.getByRole('button', { name: /Open File/i }).click();
    await expect(page.getByRole('alert')).toContainText(`${sample.fileName} を読み込みました`);
    await page.goto('/sbp');
    await expect(page.locator('.react-flow__node-taskNode')).toHaveCount(sample.taskCount);
    await page.waitForTimeout(500);

    const result = await page.evaluate(({ cjmLinks, mainLinks }) => {
      const nodeElements = Array.from(
        document.querySelectorAll<HTMLElement>('.react-flow__node-taskNode')
      );
      const nodeById = new Map(
        nodeElements.map((element) => [element.dataset.id ?? '', element])
      );
      const viewportStyle =
        document.querySelector<HTMLElement>('.react-flow__viewport')?.style.transform ?? '';
      const scale = Number(viewportStyle.match(/scale\(([^)]+)\)/)?.[1] ?? 1);

      const missingEdges = [...cjmLinks, ...mainLinks]
        .filter(([source, target]) => {
          return !document.querySelector(
            `.react-flow__edge[aria-label="Edge from ${source} to ${target}"]`
          );
        })
        .map(([source, target]) => `${source} -> ${target}`);

      const handleErrors: string[] = [];
      const checkHandles = (
        links: readonly Pair[],
        sourceSide: 'bottom' | 'right',
        targetSide: 'top' | 'left'
      ) => {
        for (const [source, target] of links) {
          const edge = document.querySelector<SVGGElement>(
            `.react-flow__edge[aria-label="Edge from ${source} to ${target}"]`
          );
          const edgePath = edge?.querySelector<SVGPathElement>('.react-flow__edge-path');
          const sourceRect = nodeById.get(source)?.getBoundingClientRect();
          const targetRect = nodeById.get(target)?.getBoundingClientRect();
          const matrix = edgePath?.getScreenCTM();
          if (!edgePath || !sourceRect || !targetRect || !matrix) continue;

          const start = edgePath.getPointAtLength(0);
          const end = edgePath.getPointAtLength(edgePath.getTotalLength());
          const screenStart = new DOMPoint(start.x, start.y).matrixTransform(matrix);
          const screenEnd = new DOMPoint(end.x, end.y).matrixTransform(matrix);
          const expectedStart =
            sourceSide === 'bottom'
              ? { x: sourceRect.left + sourceRect.width / 2, y: sourceRect.bottom }
              : { x: sourceRect.right, y: sourceRect.top + sourceRect.height / 2 };
          const expectedEnd =
            targetSide === 'top'
              ? { x: targetRect.left + targetRect.width / 2, y: targetRect.top }
              : { x: targetRect.left, y: targetRect.top + targetRect.height / 2 };
          const error = Math.max(
            Math.abs(screenStart.x - expectedStart.x),
            Math.abs(screenStart.y - expectedStart.y),
            Math.abs(screenEnd.x - expectedEnd.x),
            Math.abs(screenEnd.y - expectedEnd.y)
          );
          if (error > 3) handleErrors.push(`${source} -> ${target}: ${error}`);
        }
      };

      checkHandles(cjmLinks, 'bottom', 'top');
      checkHandles(mainLinks, 'right', 'left');

      const centerDifferences = cjmLinks.map(([source, target]) => {
        const sourceRect = nodeById.get(source)?.getBoundingClientRect();
        const targetRect = nodeById.get(target)?.getBoundingClientRect();
        if (!sourceRect || !targetRect) return Number.POSITIVE_INFINITY;
        return Math.abs(
          sourceRect.left + sourceRect.width / 2 - (targetRect.left + targetRect.width / 2)
        );
      });

      const mainGaps = mainLinks.map(([source, target]) => {
        const sourceRect = nodeById.get(source)?.getBoundingClientRect();
        const targetRect = nodeById.get(target)?.getBoundingClientRect();
        if (!sourceRect || !targetRect) return Number.NEGATIVE_INFINITY;
        return (targetRect.left - sourceRect.right) / scale;
      });

      const overlaps: string[] = [];
      for (let i = 0; i < nodeElements.length; i += 1) {
        const first = nodeElements[i];
        const firstRect = first.getBoundingClientRect();
        for (let j = i + 1; j < nodeElements.length; j += 1) {
          const second = nodeElements[j];
          const secondRect = second.getBoundingClientRect();
          const overlapsHorizontally =
            firstRect.left < secondRect.right && firstRect.right > secondRect.left;
          const overlapsVertically =
            firstRect.top < secondRect.bottom && firstRect.bottom > secondRect.top;
          if (overlapsHorizontally && overlapsVertically) {
            overlaps.push(`${first.dataset.id} / ${second.dataset.id}`);
          }
        }
      }

      const crossings = new Set<string>();
      const edges = Array.from(document.querySelectorAll<SVGGElement>('.react-flow__edge'));
      for (const edge of edges) {
        const label = edge.getAttribute('aria-label') ?? '';
        const match = label.match(/^Edge from (.+) to (.+)$/);
        const path = edge.querySelector<SVGPathElement>('.react-flow__edge-path');
        if (!match || !path) continue;

        const [, source, target] = match;
        const matrix = path.getScreenCTM();
        if (!matrix) continue;

        const length = path.getTotalLength();
        const sampleCount = Math.max(20, Math.ceil(length / 10));
        for (let index = 1; index < sampleCount; index += 1) {
          const point = path.getPointAtLength((length * index) / sampleCount);
          const screenPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
          for (const node of nodeElements) {
            const nodeId = node.dataset.id ?? '';
            if (nodeId === source || nodeId === target) continue;
            const rect = node.getBoundingClientRect();
            if (
              screenPoint.x > rect.left + 2 &&
              screenPoint.x < rect.right - 2 &&
              screenPoint.y > rect.top + 2 &&
              screenPoint.y < rect.bottom - 2
            ) {
              crossings.add(`${source} -> ${target} / ${nodeId}`);
            }
          }
        }
      }

      return {
        missingEdges,
        handleErrors,
        maxCenterDifference: Math.max(...centerDifferences),
        minMainGap: Math.min(...mainGaps),
        overlaps,
        crossings: [...crossings],
      };
    }, sample);

    expect(result.missingEdges).toEqual([]);
    expect(result.handleErrors).toEqual([]);
    expect(result.maxCenterDifference).toBeLessThanOrEqual(5);
    expect(result.minMainGap).toBeGreaterThanOrEqual(200);
    expect(result.overlaps).toEqual([]);
    expect(result.crossings).toEqual([]);
  });
}
