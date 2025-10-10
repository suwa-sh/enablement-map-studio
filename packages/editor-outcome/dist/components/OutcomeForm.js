import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Stack, Paper, Alert, } from '@mui/material';
import { Save } from '@mui/icons-material';
export function OutcomeForm({ outcome, sbp, 
// cjm,
// selectedPhaseId,
onOutcomeUpdate, }) {
    const [editedOutcome, setEditedOutcome] = useState(outcome);
    useEffect(() => {
        setEditedOutcome(outcome);
    }, [outcome]);
    const handleSave = () => {
        onOutcomeUpdate(editedOutcome);
    };
    const selectedTask = editedOutcome.primary_csf.source_id
        ? sbp.tasks.find((t) => t.id === editedOutcome.primary_csf.source_id)
        : null;
    return (_jsxs(Box, { sx: { width: 384, overflow: 'auto', borderLeft: 1, borderColor: 'divider', bgcolor: 'white', p: 3 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 3 }, children: "Outcome Definition" }), _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", sx: { mb: 1 }, children: "KGI (Key Goal Indicator)" }), _jsx(TextField, { label: "Name", fullWidth: true, size: "small", value: editedOutcome.kgi.name, onChange: (e) => setEditedOutcome({
                                    ...editedOutcome,
                                    kgi: { ...editedOutcome.kgi, name: e.target.value },
                                }) })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", sx: { mb: 1 }, children: "CSF (Critical Success Factor)" }), selectedTask && (_jsxs(Paper, { elevation: 0, sx: { mb: 2, p: 2, border: 1, borderColor: 'success.main', bgcolor: 'success.lighter' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "medium", color: "success.dark", children: "Source Task" }), _jsx(Typography, { variant: "body2", sx: { mt: 0.5 }, children: selectedTask.name })] })), _jsx(TextField, { label: "Rationale", fullWidth: true, size: "small", multiline: true, rows: 3, value: editedOutcome.primary_csf.rationale, onChange: (e) => setEditedOutcome({
                                    ...editedOutcome,
                                    primary_csf: {
                                        ...editedOutcome.primary_csf,
                                        rationale: e.target.value,
                                    },
                                }) }), _jsx(Alert, { severity: "info", sx: { mt: 2 }, children: "To change CSF source, select a task from the canvas above (Drag & drop not implemented in this version)" })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", sx: { mb: 1 }, children: "KPI (Key Performance Indicator)" }), _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Name", fullWidth: true, size: "small", value: editedOutcome.primary_kpi.name, onChange: (e) => setEditedOutcome({
                                            ...editedOutcome,
                                            primary_kpi: {
                                                ...editedOutcome.primary_kpi,
                                                name: e.target.value,
                                            },
                                        }) }), _jsx(TextField, { label: "Definition", fullWidth: true, size: "small", multiline: true, rows: 2, placeholder: "Optional", value: editedOutcome.primary_kpi.definition || '', onChange: (e) => setEditedOutcome({
                                            ...editedOutcome,
                                            primary_kpi: {
                                                ...editedOutcome.primary_kpi,
                                                definition: e.target.value,
                                            },
                                        }) }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(TextField, { label: "Unit", fullWidth: true, size: "small", placeholder: "e.g., %", value: editedOutcome.primary_kpi.unit || '', onChange: (e) => setEditedOutcome({
                                                    ...editedOutcome,
                                                    primary_kpi: {
                                                        ...editedOutcome.primary_kpi,
                                                        unit: e.target.value,
                                                    },
                                                }) }), _jsx(TextField, { label: "Target", fullWidth: true, size: "small", type: "number", value: editedOutcome.primary_kpi.target, onChange: (e) => setEditedOutcome({
                                                    ...editedOutcome,
                                                    primary_kpi: {
                                                        ...editedOutcome.primary_kpi,
                                                        target: Number(e.target.value),
                                                    },
                                                }) })] })] })] }), _jsx(Button, { onClick: handleSave, variant: "contained", startIcon: _jsx(Save, {}), fullWidth: true, children: "Save Changes" })] })] }));
}
