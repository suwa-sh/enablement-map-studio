import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Drawer, Typography, TextField, Button, Stack, IconButton, Select, MenuItem, FormControl, InputLabel, Alert, } from '@mui/material';
import { Close, Save, Delete } from '@mui/icons-material';
import { useConfirm } from '@enablement-map-studio/ui';
export function PropertyPanel({ selectedTask, selectedLane, onTaskUpdate, onLaneUpdate, onTaskDelete, onLaneDelete, onClose, }) {
    const { confirm } = useConfirm();
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
    const handleDelete = async () => {
        const confirmed = await confirm({ message: 'このアイテムを削除してもよろしいですか？' });
        if (confirmed) {
            if (editedTask) {
                onTaskDelete(editedTask.id);
            }
            else if (editedLane) {
                onLaneDelete(editedLane.id);
            }
        }
    };
    const open = Boolean(selectedTask || selectedLane);
    return (_jsx(Drawer, { anchor: "right", open: open, onClose: onClose, variant: "temporary", children: _jsxs(Box, { sx: { width: '33vw', minWidth: 400, p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }, children: [_jsx(Typography, { variant: "h6", children: "\u30D7\u30ED\u30D1\u30C6\u30A3" }), _jsx(IconButton, { onClick: onClose, size: "small", children: _jsx(Close, {}) })] }), editedLane && (_jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { label: "\u30EC\u30FC\u30F3\u540D", fullWidth: true, value: editedLane.name, onChange: (e) => setEditedLane({ ...editedLane, name: e.target.value }) }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u30EC\u30FC\u30F3\u7A2E\u5225" }), _jsxs(Select, { value: editedLane.kind === 'cjm' ? 'cjm' : editedLane.kind, label: "\u30EC\u30FC\u30F3\u7A2E\u5225", disabled: editedLane.kind === 'cjm', onChange: (e) => setEditedLane({
                                        ...editedLane,
                                        kind: e.target.value,
                                    }), children: [editedLane.kind === 'cjm' && _jsx(MenuItem, { value: "cjm", children: "\u9867\u5BA2 (CJM\u9023\u52D5)" }), _jsx(MenuItem, { value: "human", children: "Human" }), _jsx(MenuItem, { value: "team", children: "Team" }), _jsx(MenuItem, { value: "system", children: "System" })] }), editedLane.kind === 'cjm' && (_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 0.5, display: 'block' }, children: "CJM\u9023\u52D5\u30EC\u30FC\u30F3\u306E\u7A2E\u5225\u306F\u5909\u66F4\u3067\u304D\u307E\u305B\u3093" }))] }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Save, {}), onClick: handleSave, sx: { flex: 1 }, children: "Save" }), _jsx(Button, { variant: "contained", color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, sx: { flex: 1 }, children: "Delete" })] })] })), editedTask && (_jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { label: "\u30BF\u30B9\u30AF\u540D", fullWidth: true, value: editedTask.name, onChange: (e) => setEditedTask({ ...editedTask, name: e.target.value }), disabled: editedTask.readonly }), editedTask.readonly && (_jsx(Alert, { severity: "warning", children: "\u3053\u306E\u30BF\u30B9\u30AF\u306F\u8AAD\u307F\u53D6\u308A\u5C02\u7528\u3067\u3059\uFF08CJM\u9023\u52D5\uFF09\u3002CJM\u30A8\u30C7\u30A3\u30BF\u3067\u7DE8\u96C6\u3057\u3066\u304F\u3060\u3055\u3044\u3002" })), !editedTask.readonly && (_jsx(TextField, { label: "\u30BD\u30FC\u30B9ID (CJM\u30A2\u30AF\u30B7\u30E7\u30F3)", fullWidth: true, value: editedTask.source_id || '', onChange: (e) => setEditedTask({ ...editedTask, source_id: e.target.value || undefined }), placeholder: "\u4EFB\u610F", helperText: "CJM\u30A2\u30AF\u30B7\u30E7\u30F3\u3068\u9023\u643A\u3059\u308B\u5834\u5408\u3001\u30A2\u30AF\u30B7\u30E7\u30F3ID\u3092\u6307\u5B9A" })), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Save, {}), onClick: handleSave, sx: { flex: 1 }, children: "Save" }), _jsx(Button, { variant: "contained", color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, disabled: editedTask.readonly, sx: { flex: 1 }, children: "Delete" })] })] }))] }) }));
}
