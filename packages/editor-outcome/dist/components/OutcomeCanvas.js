import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import { Star } from '@mui/icons-material';
export function OutcomeCanvas({ outcome, sbp, cjm, selectedPhaseId, onPhaseSelect, }) {
    // Get tasks to highlight based on selected phase
    const highlightedTaskIds = useMemo(() => {
        if (!selectedPhaseId || !cjm)
            return new Set();
        const phaseActions = cjm.actions
            .filter((action) => action.phase === selectedPhaseId)
            .map((action) => action.id);
        const tasks = sbp.tasks
            .filter((task) => task.source_id && phaseActions.includes(task.source_id))
            .map((task) => task.id);
        return new Set(tasks);
    }, [selectedPhaseId, cjm, sbp.tasks]);
    // Get the CSF source task
    const csfTask = sbp.tasks.find((task) => task.id === outcome.primary_csf.source_id);
    return (_jsxs(Box, { sx: { height: '100%', bgcolor: 'grey.50', p: 3 }, children: [cjm && (_jsxs(Paper, { elevation: 2, sx: { mb: 3, p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Select CJM Phase" }), _jsxs(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", useFlexGap: true, children: [_jsx(Button, { onClick: () => onPhaseSelect(null), variant: selectedPhaseId === null ? 'contained' : 'outlined', size: "small", children: "All Phases" }), cjm.phases.map((phase) => (_jsx(Button, { onClick: () => onPhaseSelect(phase.id), variant: selectedPhaseId === phase.id ? 'contained' : 'outlined', size: "small", children: phase.name }, phase.id)))] })] })), _jsxs(Paper, { elevation: 2, sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Service Blueprint" }), _jsx(Stack, { spacing: 2, children: sbp.lanes.map((lane) => {
                            const laneTasks = sbp.tasks.filter((task) => task.lane === lane.id);
                            return (_jsxs(Box, { sx: { p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "medium", sx: { mb: 2 }, children: lane.name }), _jsx(Box, { sx: { display: 'flex', gap: 2, overflowX: 'auto' }, children: laneTasks.map((task) => {
                                            const isHighlighted = highlightedTaskIds.has(task.id);
                                            const isCsfTask = task.id === outcome.primary_csf.source_id;
                                            return (_jsxs(Paper, { elevation: isCsfTask ? 4 : 1, sx: {
                                                    minWidth: 200,
                                                    flexShrink: 0,
                                                    p: 2,
                                                    border: 2,
                                                    borderColor: isCsfTask ? 'success.main' : isHighlighted ? 'primary.light' : 'grey.300',
                                                    bgcolor: isCsfTask ? 'success.lighter' : isHighlighted ? 'primary.lighter' : 'white',
                                                }, children: [_jsx(Typography, { variant: "body2", fontWeight: "medium", children: task.name }), isCsfTask && (_jsx(Chip, { icon: _jsx(Star, {}), label: "CSF Source", size: "small", color: "success", sx: { mt: 1 } }))] }, task.id));
                                        }) })] }, lane.id));
                        }) })] }), csfTask && (_jsxs(Paper, { elevation: 2, sx: { mt: 3, p: 2, bgcolor: 'success.lighter' }, children: [_jsx(Typography, { variant: "h6", color: "success.dark", sx: { mb: 1 }, children: "Current CSF" }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [_jsx("strong", { children: "Task:" }), " ", csfTask.name] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: [_jsx("strong", { children: "Rationale:" }), " ", outcome.primary_csf.rationale] })] }))] }));
}
