import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export function PropertyPanel({ selectedItem, onActionUpdate, onSkillUpdate, onKnowledgeUpdate, onToolUpdate, onDelete, onClose, }) {
    const [editedItem, setEditedItem] = useState(null);
    useEffect(() => {
        if (selectedItem) {
            setEditedItem(selectedItem.item);
        }
    }, [selectedItem]);
    if (!selectedItem || !editedItem) {
        return null;
    }
    const handleSave = () => {
        if (selectedItem.type === 'action') {
            onActionUpdate(editedItem);
        }
        else if (selectedItem.type === 'skill') {
            onSkillUpdate(editedItem);
        }
        else if (selectedItem.type === 'knowledge') {
            onKnowledgeUpdate(editedItem);
        }
        else if (selectedItem.type === 'tool') {
            onToolUpdate(editedItem);
        }
    };
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            onDelete();
        }
    };
    return (_jsxs("div", { className: "w-80 overflow-auto border-l border-gray-200 bg-white p-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Properties" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: "\u2715" })] }), _jsxs("div", { className: "space-y-4", children: [selectedItem.type === 'action' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Action Name" }), _jsx("input", { type: "text", value: editedItem.name, onChange: (e) => setEditedItem({ ...editedItem, name: e.target.value }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Source ID (SBP Task)" }), _jsx("input", { type: "text", value: editedItem.source_id, disabled: true, className: "mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Read-only reference" })] })] })), selectedItem.type === 'skill' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Skill Name" }), _jsx("input", { type: "text", value: editedItem.name, onChange: (e) => setEditedItem({ ...editedItem, name: e.target.value }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Learnings" }), (editedItem.learnings || []).map((learning, idx) => (_jsxs("div", { className: "mt-2 rounded border border-gray-200 p-2", children: [_jsx("input", { type: "text", value: learning.title, onChange: (e) => {
                                                    const updated = [...(editedItem.learnings || [])];
                                                    updated[idx] = { ...learning, title: e.target.value };
                                                    setEditedItem({ ...editedItem, learnings: updated });
                                                }, placeholder: "Title", className: "w-full rounded border border-gray-300 px-2 py-1 text-sm" }), _jsx("input", { type: "text", value: learning.url, onChange: (e) => {
                                                    const updated = [...(editedItem.learnings || [])];
                                                    updated[idx] = { ...learning, url: e.target.value };
                                                    setEditedItem({ ...editedItem, learnings: updated });
                                                }, placeholder: "URL", className: "mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm" }), _jsx("button", { onClick: () => {
                                                    const updated = (editedItem.learnings || []).filter((_, i) => i !== idx);
                                                    setEditedItem({ ...editedItem, learnings: updated });
                                                }, className: "mt-1 text-xs text-red-600 hover:text-red-800", children: "Remove" })] }, idx))), _jsx("button", { onClick: () => {
                                            const updated = [
                                                ...(editedItem.learnings || []),
                                                { title: '', url: '' },
                                            ];
                                            setEditedItem({ ...editedItem, learnings: updated });
                                        }, className: "mt-2 text-sm text-blue-600 hover:text-blue-800", children: "+ Add Learning" })] })] })), selectedItem.type === 'knowledge' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Knowledge Name" }), _jsx("input", { type: "text", value: editedItem.name, onChange: (e) => setEditedItem({ ...editedItem, name: e.target.value }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "URL" }), _jsx("input", { type: "text", value: editedItem.url, onChange: (e) => setEditedItem({ ...editedItem, url: e.target.value }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] })] })), selectedItem.type === 'tool' && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Tool Name" }), _jsx("input", { type: "text", value: editedItem.name, onChange: (e) => setEditedItem({ ...editedItem, name: e.target.value }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "URL" }), _jsx("input", { type: "text", value: editedItem.url, onChange: (e) => setEditedItem({ ...editedItem, url: e.target.value }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2" })] })] })), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleSave, className: "flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700", children: "Save" }), _jsx("button", { onClick: handleDelete, className: "rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700", children: "Delete" })] })] })] }));
}
