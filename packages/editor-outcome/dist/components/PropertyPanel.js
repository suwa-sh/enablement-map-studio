import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Drawer, Typography, TextField, Button, Stack, IconButton, Paper, Select, MenuItem, FormControl, InputLabel, } from '@mui/material';
import { Close, Save } from '@mui/icons-material';
const UNIT_OPTIONS = ['%', '件', '円', '時間', '人', '回', 'pt'];
export function PropertyPanel({ outcome, sbp, onOutcomeUpdate, onClose, }) {
    const [editedOutcome, setEditedOutcome] = useState(outcome);
    const [isTargetFocused, setIsTargetFocused] = useState(false);
    useEffect(() => {
        setEditedOutcome(outcome);
    }, [outcome]);
    const handleSave = () => {
        if (editedOutcome) {
            onOutcomeUpdate(editedOutcome);
        }
    };
    if (!editedOutcome)
        return null;
    const selectedTask = editedOutcome.primary_csf.source_id
        ? sbp.tasks.find((t) => t.id === editedOutcome.primary_csf.source_id)
        : null;
    return (_jsx(Drawer, { anchor: "right", open: !!editedOutcome, onClose: onClose, variant: "persistent", sx: {
            '& .MuiDrawer-paper': {
                width: '33vw',
                minWidth: 400,
                boxSizing: 'border-box',
            },
        }, children: _jsxs(Box, { sx: { p: 3, height: '100%', display: 'flex', flexDirection: 'column' }, onClick: (e) => e.stopPropagation(), children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }, children: [_jsx(Typography, { variant: "h6", children: "\u30D7\u30ED\u30D1\u30C6\u30A3" }), _jsx(IconButton, { onClick: onClose, size: "small", children: _jsx(Close, {}) })] }), _jsx(Box, { sx: { flex: 1, overflow: 'auto' }, children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", sx: { mb: 1 }, children: "KGI (\u91CD\u8981\u76EE\u6A19\u9054\u6210\u6307\u6A19)" }), _jsx(TextField, { label: "\u540D\u524D", fullWidth: true, size: "small", value: editedOutcome.kgi.name, onChange: (e) => setEditedOutcome({
                                            ...editedOutcome,
                                            kgi: { ...editedOutcome.kgi, name: e.target.value },
                                        }) })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", sx: { mb: 1 }, children: "CSF (\u91CD\u8981\u6210\u529F\u8981\u56E0)" }), selectedTask && (_jsxs(Paper, { elevation: 0, sx: { mb: 2, p: 2, border: 1, borderColor: 'success.main', bgcolor: 'success.lighter' }, children: [_jsx(Typography, { variant: "caption", fontWeight: "medium", color: "success.dark", children: "\u30BD\u30FC\u30B9\u30BF\u30B9\u30AF" }), _jsx(Typography, { variant: "body2", sx: { mt: 0.5 }, children: selectedTask.name })] })), _jsx(TextField, { label: "\u8AAC\u660E", fullWidth: true, size: "small", multiline: true, rows: 3, value: editedOutcome.primary_csf.rationale, onChange: (e) => setEditedOutcome({
                                            ...editedOutcome,
                                            primary_csf: {
                                                ...editedOutcome.primary_csf,
                                                rationale: e.target.value,
                                            },
                                        }) })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", sx: { mb: 1 }, children: "KPI (\u91CD\u8981\u696D\u7E3E\u8A55\u4FA1\u6307\u6A19)" }), _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "\u540D\u524D", fullWidth: true, size: "small", value: editedOutcome.primary_kpi.name, onChange: (e) => setEditedOutcome({
                                                    ...editedOutcome,
                                                    primary_kpi: {
                                                        ...editedOutcome.primary_kpi,
                                                        name: e.target.value,
                                                    },
                                                }) }), _jsx(TextField, { label: "\u8AAC\u660E", fullWidth: true, size: "small", multiline: true, rows: 2, placeholder: "\u30AA\u30D7\u30B7\u30E7\u30F3", value: editedOutcome.primary_kpi.definition || '', onChange: (e) => setEditedOutcome({
                                                    ...editedOutcome,
                                                    primary_kpi: {
                                                        ...editedOutcome.primary_kpi,
                                                        definition: e.target.value,
                                                    },
                                                }) }), _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(TextField, { label: "\u76EE\u6A19\u5024", fullWidth: true, size: "small", type: isTargetFocused ? "number" : "text", value: isTargetFocused
                                                            ? editedOutcome.primary_kpi.target
                                                            : editedOutcome.primary_kpi.target.toLocaleString('ja-JP', {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 2,
                                                            }), onChange: (e) => setEditedOutcome({
                                                            ...editedOutcome,
                                                            primary_kpi: {
                                                                ...editedOutcome.primary_kpi,
                                                                target: Number(e.target.value),
                                                            },
                                                        }), onFocus: () => setIsTargetFocused(true), onBlur: () => setIsTargetFocused(false) }), _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "\u30E6\u30CB\u30C3\u30C8" }), _jsxs(Select, { value: editedOutcome.primary_kpi.unit || '', label: "\u30E6\u30CB\u30C3\u30C8", onChange: (e) => setEditedOutcome({
                                                                    ...editedOutcome,
                                                                    primary_kpi: {
                                                                        ...editedOutcome.primary_kpi,
                                                                        unit: e.target.value,
                                                                    },
                                                                }), children: [_jsx(MenuItem, { value: "", children: _jsx("em", { children: "\u9078\u629E\u306A\u3057" }) }), UNIT_OPTIONS.map((unit) => (_jsx(MenuItem, { value: unit, children: unit }, unit)))] })] })] })] })] })] }) }), _jsx(Box, { sx: { mt: 3 }, children: _jsx(Button, { onClick: handleSave, variant: "contained", startIcon: _jsx(Save, {}), fullWidth: true, children: "SAVE" }) })] }) }));
}
