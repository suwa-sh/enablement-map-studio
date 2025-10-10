import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Drawer, Typography, TextField, Button, Stack, IconButton, Select, MenuItem, FormControl, InputLabel, Alert, } from '@mui/material';
import { Close, Save, Delete } from '@mui/icons-material';
export function PropertyPanel({ selectedTask, selectedLane, onTaskUpdate, onLaneUpdate, onTaskDelete, onLaneDelete, onClose, }) {
    const [editedTask, setEditedTask] = useState(null);
    const [editedLane, setEditedLane] = useState(null);
    useEffect(() => {
        setEditedTask(selectedTask);
    }, [selectedTask]);
    useEffect(() => {
        setEditedLane(selectedLane);
    }, [selectedLane]);
    if (!selectedTask && !selectedLane) {
        return null;
    }
    const handleSave = () => {
        if (editedTask) {
            onTaskUpdate(editedTask);
        }
        else if (editedLane) {
            onLaneUpdate(editedLane);
        }
    };
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            if (editedTask) {
                onTaskDelete(editedTask.id);
            }
            else if (editedLane) {
                onLaneDelete(editedLane.id);
            }
        }
    };
    const open = Boolean(selectedTask || selectedLane);
    return (_jsx(Drawer, { anchor: "right", open: open, onClose: onClose, variant: "temporary", children: _jsxs(Box, { sx: { width: 360, p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }, children: [_jsx(Typography, { variant: "h6", children: "Properties" }), _jsx(IconButton, { onClick: onClose, size: "small", children: _jsx(Close, {}) })] }), editedLane && (_jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { label: "Lane Name", fullWidth: true, value: editedLane.name, onChange: (e) => setEditedLane({ ...editedLane, name: e.target.value }) }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Lane Kind" }), _jsxs(Select, { value: editedLane.kind, label: "Lane Kind", onChange: (e) => setEditedLane({
                                        ...editedLane,
                                        kind: e.target.value,
                                    }), children: [_jsx(MenuItem, { value: "cjm", children: "CJM" }), _jsx(MenuItem, { value: "human", children: "Human" }), _jsx(MenuItem, { value: "team", children: "Team" }), _jsx(MenuItem, { value: "system", children: "System" })] })] }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Save, {}), onClick: handleSave, fullWidth: true, children: "Save" }), _jsx(Button, { variant: "contained", color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, children: "Delete" })] })] })), editedTask && (_jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { label: "Task Name", fullWidth: true, value: editedTask.name, onChange: (e) => setEditedTask({ ...editedTask, name: e.target.value }), disabled: editedTask.readonly }), editedTask.readonly && (_jsx(Alert, { severity: "warning", children: "This task is read-only (from CJM). Edit it in the CJM editor." })), _jsx(TextField, { label: "Source ID (CJM Action)", fullWidth: true, value: editedTask.source_id || '', onChange: (e) => setEditedTask({ ...editedTask, source_id: e.target.value || undefined }), placeholder: "Optional" }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Save, {}), onClick: handleSave, fullWidth: true, children: "Save" }), _jsx(Button, { variant: "contained", color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, disabled: editedTask.readonly, children: "Delete" })] })] }))] }) }));
}
