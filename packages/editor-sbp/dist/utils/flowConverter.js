import { MarkerType } from '@xyflow/react';
// レーンの高さとY座標マッピング
const LANE_HEIGHT = 200;
const LANE_SPACING = 20;
// レーンのY座標を計算
function getLaneY(laneIndex) {
    return laneIndex * (LANE_HEIGHT + LANE_SPACING) + 50;
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
    // CJMアクションからreadonlyタスクを生成
    if (cjm) {
        const cjmLane = sbp.lanes.find((lane) => lane.kind === 'cjm');
        if (cjmLane) {
            const laneY = getLaneY(laneIndexMap.get(cjmLane.id) || 0);
            cjm.actions.forEach((action, index) => {
                // SBPにすでに存在するか確認
                const existingTask = sbp.tasks.find((task) => task.source_id === action.id && task.lane === cjmLane.id);
                if (!existingTask) {
                    // 新しいreadonlyタスクとしてノードを作成（DSLには追加しない、表示のみ）
                    nodes.push({
                        id: `cjm-readonly-${action.id}`,
                        type: 'taskNode',
                        position: { x: 100 + index * 220, y: laneY },
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
        const laneY = getLaneY(laneIndexMap.get(task.lane) || 0);
        const existingNodes = nodes.filter((n) => n.data.task?.lane === task.lane);
        const xPosition = 100 + existingNodes.length * 220;
        nodes.push({
            id: task.id,
            type: 'taskNode',
            position: { x: xPosition, y: laneY },
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
export function updateDslFromFlow(sbp, nodes, edges) {
    // readonlyタスク（CJM由来）を除外
    const editableNodes = nodes.filter((node) => !node.data.isReadonly);
    // ノードからタスクを更新（位置情報は保持しない）
    const updatedTasks = editableNodes.map((node) => {
        const task = node.data.task;
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
