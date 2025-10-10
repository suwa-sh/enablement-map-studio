import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Drawer, Typography, TextField, Button, Stack, IconButton, Slider, } from '@mui/material';
import { Close, Save, Delete } from '@mui/icons-material';
export function PropertyPanel({ selectedAction, selectedPhase, onActionUpdate, onPhaseUpdate, onActionDelete, onPhaseDelete, onClose, }) {
    const [editedAction, setEditedAction] = useState(null);
    const [editedPhase, setEditedPhase] = useState(null);
    useEffect(() => {
        setEditedAction(selectedAction);
    }, [selectedAction]);
    useEffect(() => {
        setEditedPhase(selectedPhase);
    }, [selectedPhase]);
    const handleSave = () => {
        if (editedAction) {
            onActionUpdate(editedAction);
        }
        else if (editedPhase) {
            onPhaseUpdate(editedPhase);
        }
    };
    const handleDelete = () => {
        if (window.confirm('このアイテムを削除してもよろしいですか？')) {
            if (editedAction) {
                onActionDelete(editedAction.id);
            }
            else if (editedPhase) {
                onPhaseDelete(editedPhase.id);
            }
        }
    };
    const open = Boolean(selectedAction || selectedPhase);
    return (_jsx(Drawer, { anchor: "right", open: open, onClose: onClose, variant: "temporary", children: _jsxs(Box, { sx: { width: '33vw', minWidth: 400, p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }, children: [_jsx(Typography, { variant: "h6", children: "Properties" }), _jsx(IconButton, { onClick: onClose, size: "small", children: _jsx(Close, {}) })] }), editedPhase && (_jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { label: "\u30D5\u30A7\u30FC\u30BA\u540D", fullWidth: true, value: editedPhase.name, onChange: (e) => setEditedPhase({ ...editedPhase, name: e.target.value }) }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Save, {}), onClick: handleSave, sx: { flex: 1 }, children: "Save" }), _jsx(Button, { variant: "contained", color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, sx: { flex: 1 }, children: "Delete" })] })] })), editedAction && (_jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { label: "\u30A2\u30AF\u30B7\u30E7\u30F3", fullWidth: true, value: editedAction.name, onChange: (e) => setEditedAction({ ...editedAction, name: e.target.value }) }), _jsx(TextField, { label: "\u30BF\u30C3\u30C1\u30DD\u30A4\u30F3\u30C8", fullWidth: true, multiline: true, rows: 3, value: editedAction.touchpoints?.join('\n') || '', onChange: (e) => setEditedAction({
                                ...editedAction,
                                touchpoints: e.target.value.split('\n').filter(Boolean),
                            }), placeholder: "1\u884C\u306B1\u3064\u5165\u529B" }), _jsx(TextField, { label: "\u601D\u8003\u30FB\u611F\u60C5", fullWidth: true, multiline: true, rows: 3, value: editedAction.thoughts_feelings?.join('\n') || '', onChange: (e) => setEditedAction({
                                ...editedAction,
                                thoughts_feelings: e.target.value.split('\n').filter(Boolean),
                            }), placeholder: "1\u884C\u306B1\u3064\u5165\u529B" }), _jsxs(Box, { children: [_jsxs(Typography, { gutterBottom: true, children: ["\u611F\u60C5\u30B9\u30B3\u30A2: ", editedAction.emotion_score] }), _jsx(Slider, { value: editedAction.emotion_score, onChange: (_e, value) => setEditedAction({ ...editedAction, emotion_score: value }), min: -2, max: 2, step: 1, marks: true, valueLabelDisplay: "auto" })] }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Save, {}), onClick: handleSave, sx: { flex: 1 }, children: "Save" }), _jsx(Button, { variant: "contained", color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, sx: { flex: 1 }, children: "Delete" })] })] }))] }) }));
}
