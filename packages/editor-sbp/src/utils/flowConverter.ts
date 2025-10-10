import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { SbpDsl, SbpTask, SbpLane, CjmDsl } from '@enablement-map-studio/dsl';

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

// レーンの高さとY座標マッピング
export const LANE_HEIGHT = 200;
export const LANE_SPACING = 20;
export const LANE_WIDTH = 1400;

// レーンのY座標を計算
export function getLaneY(laneIndex: number): number {
  return laneIndex * (LANE_HEIGHT + LANE_SPACING);
}

// SBP DSLをReact Flow形式に変換
export function dslToFlow(sbp: SbpDsl, cjm: CjmDsl | null): FlowData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // レーンのインデックスマップを作成
  const laneIndexMap = new Map<string, number>();
  sbp.lanes.forEach((lane, index) => {
    laneIndexMap.set(lane.id, index);
  });

  // レーンをグループノードとして追加
  sbp.lanes.forEach((lane, index) => {
    nodes.push({
      id: `lane:${lane.id}`,
      type: 'laneNode',
      position: { x: 0, y: getLaneY(index) },
      style: {
        width: LANE_WIDTH,
        height: LANE_HEIGHT,
      },
      data: {
        lane,
      },
      draggable: true,
      selectable: true,
    });
  });

  // CJMアクションからreadonlyタスクを生成
  if (cjm) {
    const cjmLane = sbp.lanes.find((lane) => lane.kind === 'cjm');
    if (cjmLane) {
      // CJMアクションをphases配列の順序、同じphase内ではactions配列の順序でソート
      const sortedActions = cjm.actions.slice().sort((a, b) => {
        const phaseAIndex = cjm.phases.findIndex((p) => p.id === a.phase);
        const phaseBIndex = cjm.phases.findIndex((p) => p.id === b.phase);

        // phase配列のインデックスで比較
        if (phaseAIndex !== phaseBIndex) {
          return phaseAIndex - phaseBIndex;
        }

        // 同じphase内ではactions配列のインデックスで比較
        const aIndex = cjm.actions.findIndex((act) => act.id === a.id);
        const bIndex = cjm.actions.findIndex((act) => act.id === b.id);
        return aIndex - bIndex;
      });

      sortedActions.forEach((action, index) => {
        // SBPにすでに存在するか確認
        const existingTask = sbp.tasks.find(
          (task) => task.source_id === action.id && task.lane === cjmLane.id
        );

        if (!existingTask) {
          // 新しいreadonlyタスクとしてノードを作成（DSLには追加しない、表示のみ）
          nodes.push({
            id: `cjm-readonly-${action.id}`,
            type: 'taskNode',
            parentId: `lane:${cjmLane.id}`,
            extent: 'parent' as const,
            position: { x: 100 + index * 220, y: 50 },
            data: {
              task: {
                id: action.id,
                lane: cjmLane.id,
                name: action.name,
                source_id: action.id,
                readonly: true,
              },
              isReadonly: true,
              isSelected: false,
            },
          });
        }
      });
    }
  }

  // SBPタスクをノードに変換
  sbp.tasks.forEach((task) => {
    const existingNodes = nodes.filter(
      (n) => n.type === 'taskNode' && (n.data as any).task?.lane === task.lane
    );
    const xPosition = 100 + existingNodes.length * 220;

    nodes.push({
      id: task.id,
      type: 'taskNode',
      parentId: `lane:${task.lane}`,
      extent: 'parent' as const,
      position: { x: xPosition, y: 50 },
      data: {
        task,
        isReadonly: task.readonly || false,
        isSelected: false,
      },
    });

    // link_toからエッジを生成
    if (task.link_to) {
      task.link_to.forEach((targetId) => {
        edges.push({
          id: `${task.id}-${targetId}`,
          source: task.id,
          target: targetId,
          type: 'smoothstep',
          animated: false,
          style: {
            stroke: '#555',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#555',
          },
        });
      });
    }
  });

  return { nodes, edges };
}

// React FlowのノードからSBP DSLを更新
export function updateDslFromFlow(
  sbp: SbpDsl,
  nodes: Node[],
  edges: Edge[]
): SbpDsl {
  // タスクノードのみフィルタリング（レーンノードとreadonlyタスクを除外）
  const taskNodes = nodes.filter(
    (node) => node.type === 'taskNode' && !(node.data as any).isReadonly
  );

  // ノードからタスクを更新（parentIdは無視、DSLのlaneをそのまま使用）
  const updatedTasks: SbpTask[] = taskNodes.map((node) => {
    const task = (node.data as any).task as SbpTask;

    // このタスクから出ているエッジを集める
    const outgoingEdges = edges.filter((edge) => edge.source === node.id);
    const linkTo = outgoingEdges.map((edge) => edge.target);

    return {
      ...task,
      link_to: linkTo.length > 0 ? linkTo : undefined,
    };
  });

  return {
    ...sbp,
    tasks: updatedTasks,
  };
}

// スイムレーン背景用のデータを生成
export interface LaneBackground {
  id: string;
  name: string;
  y: number;
  height: number;
  kind: 'cjm' | 'human' | 'team' | 'system';
}

export function getLaneBackgrounds(lanes: SbpLane[]): LaneBackground[] {
  return lanes.map((lane, index) => ({
    id: lane.id,
    name: lane.name,
    y: getLaneY(index),
    height: LANE_HEIGHT,
    kind: lane.kind,
  }));
}

// レーンのY座標範囲内にノードを制約
export function constrainToLane(
  nodePosition: { x: number; y: number },
  laneId: string,
  lanes: SbpLane[]
): { x: number; y: number } {
  const laneIndex = lanes.findIndex((lane) => lane.id === laneId);
  if (laneIndex === -1) return nodePosition;

  const laneY = getLaneY(laneIndex);
  const minY = laneY + 10;
  const maxY = laneY + LANE_HEIGHT - 60;

  return {
    x: nodePosition.x,
    y: Math.max(minY, Math.min(maxY, nodePosition.y)),
  };
}
