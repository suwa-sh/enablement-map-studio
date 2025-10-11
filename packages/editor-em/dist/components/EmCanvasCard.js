import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useCallback } from 'react';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import { Add, Star } from '@mui/icons-material';
import { generateId } from '@enablement-map-studio/dsl';
export function EmCanvasCard({ em, outcome, sbp, cjm, onEmUpdate, onActionSelect, }) {
    const [selectedPhaseId, setSelectedPhaseId] = useState(null);
    const [selectedLaneId, setSelectedLaneId] = useState(null);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [csfFilterActive, setCsfFilterActive] = useState(false);
    // Get CSF task
    const csfTask = useMemo(() => {
        if (!outcome || !sbp)
            return null;
        return sbp.tasks.find((task) => task.id === outcome.primary_csf.source_id);
    }, [outcome, sbp]);
    // When CSF filter is active, derive related elements
    const csfRelatedData = useMemo(() => {
        if (!csfFilterActive || !csfTask || !cjm || !em || !sbp)
            return null;
        // Get CJM action linked to CSF task
        const cjmAction = csfTask.readonly
            ? cjm.actions.find((a) => a.id === csfTask.id)
            : cjm.actions.find((a) => a.id === csfTask.source_id);
        // Get all tasks connected to CSF task via edges (graph traversal)
        // IMPORTANT: connections are stored in sbp.connections array, not task.connections
        const connectedTaskIds = new Set([csfTask.id]);
        const toVisit = [csfTask.id];
        const visited = new Set();
        while (toVisit.length > 0) {
            const currentTaskId = toVisit.pop();
            if (visited.has(currentTaskId))
                continue;
            visited.add(currentTaskId);
            // Find all connections where this task is the source (outgoing edges)
            sbp.connections.forEach((conn) => {
                if (conn.source === currentTaskId && !connectedTaskIds.has(conn.target)) {
                    connectedTaskIds.add(conn.target);
                    toVisit.push(conn.target);
                }
            });
            // Find all connections where this task is the target (incoming edges)
            sbp.connections.forEach((conn) => {
                if (conn.target === currentTaskId && !connectedTaskIds.has(conn.source)) {
                    connectedTaskIds.add(conn.source);
                    toVisit.push(conn.source);
                }
            });
        }
        // Get EM actions linked to any connected task
        const emActionIds = new Set();
        connectedTaskIds.forEach((taskId) => {
            em.actions.forEach((action) => {
                if (action.source_id === taskId) {
                    emActionIds.add(action.id);
                }
            });
        });
        return {
            cjmActionId: cjmAction?.id || null,
            cjmPhaseId: cjmAction?.phase || null,
            connectedTaskIds, // All tasks connected to CSF task
            emActionIds,
        };
    }, [csfFilterActive, csfTask, cjm, em, sbp]);
    // Get visible lanes based on CSF filter and lane selection
    const visibleLanes = useMemo(() => {
        if (!sbp)
            return [];
        let lanes = sbp.lanes;
        // CSF filter: show all lanes (don't filter by lane)
        // Users want to see all lanes, not just the CSF task's lane
        // Lane selection: show only selected lane
        if (selectedLaneId) {
            lanes = lanes.filter((lane) => lane.id === selectedLaneId);
        }
        return lanes;
    }, [sbp, selectedLaneId]);
    // Get visible tasks based on CSF filter and phase selection
    const visibleTaskIds = useMemo(() => {
        if (!sbp)
            return null; // null means show all
        let taskIds = [];
        // CSF filter: show all tasks connected to CSF task
        if (csfRelatedData) {
            taskIds = Array.from(csfRelatedData.connectedTaskIds);
        }
        // Phase filter: show tasks for selected phase
        else if (selectedPhaseId && cjm) {
            const phaseActions = cjm.actions
                .filter((action) => action.phase === selectedPhaseId)
                .map((action) => action.id);
            taskIds = sbp.tasks
                .filter((task) => {
                if (task.readonly && phaseActions.includes(task.id))
                    return true;
                if (task.source_id && phaseActions.includes(task.source_id))
                    return true;
                return false;
            })
                .map((task) => task.id);
        }
        // No filter: show all
        else {
            return null;
        }
        return new Set(taskIds);
    }, [sbp, cjm, csfRelatedData, selectedPhaseId]);
    // Get EM actions filtered by CSF or selected task
    const visibleActions = useMemo(() => {
        if (!em)
            return [];
        // CSF filter: show only CSF-related actions
        if (csfRelatedData) {
            return em.actions.filter((action) => csfRelatedData.emActionIds.has(action.id));
        }
        // Task selection: show actions for selected task
        if (selectedTaskId) {
            return em.actions.filter((action) => action.source_id === selectedTaskId);
        }
        // No filter: show all
        return em.actions;
    }, [em, csfRelatedData, selectedTaskId]);
    const handleAddAction = useCallback(() => {
        if (!em || !sbp)
            return;
        const firstTask = sbp.tasks.find((t) => !t.readonly);
        if (!firstTask)
            return;
        const newAction = {
            id: generateId('em', 'action'),
            name: '新しい行動',
            source_id: selectedTaskId || firstTask.id,
        };
        const updatedEm = {
            ...em,
            actions: [...em.actions, newAction],
        };
        onEmUpdate(updatedEm);
        onActionSelect(newAction);
    }, [em, sbp, selectedTaskId, onEmUpdate, onActionSelect]);
    if (!outcome || !sbp || !cjm) {
        return (_jsx(Box, { sx: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Typography, { color: "text.secondary", children: "Outcome\u3001SBP\u3001CJM \u30C7\u30FC\u30BF\u3092\u30ED\u30FC\u30C9\u3057\u3066\u304F\u3060\u3055\u3044" }) }));
    }
    return (_jsxs(Box, { sx: { height: '100%', bgcolor: 'grey.50', p: 3, overflow: 'auto' }, children: [_jsx(Box, { sx: { mb: 3 }, children: _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleAddAction, children: "\u5FC5\u8981\u306A\u884C\u52D5\u3092\u8FFD\u52A0" }) }), _jsxs(Stack, { spacing: 2, sx: { mb: 3 }, children: [_jsxs(Paper, { elevation: 2, sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u6C42\u3081\u308B\u6210\u679C" }), _jsxs(Stack, { direction: "row", spacing: 2, sx: { mb: 2 }, children: [_jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "KGI" }), _jsx(Typography, { variant: "body2", children: outcome.kgi.name })] }), _jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "CSF" }), _jsx(Typography, { variant: "body2", children: outcome.primary_csf.rationale || '（未設定）' })] }), _jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "KPI" }), _jsxs(Typography, { variant: "body2", children: [outcome.primary_kpi.name, ": ", outcome.primary_kpi.target.toLocaleString('ja-JP', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2,
                                                    }), outcome.primary_kpi.unit && outcome.primary_kpi.unit] })] })] }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { onClick: () => setCsfFilterActive(false), variant: !csfFilterActive ? 'contained' : 'outlined', size: "small", children: "\u3059\u3079\u3066" }), _jsx(Button, { onClick: () => setCsfFilterActive(true), variant: csfFilterActive ? 'contained' : 'outlined', size: "small", children: "CSF" })] })] }), _jsxs(Paper, { elevation: 2, sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "CJM\u30D5\u30A7\u30FC\u30BA" }), _jsxs(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", useFlexGap: true, children: [_jsx(Button, { onClick: () => setSelectedPhaseId(null), variant: selectedPhaseId === null ? 'contained' : 'outlined', size: "small", children: "\u3059\u3079\u3066" }), cjm.phases.map((phase) => (_jsx(Button, { onClick: () => setSelectedPhaseId(phase.id), variant: selectedPhaseId === phase.id ? 'contained' : 'outlined', size: "small", children: phase.name }, phase.id)))] })] })] }), _jsxs(Paper, { elevation: 2, sx: { p: 2, mb: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "SBP" }), _jsxs(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", useFlexGap: true, sx: { mb: 2 }, children: [_jsx(Button, { onClick: () => setSelectedLaneId(null), variant: selectedLaneId === null ? 'contained' : 'outlined', size: "small", children: "\u3059\u3079\u3066" }), sbp.lanes.map((lane) => (_jsx(Button, { onClick: () => setSelectedLaneId(lane.id), variant: selectedLaneId === lane.id ? 'contained' : 'outlined', size: "small", children: lane.name }, lane.id)))] }), _jsx(Stack, { spacing: 2, children: visibleLanes.map((lane) => {
                            const laneTasks = sbp.tasks
                                .filter((task) => task.lane === lane.id)
                                .filter((task) => visibleTaskIds === null || visibleTaskIds.has(task.id));
                            // Skip empty lanes when filtering
                            if (visibleTaskIds !== null && laneTasks.length === 0)
                                return null;
                            return (_jsxs(Box, { sx: { p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "medium", sx: { mb: 2 }, children: lane.name }), _jsx(Box, { sx: { display: 'flex', gap: 2, overflowX: 'auto' }, children: laneTasks.map((task) => {
                                            const isCsfTask = task.id === outcome.primary_csf.source_id;
                                            const isSelected = task.id === selectedTaskId;
                                            return (_jsxs(Paper, { elevation: isCsfTask ? 4 : isSelected ? 3 : 1, onClick: () => setSelectedTaskId(task.id === selectedTaskId ? null : task.id), sx: {
                                                    minWidth: 200,
                                                    flexShrink: 0,
                                                    p: 2,
                                                    border: 2,
                                                    borderColor: isCsfTask ? 'success.main' : isSelected ? 'primary.main' : 'grey.300',
                                                    bgcolor: isCsfTask ? 'success.lighter' : isSelected ? 'primary.lighter' : 'white',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        bgcolor: isCsfTask ? 'success.light' : isSelected ? 'primary.light' : 'grey.100',
                                                    },
                                                }, children: [_jsx(Typography, { variant: "body2", fontWeight: "medium", children: task.name }), isCsfTask && (_jsx(Chip, { icon: _jsx(Star, {}), label: "CSF", size: "small", color: "success", sx: { mt: 1 } }))] }, task.id));
                                        }) })] }, lane.id));
                        }) })] }), _jsxs(Paper, { elevation: 2, sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u5FC5\u8981\u306A\u884C\u52D5" }), visibleActions.length === 0 ? (_jsx(Typography, { color: "text.secondary", sx: { textAlign: 'center', py: 3 }, children: "\u884C\u52D5\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u300C\u5FC5\u8981\u306A\u884C\u52D5\u3092\u8FFD\u52A0\u300D\u30DC\u30BF\u30F3\u304B\u3089\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })) : (_jsx(Box, { sx: { display: 'flex', gap: 2, flexWrap: 'wrap' }, children: visibleActions.map((action) => {
                            const sourceTask = sbp.tasks.find((t) => t.id === action.source_id);
                            return (_jsxs(Paper, { elevation: 1, onClick: (e) => {
                                    e.stopPropagation();
                                    onActionSelect(action);
                                }, sx: {
                                    minWidth: 200,
                                    p: 2,
                                    cursor: 'pointer',
                                    border: 1,
                                    borderColor: 'divider',
                                    '&:hover': {
                                        bgcolor: 'grey.100',
                                        borderColor: 'primary.main',
                                    },
                                }, children: [_jsx(Typography, { variant: "body2", fontWeight: "medium", sx: { mb: 1 }, children: action.name }), sourceTask && (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["\u30BF\u30B9\u30AF: ", sourceTask.name] }))] }, action.id));
                        }) }))] })] }));
}
