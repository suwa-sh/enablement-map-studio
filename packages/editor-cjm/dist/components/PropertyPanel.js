import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export function PropertyPanel({ selectedAction, selectedPhase, onActionUpdate, onPhaseUpdate, onActionDelete, onPhaseDelete, onClose, }) {
    const [editedAction, setEditedAction] = useState(null);
    const [editedPhase, setEditedPhase] = useState(null);
    useEffect(() => {
        setEditedAction(selectedAction);
    }, [selectedAction]);
    useEffect(() => {
        setEditedPhase(selectedPhase);
    }, [selectedPhase]);
    if (!selectedAction && !selectedPhase) {
        return null;
    }
    const handleSave = () => {
        if (editedAction) {
            onActionUpdate(editedAction);
        }
        else if (editedPhase) {
            onPhaseUpdate(editedPhase);
        }
    };
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            if (editedAction) {
                onActionDelete(editedAction.id);
            }
            else if (editedPhase) {
                onPhaseDelete(editedPhase.id);
            }
        }
    };
    return (_jsxs("div", { className: "w-80 border-l border-gray-200 bg-white p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Properties" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: "\u2715" })] }), editedPhase && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Phase Name" }), _jsx("input", { type: "text", value: editedPhase.name, onChange: (e) => setEditedPhase({ ...editedPhase, name: e.target.value }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleSave, className: "flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700", children: "Save" }), _jsx("button", { onClick: handleDelete, className: "rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700", children: "Delete" })] })] })), editedAction && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Action Name" }), _jsx("input", { type: "text", value: editedAction.name, onChange: (e) => setEditedAction({ ...editedAction, name: e.target.value }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Emotion Score (-2 to 2)" }), _jsx("input", { type: "number", min: -2, max: 2, value: editedAction.emotion_score, onChange: (e) => setEditedAction({
                                    ...editedAction,
                                    emotion_score: Number(e.target.value),
                                }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Touchpoints" }), _jsx("textarea", { value: editedAction.touchpoints?.join('\n') || '', onChange: (e) => setEditedAction({
                                    ...editedAction,
                                    touchpoints: e.target.value.split('\n').filter(Boolean),
                                }), rows: 3, placeholder: "One per line", className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Thoughts & Feelings" }), _jsx("textarea", { value: editedAction.thoughts_feelings?.join('\n') || '', onChange: (e) => setEditedAction({
                                    ...editedAction,
                                    thoughts_feelings: e.target.value.split('\n').filter(Boolean),
                                }), rows: 3, placeholder: "One per line", className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleSave, className: "flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700", children: "Save" }), _jsx("button", { onClick: handleDelete, className: "rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700", children: "Delete" })] })] }))] }));
}
