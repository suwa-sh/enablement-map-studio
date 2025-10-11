import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, } from '@xyflow/react';
import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { generateId } from '@enablement-map-studio/dsl';
import { buildHierarchyFlow } from '../utils/buildHierarchyFlow';
// Custom node types
const nodeTypes = {
// We'll define custom nodes later
};
export function EmCanvasNew({ em, outcome, sbp, cjm, onEmUpdate, onActionSelect, }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    // Build hierarchy visualization
    useEffect(() => {
        if (!outcome || !sbp || !cjm)
            return;
        const { nodes: hierarchyNodes, edges: hierarchyEdges } = buildHierarchyFlow(em, outcome, sbp, cjm);
        setNodes(hierarchyNodes);
        setEdges(hierarchyEdges);
    }, [em, outcome, sbp, cjm, setNodes, setEdges]);
    // Add new EM Action
    const handleAddAction = useCallback(() => {
        if (!sbp)
            return;
        // Find first available SBP task
        const firstTask = sbp.tasks.find((t) => !t.readonly);
        if (!firstTask)
            return;
        const newAction = {
            id: generateId('em', 'action'),
            name: '新しい行動',
            source_id: firstTask.id,
        };
        const updatedEm = {
            ...em,
            actions: [...em.actions, newAction],
        };
        onEmUpdate(updatedEm);
        onActionSelect(newAction);
    }, [em, sbp, onEmUpdate, onActionSelect]);
    // Handle node click
    const handleNodeClick = useCallback((_event, node) => {
        if (node.type === 'emAction') {
            const action = em.actions.find((a) => a.id === node.id);
            if (action) {
                onActionSelect(action);
            }
        }
    }, [em.actions, onActionSelect]);
    if (!outcome || !sbp || !cjm) {
        return (_jsx(Box, { sx: {
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50',
            }, children: _jsx(Box, { sx: { textAlign: 'center', color: 'text.secondary' }, children: _jsx("p", { children: "\u968E\u5C64\u3092\u8868\u793A\u3059\u308B\u306B\u306F\u3001CJM\u3001SBP\u3001Outcome\u30C7\u30FC\u30BF\u304C\u5FC5\u8981\u3067\u3059\u3002" }) }) }));
    }
    return (_jsxs(Box, { sx: { height: '100%', position: 'relative' }, children: [_jsx(Box, { sx: { position: 'absolute', top: 16, right: 16, zIndex: 10 }, children: _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleAddAction, children: "\u884C\u52D5\u3092\u8FFD\u52A0" }) }), _jsxs(ReactFlow, { nodes: nodes, edges: edges, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onNodeClick: handleNodeClick, nodeTypes: nodeTypes, fitView: true, minZoom: 0.1, maxZoom: 2, children: [_jsx(Background, {}), _jsx(Controls, {}), _jsx(MiniMap, {})] })] }));
}
