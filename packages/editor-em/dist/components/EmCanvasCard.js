import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Paper, Typography, Button, Stack, Chip, Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, } from '@mui/material';
import { Add, Star, ExpandMore, FilterList } from '@mui/icons-material';
import { generateId } from '@enablement-map-studio/dsl';
export function EmCanvasCard({ em, outcome, sbp, cjm, onEmUpdate, onActionSelect, onFilterChange, }) {
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
    // Get visible tasks based on CSF filter, phase, and lane (Phase AND Lane)
    const visibleTaskIds = useMemo(() => {
        if (!sbp)
            return null; // null means show all
        // CSF filter: show all tasks connected to CSF task (exclusive)
        if (csfRelatedData) {
            return csfRelatedData.connectedTaskIds;
        }
        // If no filter is active, return null (show all)
        if (!selectedPhaseId && !selectedLaneId) {
            return null;
        }
        // Phase filter only: Apply graph traversal to show all connected tasks
        if (selectedPhaseId && !selectedLaneId && cjm) {
            const phaseActions = cjm.actions
                .filter((action) => action.phase === selectedPhaseId)
                .map((action) => action.id);
            const initialTasks = sbp.tasks.filter((task) => {
                if (task.readonly && phaseActions.includes(task.id))
                    return true;
                if (task.source_id && phaseActions.includes(task.source_id))
                    return true;
                return false;
            });
            // Graph traversal: expand to include all connected tasks
            const connectedTaskIds = new Set(initialTasks.map((task) => task.id));
            const toVisit = [...connectedTaskIds];
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
            return connectedTaskIds;
        }
        // Lane filter only: Show only tasks in selected lane (no graph traversal)
        if (selectedLaneId && !selectedPhaseId) {
            const laneTasks = sbp.tasks.filter((task) => task.lane === selectedLaneId);
            return new Set(laneTasks.map((task) => task.id));
        }
        // Phase AND Lane: Apply graph traversal for Phase, then filter by Lane
        if (selectedPhaseId && selectedLaneId && cjm) {
            const phaseActions = cjm.actions
                .filter((action) => action.phase === selectedPhaseId)
                .map((action) => action.id);
            const initialTasks = sbp.tasks.filter((task) => {
                if (task.readonly && phaseActions.includes(task.id))
                    return true;
                if (task.source_id && phaseActions.includes(task.source_id))
                    return true;
                return false;
            });
            // Graph traversal: expand to include all connected tasks
            const connectedTaskIds = new Set(initialTasks.map((task) => task.id));
            const toVisit = [...connectedTaskIds];
            const visited = new Set();
            while (toVisit.length > 0) {
                const currentTaskId = toVisit.pop();
                if (visited.has(currentTaskId))
                    continue;
                visited.add(currentTaskId);
                sbp.connections.forEach((conn) => {
                    if (conn.source === currentTaskId && !connectedTaskIds.has(conn.target)) {
                        connectedTaskIds.add(conn.target);
                        toVisit.push(conn.target);
                    }
                });
                sbp.connections.forEach((conn) => {
                    if (conn.target === currentTaskId && !connectedTaskIds.has(conn.source)) {
                        connectedTaskIds.add(conn.source);
                        toVisit.push(conn.source);
                    }
                });
            }
            // Filter by lane after graph traversal
            const laneFilteredTaskIds = new Set();
            connectedTaskIds.forEach((taskId) => {
                const task = sbp.tasks.find((t) => t.id === taskId);
                if (task && task.lane === selectedLaneId) {
                    laneFilteredTaskIds.add(taskId);
                }
            });
            return laneFilteredTaskIds;
        }
        return null;
    }, [sbp, cjm, csfRelatedData, selectedPhaseId, selectedLaneId]);
    // Get EM actions filtered by CSF, phase/lane, or selected task
    const visibleActions = useMemo(() => {
        if (!em)
            return [];
        // CSF filter: show only CSF-related actions
        if (csfRelatedData) {
            return em.actions.filter((action) => csfRelatedData.emActionIds.has(action.id));
        }
        // Phase/Lane filter: show actions linked to visible tasks (Phase AND Lane)
        if (visibleTaskIds) {
            return em.actions.filter((action) => visibleTaskIds.has(action.source_id));
        }
        // Task selection: show actions for selected task
        if (selectedTaskId) {
            return em.actions.filter((action) => action.source_id === selectedTaskId);
        }
        // No filter: show all
        return em.actions;
    }, [em, csfRelatedData, visibleTaskIds, selectedTaskId]);
    // Calculate visible CJM actions count for display
    const visibleCjmActionsCount = useMemo(() => {
        if (!cjm)
            return 0;
        if (csfRelatedData && csfRelatedData.cjmActionId) {
            return cjm.actions.filter((a) => a.id === csfRelatedData.cjmActionId).length;
        }
        if (selectedPhaseId) {
            return cjm.actions.filter((a) => a.phase === selectedPhaseId).length;
        }
        return cjm.actions.length;
    }, [cjm, csfRelatedData, selectedPhaseId]);
    // Notify parent of filter changes
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(visibleTaskIds);
        }
    }, [visibleTaskIds, onFilterChange]);
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
    return (_jsxs(Box, { sx: { height: '100%', bgcolor: 'grey.50', p: 3, overflow: 'auto' }, children: [_jsxs(Stack, { direction: "row", spacing: 2, alignItems: "flex-start", justifyContent: "space-between", sx: {
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    bgcolor: 'grey.50',
                    pt: 0,
                    pb: 2,
                }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleAddAction, children: "\u5FC5\u8981\u306A\u884C\u52D5\u3092\u8FFD\u52A0" }), _jsxs(Accordion, { sx: { width: '50%', maxWidth: 800 }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMore, {}), children: _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(FilterList, { fontSize: "small" }), _jsx(Typography, { variant: "button", children: "\u30D5\u30A3\u30EB\u30BF\u30FC" })] }) }), _jsx(AccordionDetails, { children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Stack, { direction: "row", spacing: 2, alignItems: "flex-start", children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: csfFilterActive, onChange: (e) => {
                                                            setCsfFilterActive(e.target.checked);
                                                            if (e.target.checked) {
                                                                // Clear other filters when CSF is activated
                                                                setSelectedPhaseId(null);
                                                                setSelectedLaneId(null);
                                                            }
                                                        } }), label: "CSF\u3067\u7D5E\u308A\u8FBC\u3080", sx: { minWidth: 150 } }), _jsxs(FormControl, { sx: { flex: 1, minWidth: 200 }, disabled: csfFilterActive, children: [_jsx(InputLabel, { id: "phase-filter-label", children: "\u9867\u5BA2\u306E\u610F\u601D\u6C7A\u5B9A\u30D7\u30ED\u30BB\u30B9" }), _jsxs(Select, { labelId: "phase-filter-label", value: selectedPhaseId || '', onChange: (e) => setSelectedPhaseId(e.target.value || null), label: "\u9867\u5BA2\u306E\u610F\u601D\u6C7A\u5B9A\u30D7\u30ED\u30BB\u30B9", children: [_jsx(MenuItem, { value: "", children: "\u3059\u3079\u3066" }), cjm.phases.map((phase) => (_jsx(MenuItem, { value: phase.id, children: phase.name }, phase.id)))] })] }), _jsxs(FormControl, { sx: { flex: 1, minWidth: 200 }, disabled: csfFilterActive, children: [_jsx(InputLabel, { id: "lane-filter-label", children: "\u7D44\u7E54\u306E\u4FA1\u5024\u63D0\u4F9B\u30D7\u30ED\u30BB\u30B9" }), _jsxs(Select, { labelId: "lane-filter-label", value: selectedLaneId || '', onChange: (e) => setSelectedLaneId(e.target.value || null), label: "\u7D44\u7E54\u306E\u4FA1\u5024\u63D0\u4F9B\u30D7\u30ED\u30BB\u30B9", children: [_jsx(MenuItem, { value: "", children: "\u3059\u3079\u3066" }), sbp.lanes.slice(1).map((lane) => (_jsx(MenuItem, { value: lane.id, children: lane.name }, lane.id)))] })] })] }), (csfFilterActive || selectedPhaseId || selectedLaneId) && (_jsx(Paper, { elevation: 1, sx: { p: 2, bgcolor: 'grey.50', border: 1, borderColor: 'grey.300' }, children: _jsxs(Typography, { variant: "body2", color: "text.primary", children: ["\u30D5\u30A3\u30EB\u30BF\u4E2D: \u9867\u5BA2\u306E\u610F\u601D\u6C7A\u5B9A\u30D7\u30ED\u30BB\u30B9 ", visibleCjmActionsCount, "\u4EF6 \u2192 \u7D44\u7E54\u306E\u4FA1\u5024\u63D0\u4F9B\u30D7\u30ED\u30BB\u30B9 ", visibleTaskIds?.size || sbp.tasks.length, "\u4EF6 \u2192 \u5FC5\u8981\u306A\u884C\u52D5 ", visibleActions.length, "\u4EF6"] }) }))] }) })] })] }), _jsxs(Stack, { direction: "row", spacing: 2, sx: { mb: 2 }, children: [_jsxs(Paper, { elevation: 2, sx: { p: 2, flex: 1 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u7D44\u7E54\u306E\u6C42\u3081\u308B\u6210\u679C" }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "KGI" }), _jsx(Typography, { variant: "body2", children: outcome.kgi.name })] }), _jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "CSF" }), _jsx(Typography, { variant: "body2", children: outcome.primary_csf.rationale || '（未設定）' })] }), _jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "KPI" }), _jsxs(Typography, { variant: "body2", children: [outcome.primary_kpi.name, ": ", outcome.primary_kpi.target.toLocaleString('ja-JP', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2,
                                                    }), outcome.primary_kpi.unit && outcome.primary_kpi.unit] })] })] })] }), cjm.persona && (_jsxs(Paper, { elevation: 2, sx: { p: 2, flex: 1 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u9867\u5BA2" }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "\u30DA\u30EB\u30BD\u30CA" }), _jsx(Typography, { variant: "body2", children: cjm.persona.name })] }), cjm.persona.description && (_jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "\u8AAC\u660E" }), _jsx(Typography, { variant: "body2", sx: { whiteSpace: 'pre-wrap' }, children: cjm.persona.description })] }))] })] }))] }), _jsxs(Paper, { elevation: 2, sx: { p: 2, mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u9867\u5BA2\u306E\u610F\u601D\u6C7A\u5B9A\u30D7\u30ED\u30BB\u30B9" }), _jsxs(Box, { sx: { p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }, children: [_jsxs(Typography, { variant: "subtitle1", fontWeight: "medium", sx: { mb: 2 }, children: ["\u30A2\u30AF\u30B7\u30E7\u30F3 (", visibleCjmActionsCount, "\u4EF6)"] }), _jsx(Box, { sx: { display: 'flex', gap: 2, overflowX: 'auto' }, children: cjm.actions
                                    .filter((action) => {
                                    // CSF filter: show only CSF-related action
                                    if (csfRelatedData) {
                                        return action.id === csfRelatedData.cjmActionId;
                                    }
                                    // Phase filter
                                    return selectedPhaseId === null || action.phase === selectedPhaseId;
                                })
                                    .map((action) => (_jsx(Paper, { elevation: 1, sx: {
                                        minWidth: 200,
                                        flexShrink: 0,
                                        p: 2,
                                        border: 1,
                                        borderColor: 'grey.300',
                                        bgcolor: 'white',
                                    }, children: _jsx(Typography, { variant: "body2", fontWeight: "medium", children: action.name }) }, action.id))) })] })] }), _jsxs(Paper, { elevation: 2, sx: { p: 2, mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u7D44\u7E54\u306E\u4FA1\u5024\u63D0\u4F9B\u30D7\u30ED\u30BB\u30B9" }), _jsx(Stack, { spacing: 2, children: visibleLanes
                            .filter((lane) => lane.kind !== 'cjm') // Skip CJM lane
                            .map((lane) => {
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
                                                    borderColor: isCsfTask ? 'primary.main' : isSelected ? 'primary.main' : 'grey.300',
                                                    bgcolor: isCsfTask ? 'primary.lighter' : isSelected ? 'primary.lighter' : 'white',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        bgcolor: isCsfTask ? 'primary.light' : isSelected ? 'primary.light' : 'grey.100',
                                                    },
                                                }, children: [_jsx(Typography, { variant: "body2", fontWeight: "medium", children: task.name }), isCsfTask && (_jsx(Chip, { icon: _jsx(Star, {}), label: "CSF", size: "small", color: "primary", sx: { mt: 1 } }))] }, task.id));
                                        }) })] }, lane.id));
                        }) })] }), _jsxs(Paper, { elevation: 2, sx: { p: 2, mb: 3 }, children: [_jsxs(Typography, { variant: "h6", sx: { mb: 2 }, children: ["\u5FC5\u8981\u306A\u884C\u52D5 (", visibleActions.length, "\u4EF6)"] }), visibleActions.length === 0 ? (_jsx(Typography, { color: "text.secondary", sx: { textAlign: 'center', py: 3 }, children: "\u884C\u52D5\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u300C\u5FC5\u8981\u306A\u884C\u52D5\u3092\u8FFD\u52A0\u300D\u30DC\u30BF\u30F3\u304B\u3089\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })) : (_jsx(Box, { sx: { display: 'flex', gap: 2, flexWrap: 'wrap' }, children: visibleActions.map((action) => {
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
