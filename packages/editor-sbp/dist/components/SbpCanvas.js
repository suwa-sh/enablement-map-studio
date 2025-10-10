import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, MarkerType, } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box } from '@mui/material';
import { TaskNode } from './TaskNode';
import { LaneBackground } from './LaneBackground';
import { dslToFlow, updateDslFromFlow, getLaneBackgrounds } from '../utils/flowConverter';
const nodeTypes = {
    taskNode: TaskNode,
};
export function SbpCanvas({ sbp, cjm, selectedTask, onTaskSelect, onSbpUpdate, }) {
    // DSLからReact Flow形式に変換
    const initialFlow = useMemo(() => dslToFlow(sbp, cjm), [sbp, cjm]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
    // スイムレーン背景データ
    const laneBackgrounds = useMemo(() => getLaneBackgrounds(sbp.lanes), [sbp.lanes]);
    // ノード選択時の処理
    const handleNodeClick = useCallback((_event, node) => {
        const task = node.data.task;
        if (!node.data.isReadonly) {
            onTaskSelect(task);
        }
    }, [onTaskSelect]);
    // エッジ接続時の処理
    const handleConnect = useCallback((connection) => {
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
    }, [setEdges]);
    // ノード変更時にDSLを更新
    const handleNodesChange = useCallback((changes) => {
        onNodesChange(changes);
        // ノード位置変更などをDSLに反映
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
    return (_jsx(Box, { sx: { width: '100%', height: '100%', position: 'relative' }, children: _jsxs(ReactFlow, { nodes: nodesWithSelection, edges: edges, onNodesChange: handleNodesChange, onEdgesChange: handleEdgesChange, onConnect: handleConnect, onNodeClick: handleNodeClick, nodeTypes: nodeTypes, fitView: true, minZoom: 0.5, maxZoom: 1.5, children: [_jsx(Background, { color: "#aaa", gap: 16 }), _jsx(LaneBackground, { lanes: laneBackgrounds }), _jsx(Controls, {}), _jsx(MiniMap, { nodeColor: (node) => {
                        return node.data.isReadonly ? '#ccc' : '#1976d2';
                    }, style: { backgroundColor: '#f5f5f5' } })] }) }));
}
