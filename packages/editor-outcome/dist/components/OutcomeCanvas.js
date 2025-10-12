import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Box, Paper, Typography, Stack, Chip, Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, FormControl, InputLabel, } from '@mui/material';
import { Star, ExpandMore, FilterList } from '@mui/icons-material';
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
    // Count visible items for filter summary
    const visibleCjmActionsCount = cjm
        ? cjm.actions.filter((action) => selectedPhaseId === null || action.phase === selectedPhaseId).length
        : 0;
    return (_jsxs(Box, { sx: { height: '100%', bgcolor: 'grey.50', p: 3, overflow: 'auto' }, children: [cjm && (_jsx(Box, { sx: {
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    bgcolor: 'grey.50',
                    pt: 0,
                    pb: 2,
                    display: 'flex',
                    justifyContent: 'flex-end',
                }, children: _jsxs(Accordion, { sx: { width: '50%', maxWidth: 800 }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMore, {}), children: _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(FilterList, { fontSize: "small" }), _jsx(Typography, { variant: "button", children: "\u30D5\u30A3\u30EB\u30BF\u30FC" })] }) }), _jsx(AccordionDetails, { children: _jsxs(Stack, { spacing: 2, children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "phase-filter-label", children: "\u9867\u5BA2\u306E\u610F\u601D\u6C7A\u5B9A\u30D7\u30ED\u30BB\u30B9" }), _jsxs(Select, { labelId: "phase-filter-label", value: selectedPhaseId || '', onChange: (e) => onPhaseSelect(e.target.value || null), label: "\u9867\u5BA2\u306E\u610F\u601D\u6C7A\u5B9A\u30D7\u30ED\u30BB\u30B9", children: [_jsx(MenuItem, { value: "", children: "\u3059\u3079\u3066" }), cjm.phases.map((phase) => (_jsx(MenuItem, { value: phase.id, children: phase.name }, phase.id)))] })] }), selectedPhaseId && (_jsx(Paper, { elevation: 1, sx: { p: 2, bgcolor: 'grey.50', border: 1, borderColor: 'grey.300' }, children: _jsxs(Typography, { variant: "body2", color: "text.primary", children: ["\u30D5\u30A3\u30EB\u30BF\u4E2D: \u9867\u5BA2\u306E\u610F\u601D\u6C7A\u5B9A\u30D7\u30ED\u30BB\u30B9 ", visibleCjmActionsCount, "\u4EF6 \u2192 \u7D44\u7E54\u306E\u4FA1\u5024\u63D0\u4F9B\u30D7\u30ED\u30BB\u30B9 ", visibleTaskIds?.size || sbp.tasks.length, "\u4EF6"] }) }))] }) })] }) })), cjm && (_jsxs(Paper, { elevation: 2, sx: { mb: 2, p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "CJM" }), _jsxs(Box, { sx: { p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }, children: [_jsxs(Typography, { variant: "subtitle1", fontWeight: "medium", sx: { mb: 2 }, children: ["\u30A2\u30AF\u30B7\u30E7\u30F3 (", visibleCjmActionsCount, "\u4EF6)"] }), _jsx(Box, { sx: { display: 'flex', gap: 2, overflowX: 'auto' }, children: cjm.actions
                                    .filter((action) => selectedPhaseId === null || action.phase === selectedPhaseId)
                                    .map((action) => (_jsx(Paper, { elevation: 1, sx: {
                                        minWidth: 200,
                                        flexShrink: 0,
                                        p: 2,
                                        border: 1,
                                        borderColor: 'grey.300',
                                        bgcolor: 'white',
                                    }, children: _jsx(Typography, { variant: "body2", fontWeight: "medium", children: action.name }) }, action.id))) })] })] })), _jsxs(Paper, { elevation: 2, sx: { mb: 2, p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "SBP" }), _jsx(Stack, { spacing: 2, children: sbp.lanes.slice(1).map((lane) => {
                            const laneTasks = sbp.tasks
                                .filter((task) => task.lane === lane.id)
                                .filter((task) => visibleTaskIds === null || visibleTaskIds.has(task.id));
                            // Skip empty lanes when filtering
                            if (visibleTaskIds !== null && laneTasks.length === 0)
                                return null;
                            return (_jsxs(Box, { sx: { p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "medium", sx: { mb: 2 }, children: lane.name }), _jsx(Box, { sx: { display: 'flex', gap: 2, overflowX: 'auto' }, children: laneTasks.map((task) => {
                                            const isCsfTask = task.id === outcome.primary_csf.source_id;
                                            return (_jsxs(Paper, { elevation: isCsfTask ? 4 : 1, onClick: (e) => {
                                                    e.stopPropagation();
                                                    onTaskClick(task.id);
                                                }, sx: {
                                                    minWidth: 200,
                                                    flexShrink: 0,
                                                    p: 2,
                                                    border: 2,
                                                    borderColor: isCsfTask ? 'primary.main' : 'grey.300',
                                                    bgcolor: isCsfTask ? 'primary.lighter' : 'white',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        bgcolor: isCsfTask ? 'primary.light' : 'grey.100',
                                                    },
                                                }, children: [_jsx(Typography, { variant: "body2", fontWeight: "medium", children: task.name }), isCsfTask && (_jsx(Chip, { icon: _jsx(Star, {}), label: "CSF", size: "small", color: "primary", sx: { mt: 1 } }))] }, task.id));
                                        }) })] }, lane.id));
                        }) })] }), _jsxs(Paper, { elevation: 2, sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "\u7D44\u7E54\u306E\u6C42\u3081\u308B\u6210\u679C" }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "KGI" }), _jsx(Typography, { variant: "body2", children: outcome.kgi.name })] }), _jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "CSF" }), _jsx(Typography, { variant: "body2", children: outcome.primary_csf.rationale || '（未設定）' })] }), _jsxs(Paper, { elevation: 1, sx: { flex: 1, p: 2, bgcolor: 'grey.50' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "bold", color: "text.secondary", children: "KPI" }), _jsxs(Typography, { variant: "body2", children: [outcome.primary_kpi.name, ": ", outcome.primary_kpi.target.toLocaleString('ja-JP', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2,
                                            }), outcome.primary_kpi.unit && outcome.primary_kpi.unit] })] })] })] })] }));
}
