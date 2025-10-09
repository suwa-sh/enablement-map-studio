import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
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
    return (_jsxs("div", { className: "w-80 border-l border-gray-200 bg-white p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Properties" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: "\u2715" })] }), editedLane && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Lane Name" }), _jsx("input", { type: "text", value: editedLane.name, onChange: (e) => setEditedLane({ ...editedLane, name: e.target.value }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Lane Kind" }), _jsxs("select", { value: editedLane.kind, onChange: (e) => setEditedLane({
                                    ...editedLane,
                                    kind: e.target.value,
                                }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2", children: [_jsx("option", { value: "cjm", children: "CJM" }), _jsx("option", { value: "human", children: "Human" }), _jsx("option", { value: "team", children: "Team" }), _jsx("option", { value: "system", children: "System" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleSave, className: "flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700", children: "Save" }), _jsx("button", { onClick: handleDelete, className: "rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700", children: "Delete" })] })] })), editedTask && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Task Name" }), _jsx("input", { type: "text", value: editedTask.name, onChange: (e) => setEditedTask({ ...editedTask, name: e.target.value }), disabled: editedTask.readonly, className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100" })] }), editedTask.readonly && (_jsx("div", { className: "rounded-md bg-yellow-50 p-3 text-sm text-yellow-800", children: "This task is read-only (from CJM). Edit it in the CJM editor." })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Source ID (CJM Action)" }), _jsx("input", { type: "text", value: editedTask.source_id || '', onChange: (e) => setEditedTask({ ...editedTask, source_id: e.target.value || undefined }), placeholder: "Optional", className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleSave, className: "flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700", children: "Save" }), _jsx("button", { onClick: handleDelete, className: "rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700", disabled: editedTask.readonly, children: "Delete" })] })] }))] }));
}
