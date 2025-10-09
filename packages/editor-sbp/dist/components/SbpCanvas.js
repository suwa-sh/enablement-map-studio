import { jsx as _jsx } from "react/jsx-runtime";
import { LaneRow } from './LaneRow';
export function SbpCanvas({ sbp, cjm, selectedTask, selectedLane, connectingFrom, onTaskSelect, onLaneSelect, onConnectStart, onConnect, onDisconnect, }) {
    return (_jsx("div", { className: "h-full bg-gray-50 p-6", children: _jsx("div", { className: "space-y-4", children: sbp.lanes.map((lane) => {
                const laneTasks = sbp.tasks.filter((task) => task.lane === lane.id);
                return (_jsx(LaneRow, { lane: lane, tasks: laneTasks, allTasks: sbp.tasks, cjm: cjm, isSelected: selectedLane?.id === lane.id, selectedTaskId: selectedTask?.id, connectingFrom: connectingFrom, onLaneClick: () => onLaneSelect(lane), onTaskClick: onTaskSelect, onConnectStart: onConnectStart, onConnect: onConnect, onDisconnect: onDisconnect }, lane.id));
            }) }) }));
}
