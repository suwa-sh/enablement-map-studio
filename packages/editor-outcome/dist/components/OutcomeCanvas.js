import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
export function OutcomeCanvas({ outcome, sbp, cjm, selectedPhaseId, onPhaseSelect, }) {
    // Get tasks to highlight based on selected phase
    const highlightedTaskIds = useMemo(() => {
        if (!selectedPhaseId || !cjm)
            return new Set();
        const phaseActions = cjm.actions
            .filter((action) => action.phase === selectedPhaseId)
            .map((action) => action.id);
        const tasks = sbp.tasks
            .filter((task) => task.source_id && phaseActions.includes(task.source_id))
            .map((task) => task.id);
        return new Set(tasks);
    }, [selectedPhaseId, cjm, sbp.tasks]);
    // Get the CSF source task
    const csfTask = sbp.tasks.find((task) => task.id === outcome.primary_csf.source_id);
    return (_jsxs("div", { className: "h-full bg-gray-50 p-6", children: [cjm && (_jsxs("div", { className: "mb-6 rounded-lg bg-white p-4 shadow", children: [_jsx("h2", { className: "mb-3 text-lg font-semibold text-gray-900", children: "Select CJM Phase" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => onPhaseSelect(null), className: `rounded px-3 py-2 text-sm ${selectedPhaseId === null
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: "All Phases" }), cjm.phases.map((phase) => (_jsx("button", { onClick: () => onPhaseSelect(phase.id), className: `rounded px-3 py-2 text-sm ${selectedPhaseId === phase.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: phase.name }, phase.id)))] })] })), _jsxs("div", { className: "rounded-lg bg-white p-4 shadow", children: [_jsx("h2", { className: "mb-4 text-lg font-semibold text-gray-900", children: "Service Blueprint" }), _jsx("div", { className: "space-y-4", children: sbp.lanes.map((lane) => {
                            const laneTasks = sbp.tasks.filter((task) => task.lane === lane.id);
                            return (_jsxs("div", { className: "rounded border border-gray-200 bg-gray-50 p-3", children: [_jsx("h3", { className: "mb-3 font-medium text-gray-700", children: lane.name }), _jsx("div", { className: "flex gap-3 overflow-x-auto", children: laneTasks.map((task) => {
                                            const isHighlighted = highlightedTaskIds.has(task.id);
                                            const isCsfTask = task.id === outcome.primary_csf.source_id;
                                            return (_jsxs("div", { className: `min-w-[200px] flex-shrink-0 rounded border-2 p-3 ${isCsfTask
                                                    ? 'border-green-500 bg-green-50'
                                                    : isHighlighted
                                                        ? 'border-blue-400 bg-blue-50'
                                                        : 'border-gray-200 bg-white'}`, children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: task.name }), isCsfTask && (_jsx("p", { className: "mt-1 text-xs font-semibold text-green-600", children: "\u2605 CSF Source" }))] }, task.id));
                                        }) })] }, lane.id));
                        }) })] }), csfTask && (_jsxs("div", { className: "mt-6 rounded-lg bg-green-50 p-4 shadow", children: [_jsx("h2", { className: "mb-2 text-lg font-semibold text-green-900", children: "Current CSF" }), _jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("strong", { children: "Task:" }), " ", csfTask.name] }), _jsxs("p", { className: "mt-1 text-sm text-gray-700", children: [_jsx("strong", { children: "Rationale:" }), " ", outcome.primary_csf.rationale] })] }))] }));
}
