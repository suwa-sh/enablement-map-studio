import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
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
    // Reserved for future drag & drop implementation
    // const handleTaskDrop = (taskId: string) => {
    //   const confirmUpdate =
    //     outcome.primary_csf.source_id === taskId ||
    //     window.confirm('This will replace the current CSF. Continue?');
    //
    //   if (confirmUpdate) {
    //     setEditedOutcome({
    //       ...editedOutcome,
    //       primary_csf: {
    //         ...editedOutcome.primary_csf,
    //         source_id: taskId,
    //       },
    //     });
    //   }
    // };
    const selectedTask = editedOutcome.primary_csf.source_id
        ? sbp.tasks.find((t) => t.id === editedOutcome.primary_csf.source_id)
        : null;
    return (_jsxs("div", { className: "w-96 overflow-auto border-l border-gray-200 bg-white p-6", children: [_jsx("h2", { className: "mb-6 text-lg font-semibold text-gray-900", children: "Outcome Definition" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "mb-2 text-sm font-semibold text-gray-700", children: "KGI (Key Goal Indicator)" }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600", children: "Name" }), _jsx("input", { type: "text", value: editedOutcome.kgi.name, onChange: (e) => setEditedOutcome({
                                            ...editedOutcome,
                                            kgi: { ...editedOutcome.kgi, name: e.target.value },
                                        }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "mb-2 text-sm font-semibold text-gray-700", children: "CSF (Critical Success Factor)" }), selectedTask && (_jsxs("div", { className: "mb-3 rounded border border-green-300 bg-green-50 p-3", children: [_jsx("p", { className: "text-xs font-medium text-green-900", children: "Source Task" }), _jsx("p", { className: "mt-1 text-sm text-gray-800", children: selectedTask.name })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600", children: "Rationale" }), _jsx("textarea", { value: editedOutcome.primary_csf.rationale, onChange: (e) => setEditedOutcome({
                                            ...editedOutcome,
                                            primary_csf: {
                                                ...editedOutcome.primary_csf,
                                                rationale: e.target.value,
                                            },
                                        }), rows: 3, className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" })] }), _jsx("div", { className: "mt-3 rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-center", children: _jsx("p", { className: "text-xs text-gray-500", children: "To change CSF source, select a task from the canvas above (Drag & drop not implemented in this version)" }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "mb-2 text-sm font-semibold text-gray-700", children: "KPI (Key Performance Indicator)" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600", children: "Name" }), _jsx("input", { type: "text", value: editedOutcome.primary_kpi.name, onChange: (e) => setEditedOutcome({
                                                    ...editedOutcome,
                                                    primary_kpi: {
                                                        ...editedOutcome.primary_kpi,
                                                        name: e.target.value,
                                                    },
                                                }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600", children: "Definition" }), _jsx("textarea", { value: editedOutcome.primary_kpi.definition || '', onChange: (e) => setEditedOutcome({
                                                    ...editedOutcome,
                                                    primary_kpi: {
                                                        ...editedOutcome.primary_kpi,
                                                        definition: e.target.value,
                                                    },
                                                }), rows: 2, placeholder: "Optional", className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600", children: "Unit" }), _jsx("input", { type: "text", value: editedOutcome.primary_kpi.unit || '', onChange: (e) => setEditedOutcome({
                                                            ...editedOutcome,
                                                            primary_kpi: {
                                                                ...editedOutcome.primary_kpi,
                                                                unit: e.target.value,
                                                            },
                                                        }), placeholder: "e.g., %", className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600", children: "Target" }), _jsx("input", { type: "number", value: editedOutcome.primary_kpi.target, onChange: (e) => setEditedOutcome({
                                                            ...editedOutcome,
                                                            primary_kpi: {
                                                                ...editedOutcome.primary_kpi,
                                                                target: Number(e.target.value),
                                                            },
                                                        }), className: "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" })] })] })] })] }), _jsx("button", { onClick: handleSave, className: "w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700", children: "Save Changes" })] })] }));
}
