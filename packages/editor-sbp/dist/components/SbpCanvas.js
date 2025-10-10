import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, MarkerType, } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { TaskNode } from './TaskNode';
import { LaneNode } from './LaneNode';
import { AlignmentGuides } from './AlignmentGuides';
import { useAlignmentGuides } from '../hooks/useAlignmentGuides';
import { dslToFlow, updateDslFromFlow, LANE_HEIGHT, LANE_SPACING, LANE_WIDTH } from '../utils/flowConverter';
const nodeTypes = {
    taskNode: TaskNode,
    laneNode: LaneNode,
};
export function SbpCanvas({ sbp, cjm, selectedTask, selectedLane: _selectedLane, onTaskSelect, onLaneSelect, onLaneAdd, onLaneReorder, onSbpUpdate, }) {
    // DSLからReact Flow形式に変換
    const initialFlow = useMemo(() => dslToFlow(sbp, cjm), [sbp, cjm]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    // アライメントガイド用のフック
    const { alignmentLines, onDragStart, onDrag, onDragEnd } = useAlignmentGuides();
    // レーンの更新と削除の検出
    useEffect(() => {
        const dslLaneIds = new Set(sbp.lanes.map((l) => `lane:${l.id}`));
        setNodes((currentNodes) => {
            // 既存のレーンノードIDを取得
            const existingLaneNodeIds = new Set(currentNodes.filter((n) => n.type === 'laneNode').map((n) => n.id));
            // 削除されたレーンをフィルタリングし、既存レーンを更新
            const updatedNodes = currentNodes
                .filter((node) => {
                // レーンノードの場合、DSLに存在するかチェック
                if (node.type === 'laneNode') {
                    return dslLaneIds.has(node.id);
                }
                return true; // タスクノードは保持
            })
                .map((node) => {
                // 残ったレーンノードのデータを更新
                if (node.type === 'laneNode') {
                    const laneId = node.id.replace('lane:', '');
                    const updatedLane = sbp.lanes.find((l) => l.id === laneId);
                    if (updatedLane) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                lane: updatedLane,
                            },
                        };
                    }
                }
                return node;
            });
            // 新しく追加されたレーンを検出してノードを作成
            const newLaneNodes = [];
            sbp.lanes.forEach((lane, index) => {
                const nodeId = `lane:${lane.id}`;
                if (!existingLaneNodeIds.has(nodeId)) {
                    newLaneNodes.push({
                        id: nodeId,
                        type: 'laneNode',
                        position: { x: 0, y: index * (LANE_HEIGHT + LANE_SPACING) },
                        style: {
                            width: LANE_WIDTH,
                            height: LANE_HEIGHT,
                        },
                        data: { lane },
                        draggable: true,
                        selectable: true,
                    });
                }
            });
            return [...updatedNodes, ...newLaneNodes];
        });
    }, [sbp.lanes, setNodes]);
    // タスク削除の検出と処理
    useEffect(() => {
        const dslTaskIds = new Set(sbp.tasks.map((t) => t.id));
        // CJMアクションのIDも含める（CJM接続のエッジ削除を防ぐため）
        if (cjm) {
            cjm.actions.forEach((action) => dslTaskIds.add(action.id));
        }
        setNodes((currentNodes) => {
            const taskNodesToKeep = currentNodes.filter((node) => {
                if (node.type === 'taskNode' && !node.id.startsWith('cjm-readonly-')) {
                    return dslTaskIds.has(node.id);
                }
                return true; // レーンノードとCJM readonlyノードは保持
            });
            return taskNodesToKeep;
        });
        // タスク削除に伴うエッジの削除
        setEdges((currentEdges) => {
            return currentEdges.filter((edge) => {
                // CJM readonlyノード（cjm-readonly-*）のIDをDSL形式に変換してチェック
                const sourceId = edge.source.startsWith('cjm-readonly-')
                    ? edge.source.replace('cjm-readonly-', '')
                    : edge.source;
                const targetId = edge.target.startsWith('cjm-readonly-')
                    ? edge.target.replace('cjm-readonly-', '')
                    : edge.target;
                return dslTaskIds.has(sourceId) && dslTaskIds.has(targetId);
            });
        });
    }, [sbp.tasks, cjm, setNodes, setEdges]);
    // CJM readonlyノードの同期（CJMアクションの追加・削除・更新）
    useEffect(() => {
        if (!cjm) {
            // cjmがnullの場合、すべてのCJM readonlyノードを削除
            setNodes((currentNodes) => currentNodes.filter((node) => !node.id.startsWith('cjm-readonly-')));
            return;
        }
        const cjmLane = sbp.lanes.find((lane) => lane.kind === 'cjm');
        if (!cjmLane) {
            // CJMレーンが存在しない場合、CJM readonlyノードを削除
            setNodes((currentNodes) => currentNodes.filter((node) => !node.id.startsWith('cjm-readonly-')));
            return;
        }
        // CJMアクションをソート（phaseの順序、同じphase内ではactionsの順序）
        const sortedActions = cjm.actions.slice().sort((a, b) => {
            const phaseAIndex = cjm.phases.findIndex((p) => p.id === a.phase);
            const phaseBIndex = cjm.phases.findIndex((p) => p.id === b.phase);
            if (phaseAIndex !== phaseBIndex) {
                return phaseAIndex - phaseBIndex;
            }
            const aIndex = cjm.actions.findIndex((act) => act.id === a.id);
            const bIndex = cjm.actions.findIndex((act) => act.id === b.id);
            return aIndex - bIndex;
        });
        setNodes((currentNodes) => {
            // 既存のCJM readonlyノードのIDを収集
            const existingCjmNodeIds = new Set(currentNodes
                .filter((n) => n.id.startsWith('cjm-readonly-'))
                .map((n) => n.id));
            // CJMアクションから期待されるノードIDを収集
            const expectedCjmNodeIds = new Set();
            const newNodes = [];
            sortedActions.forEach((action, index) => {
                const nodeId = `cjm-readonly-${action.id}`;
                expectedCjmNodeIds.add(nodeId);
                // SBPにすでに対応するタスクが存在するかチェック
                const existingTask = sbp.tasks.find((task) => task.source_id === action.id && task.lane === cjmLane.id);
                if (!existingTask && !existingCjmNodeIds.has(nodeId)) {
                    // 新しいCJM readonlyノードを作成
                    newNodes.push({
                        id: nodeId,
                        type: 'taskNode',
                        parentId: `lane:${cjmLane.id}`,
                        extent: 'parent',
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
            // 不要になったCJM readonlyノードを削除し、新しいノードを追加
            return [
                ...currentNodes.filter((node) => {
                    if (node.id.startsWith('cjm-readonly-')) {
                        return expectedCjmNodeIds.has(node.id);
                    }
                    return true;
                }),
                ...newNodes,
            ];
        });
    }, [cjm, sbp.lanes, sbp.tasks, setNodes]);
    // ノード選択時の処理
    const handleNodeClick = useCallback((_event, node) => {
        // レーンノードの場合
        if (node.type === 'laneNode') {
            const lane = node.data.lane;
            onLaneSelect(lane);
            setSelectedEdgeId(null);
            return;
        }
        // タスクノードの場合
        const task = node.data.task;
        if (!node.data.isReadonly) {
            onTaskSelect(task);
            setSelectedEdgeId(null);
        }
    }, [onTaskSelect, onLaneSelect]);
    // エッジ選択時の処理
    const handleEdgeClick = useCallback((_event, edge) => {
        setSelectedEdgeId(edge.id);
    }, []);
    // タスクノードのドラッグ開始時の処理
    const handleNodeDragStart = useCallback((_event, node) => {
        // タスクノード（CJM readonlyノード含む）の場合、アライメントガイドを有効化
        if (node.type === 'taskNode') {
            onDragStart();
        }
    }, [onDragStart]);
    // タスクノードのドラッグ中の処理
    const handleNodeDrag = useCallback((_event, node) => {
        // タスクノード（CJM readonlyノード含む）の場合、アライメントガイドとスナップを計算
        if (node.type === 'taskNode') {
            const snapPosition = onDrag(node, nodes);
            // スナップ位置があれば、ノード位置を更新（ドラッグ中にリアルタイムで吸着）
            if (snapPosition) {
                setNodes((currentNodes) => currentNodes.map((n) => n.id === node.id ? { ...n, position: snapPosition } : n));
            }
        }
    }, [onDrag, nodes, setNodes]);
    // レーンのドラッグ終了時の処理
    const handleNodeDragStop = useCallback((_event, node) => {
        // タスクノード（CJM readonlyノード含む）の場合は最終的なスナップ位置を確定してからガイドを非表示
        if (node.type === 'taskNode') {
            // まずガイドを非表示にする
            onDragEnd();
            // その後、最終スナップ位置を確定（ガイド非表示後なので破線は表示されない）
            setTimeout(() => {
                setNodes((currentNodes) => {
                    const currentNode = currentNodes.find((n) => n.id === node.id);
                    if (!currentNode)
                        return currentNodes;
                    // 現在位置でスナップ判定（onDragを使わずに直接計算）
                    const otherNodes = currentNodes.filter((n) => n.id !== node.id && n.type === 'taskNode');
                    let snapX = null;
                    let snapY = null;
                    const nodeCenterX = currentNode.position.x + (currentNode.measured?.width || 0) / 2;
                    const nodeCenterY = currentNode.position.y + (currentNode.measured?.height || 0) / 2;
                    otherNodes.forEach((other) => {
                        const otherCenterX = other.position.x + (other.measured?.width || 0) / 2;
                        const otherCenterY = other.position.y + (other.measured?.height || 0) / 2;
                        const SNAP_THRESHOLD = 10;
                        if (Math.abs(nodeCenterY - otherCenterY) < SNAP_THRESHOLD) {
                            snapY = otherCenterY - (currentNode.measured?.height || 0) / 2;
                        }
                        if (Math.abs(nodeCenterX - otherCenterX) < SNAP_THRESHOLD) {
                            snapX = otherCenterX - (currentNode.measured?.width || 0) / 2;
                        }
                    });
                    if (snapX !== null || snapY !== null) {
                        return currentNodes.map((n) => n.id === node.id
                            ? {
                                ...n,
                                position: {
                                    x: snapX ?? n.position.x,
                                    y: snapY ?? n.position.y,
                                },
                            }
                            : n);
                    }
                    return currentNodes;
                });
            }, 0);
            return;
        }
        // レーンノードの場合のみ処理
        if (node.type !== 'laneNode')
            return;
        // 現在のレーンのY座標からインデックスを推定
        const laneNodes = nodes.filter((n) => n.type === 'laneNode');
        const sortedLaneNodes = [...laneNodes].sort((a, b) => a.position.y - b.position.y);
        // 新しいレーン順序を構築
        const newLaneOrder = sortedLaneNodes
            .map((laneNode) => {
            const laneData = laneNode.data.lane;
            return sbp.lanes.find((l) => l.id === laneData.id);
        })
            .filter((lane) => lane !== undefined);
        // レーンの順序が変わった場合のみ更新
        if (JSON.stringify(newLaneOrder.map((l) => l.id)) !== JSON.stringify(sbp.lanes.map((l) => l.id))) {
            onLaneReorder(newLaneOrder);
        }
    }, [nodes, sbp.lanes, onLaneReorder, onDrag, onDragEnd, setNodes]);
    // エッジ接続時の処理
    const handleConnect = useCallback((connection) => {
        console.log('🔗 handleConnect called:', {
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
        });
        const newEdge = {
            ...connection,
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
        };
        setEdges((eds) => addEdge(newEdge, eds));
        // CJM readonlyノードとの接続の場合、source_idを自動設定
        console.log('🔍 Checking CJM connection:', {
            isCjmSource: connection.source?.startsWith('cjm-readonly-'),
            isCjmTarget: connection.target?.startsWith('cjm-readonly-'),
        });
        // CJM → タスク、またはタスク → CJMの両方向に対応
        const cjmNodeId = connection.source?.startsWith('cjm-readonly-')
            ? connection.source
            : connection.target?.startsWith('cjm-readonly-')
                ? connection.target
                : null;
        const taskNodeId = connection.source?.startsWith('cjm-readonly-')
            ? connection.target
            : connection.target?.startsWith('cjm-readonly-')
                ? connection.source
                : null;
        if (cjmNodeId && taskNodeId) {
            // CJMアクションIDを抽出（cjm-readonly-{actionId}形式）
            const cjmActionId = cjmNodeId.replace('cjm-readonly-', '');
            console.log('✅ CJM connection detected:', {
                cjmActionId,
                taskNodeId,
            });
            // ノード更新とDSL更新を一度に実行
            setTimeout(() => {
                setNodes((currentNodes) => {
                    const updatedNodes = currentNodes.map((node) => {
                        if (node.id === taskNodeId) {
                            const nodeData = node.data;
                            const task = nodeData.task;
                            // タスクのsource_idを更新
                            const updatedTask = {
                                ...task,
                                source_id: cjmActionId,
                            };
                            return {
                                ...node,
                                data: {
                                    ...nodeData,
                                    task: updatedTask,
                                },
                            };
                        }
                        return node;
                    });
                    // DSL更新を同じタイミングで実行
                    setEdges((currentEdges) => {
                        const updatedDsl = updateDslFromFlow(sbp, updatedNodes, currentEdges);
                        onSbpUpdate(updatedDsl);
                        return currentEdges;
                    });
                    return updatedNodes;
                });
            }, 100); // タイミングを調整
        }
    }, [setEdges, setNodes, sbp, onSbpUpdate]);
    // ノード変更時にDSLを更新
    const handleNodesChange = useCallback((changes) => {
        onNodesChange(changes);
        // ノード位置変更などをDSLに反映
        setTimeout(() => {
            setNodes((currentNodes) => {
                setEdges((currentEdges) => {
                    // レーンノードの削除を検出
                    const currentLaneNodeIds = new Set(currentNodes.filter((n) => n.type === 'laneNode').map((n) => n.id.replace('lane:', '')));
                    const updatedLanes = sbp.lanes.filter((lane) => currentLaneNodeIds.has(lane.id));
                    // タスクの更新
                    const updatedDsl = updateDslFromFlow(sbp, currentNodes, currentEdges);
                    // レーン削除も反映
                    onSbpUpdate({
                        ...updatedDsl,
                        lanes: updatedLanes,
                    });
                    return currentEdges;
                });
                return currentNodes;
            });
        }, 0);
    }, [onNodesChange, setNodes, setEdges, sbp, onSbpUpdate]);
    // エッジ変更時にDSLを更新
    const handleEdgesChange = useCallback((changes) => {
        onEdgesChange(changes);
        // エッジ削除などをDSLに反映
        setTimeout(() => {
            setNodes((currentNodes) => {
                setEdges((currentEdges) => {
                    const updatedDsl = updateDslFromFlow(sbp, currentNodes, currentEdges);
                    onSbpUpdate(updatedDsl);
                    return currentEdges;
                });
                return currentNodes;
            });
        }, 0);
    }, [onEdgesChange, setNodes, setEdges, sbp, onSbpUpdate]);
    // エッジ削除ハンドラー（Deleteキー）
    const handleEdgesDelete = useCallback((edgesToDelete) => {
        setEdges((currentEdges) => {
            const deletedEdgeIds = new Set(edgesToDelete.map((e) => e.id));
            const updatedEdges = currentEdges.filter((e) => !deletedEdgeIds.has(e.id));
            // DSLを更新
            setNodes((currentNodes) => {
                const updatedDsl = updateDslFromFlow(sbp, currentNodes, updatedEdges);
                onSbpUpdate(updatedDsl);
                return currentNodes;
            });
            return updatedEdges;
        });
    }, [setEdges, setNodes, sbp, onSbpUpdate]);
    // 選択状態をノードデータに反映
    const nodesWithSelection = useMemo(() => {
        return nodes.map((node) => ({
            ...node,
            data: {
                ...node.data,
                isSelected: selectedTask?.id === node.data.task?.id,
            },
        }));
    }, [nodes, selectedTask]);
    // エッジの選択状態を反映
    const edgesWithSelection = useMemo(() => {
        return edges.map((edge) => ({
            ...edge,
            style: {
                ...edge.style,
                stroke: edge.id === selectedEdgeId ? '#1976d2' : '#555',
                strokeWidth: edge.id === selectedEdgeId ? 3 : 2,
            },
            markerStart: edge.markerStart && typeof edge.markerStart === 'object' ? {
                ...edge.markerStart,
                color: edge.id === selectedEdgeId ? '#1976d2' : '#555',
            } : edge.markerStart,
            markerEnd: edge.markerEnd && typeof edge.markerEnd === 'object' ? {
                ...edge.markerEnd,
                color: edge.id === selectedEdgeId ? '#1976d2' : '#555',
            } : edge.markerEnd,
        }));
    }, [edges, selectedEdgeId]);
    return (_jsxs(Box, { sx: { width: '100%', height: '100%', position: 'relative' }, children: [_jsx(Box, { sx: { position: 'absolute', top: 16, left: 16, zIndex: 10 }, children: _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: onLaneAdd, children: "\u30EC\u30FC\u30F3\u8FFD\u52A0" }) }), _jsxs(ReactFlow, { nodes: nodesWithSelection, edges: edgesWithSelection, onNodesChange: handleNodesChange, onEdgesChange: handleEdgesChange, onEdgesDelete: handleEdgesDelete, onConnect: handleConnect, onNodeClick: handleNodeClick, onEdgeClick: handleEdgeClick, onNodeDragStart: handleNodeDragStart, onNodeDrag: handleNodeDrag, onNodeDragStop: handleNodeDragStop, nodeTypes: nodeTypes, deleteKeyCode: ['Delete', 'Backspace'], fitView: true, minZoom: 0.5, maxZoom: 1.5, children: [_jsx(Background, { color: "#aaa", gap: 16 }), _jsx(Controls, {}), _jsx(MiniMap, { nodeColor: (node) => {
                            return node.data.isReadonly ? '#ccc' : '#1976d2';
                        }, style: { backgroundColor: '#f5f5f5' } })] }), _jsx(AlignmentGuides, { lines: alignmentLines, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight })] }));
}
