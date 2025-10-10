import { MarkerType } from '@xyflow/react';
// レーンの高さとY座標マッピング
export const LANE_HEIGHT = 200;
export const LANE_SPACING = 20;
export const LANE_WIDTH = 1400;
// レーンのY座標を計算
export function getLaneY(laneIndex) {
    return laneIndex * (LANE_HEIGHT + LANE_SPACING);
}
// SBP DSLをReact Flow形式に変換
export function dslToFlow(sbp, cjm) {
    const nodes = [];
    const edges = [];
    // レーンのインデックスマップを作成
    const laneIndexMap = new Map();
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
                // SBPにすでに存在するか確認（readonly タスクは id が action.id と一致）
                const existingTask = sbp.tasks.find((task) => task.id === action.id && task.lane === cjmLane.id && task.readonly);
                // readonly タスクは常に cjm-readonly- プレフィックス付きで生成
                // 位置情報は既存タスクがあればそれを使用、なければ自動計算
                const position = existingTask?.position || { x: 100 + index * 220, y: 50 };
                nodes.push({
                    id: `cjm-readonly-${action.id}`,
                    type: 'taskNode',
                    parentId: `lane:${cjmLane.id}`,
                    extent: 'parent',
                    position,
                    data: {
                        task: {
                            id: action.id,
                            lane: cjmLane.id,
                            name: action.name,
                            readonly: true,
                        },
                        isReadonly: true,
                        isSelected: false,
                    },
                });
            });
        }
    }
    // SBPタスクをノードに変換（readonly タスクは CJM から生成するのでスキップ）
    sbp.tasks.forEach((task) => {
        // readonly タスクはスキップ（CJM アクションから生成される）
        if (task.readonly) {
            return;
        }
        // 位置情報がDSLにあればそれを使用、なければ自動計算
        let position;
        if (task.position) {
            position = task.position;
        }
        else {
            const existingNodes = nodes.filter((n) => n.type === 'taskNode' && n.data.task?.lane === task.lane);
            const xPosition = 100 + existingNodes.length * 220;
            position = { x: xPosition, y: 50 };
        }
        nodes.push({
            id: task.id,
            type: 'taskNode',
            parentId: `lane:${task.lane}`,
            extent: 'parent',
            position,
            data: {
                task,
                isReadonly: false,
                isSelected: false,
            },
        });
    });
    // connections配列からエッジを生成
    if (sbp.connections) {
        sbp.connections.forEach((conn) => {
            // CJM action ID の場合は cjm-readonly- プレフィックスを追加
            const sourceId = conn.source.startsWith('cjm:action:')
                ? `cjm-readonly-${conn.source}`
                : conn.source;
            const targetId = conn.target.startsWith('cjm:action:')
                ? `cjm-readonly-${conn.target}`
                : conn.target;
            edges.push({
                id: `${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                sourceHandle: conn.sourceHandle,
                targetHandle: conn.targetHandle,
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
    return { nodes, edges };
}
// React FlowのノードからSBP DSLを更新
export function updateDslFromFlow(sbp, nodes, edges) {
    // タスクノードを通常タスクとCJM readonlyノードに分けて処理
    const normalTaskNodes = nodes.filter((node) => node.type === 'taskNode' && !node.id.startsWith('cjm-readonly-'));
    const cjmReadonlyNodes = nodes.filter((node) => node.type === 'taskNode' && node.id.startsWith('cjm-readonly-'));
    // 通常タスク（位置情報を保存）
    const normalTasks = normalTaskNodes.map((node) => {
        const task = node.data.task;
        return {
            ...task,
            position: node.position,
        };
    });
    // CJM readonlyノード（位置情報を保存）
    const cjmReadonlyTasks = cjmReadonlyNodes.map((node) => {
        const task = node.data.task;
        return {
            ...task,
            position: node.position,
        };
    });
    // 通常タスクとCJM readonlyタスクをマージ
    const updatedTasks = [...normalTasks, ...cjmReadonlyTasks];
    // エッジから接続情報を生成
    // CJM readonly ノード（cjm-readonly-*）のIDをDSL用ID（cjm:action:*）に変換
    const connections = edges.map((edge) => ({
        source: edge.source.startsWith('cjm-readonly-')
            ? edge.source.replace('cjm-readonly-', '')
            : edge.source,
        target: edge.target.startsWith('cjm-readonly-')
            ? edge.target.replace('cjm-readonly-', '')
            : edge.target,
        sourceHandle: (edge.sourceHandle || 'right'),
        targetHandle: (edge.targetHandle || 'left'),
    }));
    return {
        ...sbp,
        tasks: updatedTasks,
        connections,
    };
}
export function getLaneBackgrounds(lanes) {
    return lanes.map((lane, index) => ({
        id: lane.id,
        name: lane.name,
        y: getLaneY(index),
        height: LANE_HEIGHT,
        kind: lane.kind,
    }));
}
// レーンのY座標範囲内にノードを制約
export function constrainToLane(nodePosition, laneId, lanes) {
    const laneIndex = lanes.findIndex((lane) => lane.id === laneId);
    if (laneIndex === -1)
        return nodePosition;
    const laneY = getLaneY(laneIndex);
    const minY = laneY + 10;
    const maxY = laneY + LANE_HEIGHT - 60;
    return {
        x: nodePosition.x,
        y: Math.max(minY, Math.min(maxY, nodePosition.y)),
    };
}
