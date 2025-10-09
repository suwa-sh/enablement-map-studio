import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TaskCard } from './TaskCard';
const getLaneColor = (kind) => {
    switch (kind) {
        case 'cjm':
            return 'bg-blue-100 border-blue-300';
        case 'human':
            return 'bg-green-100 border-green-300';
        case 'team':
            return 'bg-purple-100 border-purple-300';
        case 'system':
            return 'bg-gray-100 border-gray-300';
    }
};
export function LaneRow({ lane, tasks, allTasks, cjm, isSelected, selectedTaskId, connectingFrom, onLaneClick, onTaskClick, onConnectStart, onConnect, onDisconnect, }) {
    const colorClass = getLaneColor(lane.kind);
    return (_jsxs("div", { className: "rounded-lg bg-white shadow", children: [_jsx("button", { onClick: onLaneClick, className: `w-full border-2 p-4 text-left font-semibold transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : `border-transparent ${colorClass}`}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: lane.name }), _jsx("span", { className: "text-xs uppercase text-gray-500", children: lane.kind })] }) }), _jsx("div", { className: "flex gap-4 overflow-x-auto p-4", children: tasks.map((task) => (_jsx(TaskCard, { task: task, allTasks: allTasks, cjm: cjm, isSelected: selectedTaskId === task.id, isConnectingTarget: connectingFrom !== null && connectingFrom !== task.id, onTaskClick: () => onTaskClick(task), onConnectStart: () => onConnectStart(task.id), onConnect: (toTaskId) => onConnect(task.id, toTaskId), onDisconnect: onDisconnect }, task.id))) })] }));
}
