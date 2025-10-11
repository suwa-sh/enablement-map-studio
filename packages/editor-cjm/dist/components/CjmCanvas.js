import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, } from '@mui/material';
import { Add, DragIndicator } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
function SortablePhaseCell({ phase, colSpan, isSelected, onSelect }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id: phase.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (_jsx(TableCell, { ref: setNodeRef, style: style, colSpan: colSpan, sx: {
            borderLeft: 1,
            borderColor: 'divider',
            bgcolor: isSelected ? 'primary.light' : 'grey.100',
            fontWeight: 'bold',
            p: 3,
            color: 'text.primary',
        }, children: _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Box, { ...attributes, ...listeners, sx: { cursor: 'grab', display: 'flex', alignItems: 'center' }, children: _jsx(DragIndicator, { fontSize: "small" }) }), _jsx(Typography, { onClick: onSelect, sx: { cursor: 'pointer', flex: 1 }, children: phase.name })] }) }));
}
function SortableActionCell({ action, isSelected, onSelect }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id: action.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (_jsxs(Box, { ref: setNodeRef, style: style, sx: {
            p: 1.5,
            borderRadius: 1,
            bgcolor: isSelected ? 'primary.lighter' : 'transparent',
            '&:hover': { bgcolor: 'grey.100' },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
        }, children: [_jsx(Box, { ...attributes, ...listeners, sx: {
                    cursor: isDragging ? 'grabbing' : 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.secondary',
                    '&:active': {
                        cursor: 'grabbing',
                    },
                }, children: _jsx(DragIndicator, { fontSize: "small" }) }), _jsx(Typography, { variant: "body2", color: "text.primary", onClick: onSelect, sx: {
                    flex: 1,
                    cursor: 'pointer',
                }, children: action.name })] }));
}
const EmotionCurve = ({ phases, actions }) => {
    const chartData = useMemo(() => {
        const phaseOrder = new Map(phases.map((p, idx) => [p.id, idx]));
        const sortedActions = [...actions].sort((a, b) => {
            const phaseA = phaseOrder.get(a.phase) ?? 0;
            const phaseB = phaseOrder.get(b.phase) ?? 0;
            return phaseA - phaseB;
        });
        return sortedActions.map((action) => ({
            name: action.name,
            score: action.emotion_score,
            phase: phases.find((p) => p.id === action.phase)?.name || '',
        }));
    }, [phases, actions]);
    return (_jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(LineChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name", angle: -45, textAnchor: "end", height: 100, interval: 0 }), _jsx(YAxis, { domain: [-2, 2], ticks: [-2, -1, 0, 1, 2] }), _jsx(Tooltip, { content: ({ payload }) => {
                        if (!payload?.[0])
                            return null;
                        const data = payload[0].payload;
                        return (_jsxs(Paper, { sx: { p: 1, boxShadow: 2 }, children: [_jsx(Typography, { variant: "caption", display: "block", color: "text.secondary", children: data.phase }), _jsx(Typography, { variant: "body2", fontWeight: "bold", children: data.name }), _jsxs(Typography, { variant: "body2", children: ["\u30B9\u30B3\u30A2: ", data.score] })] }));
                    } }), _jsx(Line, { type: "monotone", dataKey: "score", stroke: "#1976d2", strokeWidth: 2, dot: { r: 5 } })] }) }));
};
export function CjmCanvas({ cjm, selectedAction, selectedPhase, onActionSelect, onPhaseSelect, onPersonaSelect, onAddPhase, onAddAction, onReorderActions, onReorderPhases, }) {
    const [addActionDialogOpen, setAddActionDialogOpen] = useState(false);
    const [newActionName, setNewActionName] = useState('');
    const [selectedPhaseForNewAction, setSelectedPhaseForNewAction] = useState('');
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));
    const phaseActionsMap = useMemo(() => {
        return cjm.phases.map((phase) => ({
            phase,
            actions: cjm.actions.filter((a) => a.phase === phase.id),
        }));
    }, [cjm]);
    const totalColumns = useMemo(() => {
        return phaseActionsMap.reduce((sum, { actions }) => sum + Math.max(1, actions.length), 0);
    }, [phaseActionsMap]);
    const handleDragEndPhases = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = cjm.phases.findIndex((p) => p.id === active.id);
            const newIndex = cjm.phases.findIndex((p) => p.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const reordered = arrayMove(cjm.phases, oldIndex, newIndex);
                onReorderPhases(reordered);
            }
        }
    };
    const handleDragEndActions = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            // Find which phase the dragged action belongs to
            const draggedAction = cjm.actions.find((a) => a.id === active.id);
            const targetAction = cjm.actions.find((a) => a.id === over.id);
            if (!draggedAction || !targetAction)
                return;
            // Only allow reordering within the same phase
            if (draggedAction.phase !== targetAction.phase)
                return;
            const phaseId = draggedAction.phase;
            const phaseActions = cjm.actions.filter((a) => a.phase === phaseId);
            const otherActions = cjm.actions.filter((a) => a.phase !== phaseId);
            const oldIndex = phaseActions.findIndex((a) => a.id === active.id);
            const newIndex = phaseActions.findIndex((a) => a.id === over.id);
            const reordered = arrayMove(phaseActions, oldIndex, newIndex);
            onReorderActions([...otherActions, ...reordered]);
        }
    };
    const handleOpenAddActionDialog = () => {
        setNewActionName('');
        setSelectedPhaseForNewAction(cjm.phases[0]?.id || '');
        setAddActionDialogOpen(true);
    };
    const handleCloseAddActionDialog = () => {
        setAddActionDialogOpen(false);
    };
    const handleAddActionSubmit = () => {
        if (newActionName.trim() && selectedPhaseForNewAction) {
            onAddAction(selectedPhaseForNewAction, newActionName.trim());
            handleCloseAddActionDialog();
        }
    };
    return (_jsxs(Box, { sx: { p: 3, height: '100%', overflow: 'auto' }, children: [_jsxs(Stack, { direction: "row", spacing: 2, sx: { mb: 2 }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: onAddPhase, children: "\u30D5\u30A7\u30FC\u30BA\u8FFD\u52A0" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleOpenAddActionDialog, children: "\u30A2\u30AF\u30B7\u30E7\u30F3\u8FFD\u52A0" })] }), _jsx(Paper, { elevation: 2, sx: {
                    mb: 2,
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.100' },
                }, onClick: onPersonaSelect, children: _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 2, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "bold", sx: { minWidth: 100 }, children: "\u30DA\u30EB\u30BD\u30CA:" }), _jsx(Typography, { variant: "body1", children: cjm.persona?.name || '（未設定 - クリックして設定）' })] }) }), _jsx(TableContainer, { component: Paper, elevation: 2, sx: { overflowX: 'auto' }, children: _jsxs(Table, { sx: { minWidth: 650 }, children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3 }, children: "\u30D5\u30A7\u30FC\u30BA" }), _jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragEnd: handleDragEndPhases, children: _jsx(SortableContext, { items: cjm.phases.map((p) => p.id), strategy: horizontalListSortingStrategy, children: phaseActionsMap.map(({ phase, actions }) => {
                                                const colSpan = Math.max(1, actions.length);
                                                return (_jsx(SortablePhaseCell, { phase: phase, colSpan: colSpan, isSelected: selectedPhase?.id === phase.id, onSelect: () => onPhaseSelect(phase) }, phase.id));
                                            }) }) })] }) }), _jsxs(TableBody, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3, color: 'text.primary' }, children: "\u30A2\u30AF\u30B7\u30E7\u30F3" }), _jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragEnd: handleDragEndActions, children: phaseActionsMap.map(({ phase, actions }) => {
                                                const columns = Math.max(1, actions.length);
                                                const actionIds = actions.map((a) => a.id);
                                                return (_jsx(SortableContext, { items: actionIds, strategy: horizontalListSortingStrategy, children: Array.from({ length: columns }).map((_, idx) => {
                                                        const action = actions[idx];
                                                        return (_jsx(TableCell, { sx: {
                                                                borderLeft: idx === 0 ? 1 : 0,
                                                                borderColor: 'divider',
                                                                verticalAlign: 'top',
                                                                p: 3,
                                                                minWidth: 150,
                                                            }, children: action && (_jsx(SortableActionCell, { action: action, isSelected: selectedAction?.id === action.id, onSelect: () => onActionSelect(action) })) }, `${phase.id}-action-${idx}`));
                                                    }) }, phase.id));
                                            }) })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3, color: 'text.primary' }, children: "\u30BF\u30C3\u30C1\u30DD\u30A4\u30F3\u30C8" }), phaseActionsMap.map(({ phase, actions }) => {
                                            const columns = Math.max(1, actions.length);
                                            return Array.from({ length: columns }).map((_, idx) => {
                                                const action = actions[idx];
                                                return (_jsx(TableCell, { sx: {
                                                        borderLeft: idx === 0 ? 1 : 0,
                                                        borderColor: 'divider',
                                                        verticalAlign: 'top',
                                                        p: 3,
                                                    }, children: action?.touchpoints?.map((tp, i) => (_jsxs(Typography, { variant: "caption", display: "block", color: "text.primary", children: ["\u2022 ", tp] }, i))) }, `${phase.id}-tp-${idx}`));
                                            });
                                        })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3, color: 'text.primary' }, children: "\u601D\u8003\u30FB\u611F\u60C5" }), phaseActionsMap.map(({ phase, actions }) => {
                                            const columns = Math.max(1, actions.length);
                                            return Array.from({ length: columns }).map((_, idx) => {
                                                const action = actions[idx];
                                                return (_jsx(TableCell, { sx: {
                                                        borderLeft: idx === 0 ? 1 : 0,
                                                        borderColor: 'divider',
                                                        verticalAlign: 'top',
                                                        p: 3,
                                                    }, children: action?.thoughts_feelings?.map((tf, i) => (_jsxs(Typography, { variant: "body2", color: "text.primary", sx: { mb: 0.5 }, children: ["\u2022 ", tf] }, i))) }, `${phase.id}-tf-${idx}`));
                                            });
                                        })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3, color: 'text.primary' }, children: "\u611F\u60C5\u66F2\u7DDA" }), _jsx(TableCell, { colSpan: totalColumns, sx: { p: 3 }, children: _jsx(EmotionCurve, { phases: cjm.phases, actions: cjm.actions }) })] })] })] }) }), _jsxs(Dialog, { open: addActionDialogOpen, onClose: handleCloseAddActionDialog, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u30A2\u30AF\u30B7\u30E7\u30F3\u8FFD\u52A0" }), _jsx(DialogContent, { children: _jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u30D5\u30A7\u30FC\u30BA" }), _jsx(Select, { value: selectedPhaseForNewAction, label: "\u30D5\u30A7\u30FC\u30BA", onChange: (e) => setSelectedPhaseForNewAction(e.target.value), children: cjm.phases.map((phase) => (_jsx(MenuItem, { value: phase.id, children: phase.name }, phase.id))) })] }), _jsx(TextField, { autoFocus: true, label: "\u30A2\u30AF\u30B7\u30E7\u30F3\u540D", fullWidth: true, value: newActionName, onChange: (e) => setNewActionName(e.target.value), onKeyPress: (e) => {
                                        if (e.key === 'Enter') {
                                            handleAddActionSubmit();
                                        }
                                    } })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseAddActionDialog, children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx(Button, { onClick: handleAddActionSubmit, variant: "contained", disabled: !newActionName.trim(), children: "\u8FFD\u52A0" })] })] })] }));
}
