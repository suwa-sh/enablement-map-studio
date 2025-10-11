import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import { Star } from '@mui/icons-material';
export function OutcomeCanvas({ outcome, sbp, cjm, selectedPhaseId, onPhaseSelect, onTaskClick, }) {
    // Get tasks to display based on selected phase (filter instead of highlight)
    const visibleTaskIds = useMemo(() => {
        if (!selectedPhaseId || !cjm)
            return null; // null means show all
        const phaseActions = cjm.actions
            .filter((action) => action.phase === selectedPhaseId)
            .map((action) => action.id);
        const taskIds = sbp.tasks
            .filter((task) => {
            // Show CJM readonly tasks for this phase
            if (task.readonly && phaseActions.includes(task.id))
                return true;
            // Show regular tasks linked to this phase's actions
            if (task.source_id && phaseActions.includes(task.source_id))
                return true;
            return false;
        })
            .map((task) => task.id);
        return new Set(taskIds);
    }, [selectedPhaseId, cjm, sbp.tasks]);
    // Get the CSF source task
    const csfTask = sbp.tasks.find((task) => task.id === outcome.primary_csf.source_id);
    return (_jsxs(Box, { sx: { height: '100%', bgcolor: 'grey.50', p: 3 }, children: [_jsxs(Paper, { elevation: 2, sx: { mb: 3, p: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 3 }, children: "\u7D44\u7E54\u306E\u6C42\u3081\u308B\u6210\u679C" }), _jsxs(Stack, { spacing: 2, children: [_jsxs(Paper, { elevation: 1, sx: { p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", color: "text.secondary", sx: { mb: 0.5 }, children: "KGI" }), _jsx(Typography, { variant: "h6", children: outcome.kgi.name })] }), _jsxs(Paper, { elevation: 1, sx: { p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", color: "text.secondary", sx: { mb: 0.5 }, children: "CSF" }), csfTask && (_jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: ["\u30BD\u30FC\u30B9\u30BF\u30B9\u30AF: ", _jsx("strong", { children: csfTask.name })] })), _jsx(Typography, { variant: "body1", children: outcome.primary_csf.rationale || '（未設定）' })] }), _jsxs(Paper, { elevation: 1, sx: { p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", color: "text.secondary", sx: { mb: 0.5 }, children: "KPI" }), _jsx(Typography, { variant: "h6", sx: { mb: 1 }, children: outcome.primary_kpi.name }), outcome.primary_kpi.definition && (_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: outcome.primary_kpi.definition })), _jsxs(Typography, { variant: "body1", fontWeight: "medium", children: ["\u76EE\u6A19\u5024: ", outcome.primary_kpi.target.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 2 }), outcome.primary_kpi.unit && ` ${outcome.primary_kpi.unit}`] })] })] })] }), cjm && (_jsxs(Paper, { elevation: 2, sx: { mb: 3, p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "CJM" }), _jsxs(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", useFlexGap: true, sx: { mb: 2 }, children: [_jsx(Button, { onClick: () => onPhaseSelect(null), variant: selectedPhaseId === null ? 'contained' : 'outlined', children: "\u3059\u3079\u3066" }), cjm.phases.map((phase) => (_jsx(Button, { onClick: () => onPhaseSelect(phase.id), variant: selectedPhaseId === phase.id ? 'contained' : 'outlined', children: phase.name }, phase.id)))] }), _jsx(Stack, { spacing: 2, children: cjm.phases.map((phase) => {
                            const phaseActions = cjm.actions.filter((action) => action.phase === phase.id);
                            // Skip phases without actions, or phases filtered out
                            if (phaseActions.length === 0)
                                return null;
                            if (selectedPhaseId && selectedPhaseId !== phase.id)
                                return null;
                            return (_jsxs(Box, { sx: { p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "medium", sx: { mb: 2 }, children: phase.name }), _jsx(Box, { sx: { display: 'flex', gap: 2, overflowX: 'auto' }, children: phaseActions.map((action) => (_jsx(Paper, { elevation: 1, sx: {
                                                minWidth: 200,
                                                flexShrink: 0,
                                                p: 2,
                                                border: 1,
                                                borderColor: 'grey.300',
                                                bgcolor: 'white',
                                            }, children: _jsx(Typography, { variant: "body2", fontWeight: "medium", children: action.name }) }, action.id))) })] }, phase.id));
                        }) })] })), _jsxs(Paper, { elevation: 2, sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "SBP" }), _jsx(Stack, { spacing: 2, children: sbp.lanes.map((lane) => {
                            const laneTasks = sbp.tasks
                                .filter((task) => task.lane === lane.id)
                                .filter((task) => visibleTaskIds === null || visibleTaskIds.has(task.id));
                            // Skip empty lanes when filtering
                            if (visibleTaskIds !== null && laneTasks.length === 0)
                                return null;
                            return (_jsxs(Box, { sx: { p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "medium", sx: { mb: 2 }, children: lane.name }), _jsx(Box, { sx: { display: 'flex', gap: 2, overflowX: 'auto' }, children: laneTasks.map((task) => {
                                            const isCsfTask = task.id === outcome.primary_csf.source_id;
                                            return (_jsxs(Paper, { elevation: isCsfTask ? 4 : 1, onClick: () => onTaskClick(task.id), sx: {
                                                    minWidth: 200,
                                                    flexShrink: 0,
                                                    p: 2,
                                                    border: 2,
                                                    borderColor: isCsfTask ? 'success.main' : 'grey.300',
                                                    bgcolor: isCsfTask ? 'success.lighter' : 'white',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        bgcolor: isCsfTask ? 'success.light' : 'grey.100',
                                                    },
                                                }, children: [_jsx(Typography, { variant: "body2", fontWeight: "medium", children: task.name }), isCsfTask && (_jsx(Chip, { icon: _jsx(Star, {}), label: "CSF", size: "small", color: "success", sx: { mt: 1 } }))] }, task.id));
                                        }) })] }, lane.id));
                        }) })] })] }));
}
