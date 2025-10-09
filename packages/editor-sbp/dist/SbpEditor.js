import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAppStore } from '@enablement-map-studio/store';
import { SbpCanvas } from './components/SbpCanvas';
import { PropertyPanel } from './components/PropertyPanel';
export function SbpEditor() {
    const sbp = useAppStore((state) => state.sbp);
    const cjm = useAppStore((state) => state.cjm);
    const updateSbp = useAppStore((state) => state.updateSbp);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedLane, setSelectedLane] = useState(null);
    const [connectingFrom, setConnectingFrom] = useState(null);
    if (!sbp) {
        return (_jsx("div", { className: "flex h-full items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "No SBP data loaded. Please load a YAML file." }) }));
    }
    const handleTaskUpdate = (updatedTask) => {
        const updatedTasks = sbp.tasks.map((task) => task.id === updatedTask.id ? updatedTask : task);
        updateSbp({ ...sbp, tasks: updatedTasks });
        setSelectedTask(updatedTask);
    };
    const handleLaneUpdate = (updatedLane) => {
        const updatedLanes = sbp.lanes.map((lane) => lane.id === updatedLane.id ? updatedLane : lane);
        updateSbp({ ...sbp, lanes: updatedLanes });
        setSelectedLane(updatedLane);
    };
    const handleTaskDelete = (taskId) => {
        // Remove task and all connections to it
        const updatedTasks = sbp.tasks
            .filter((task) => task.id !== taskId)
            .map((task) => ({
            ...task,
            link_to: task.link_to?.filter((id) => id !== taskId),
        }));
        updateSbp({ ...sbp, tasks: updatedTasks });
        setSelectedTask(null);
    };
    const handleLaneDelete = (laneId) => {
        // Delete lane and all its tasks
        const updatedLanes = sbp.lanes.filter((lane) => lane.id !== laneId);
        const deletedTaskIds = sbp.tasks
            .filter((task) => task.lane === laneId)
            .map((task) => task.id);
        const updatedTasks = sbp.tasks
            .filter((task) => task.lane !== laneId)
            .map((task) => ({
            ...task,
            link_to: task.link_to?.filter((id) => !deletedTaskIds.includes(id)),
        }));
        updateSbp({ ...sbp, lanes: updatedLanes, tasks: updatedTasks });
        setSelectedLane(null);
    };
    const handleTaskConnect = (fromTaskId, toTaskId) => {
        const fromTask = sbp.tasks.find((t) => t.id === fromTaskId);
        if (!fromTask)
            return;
        const updatedTasks = sbp.tasks.map((task) => {
            if (task.id === fromTaskId) {
                const linkTo = task.link_to || [];
                if (!linkTo.includes(toTaskId)) {
                    return { ...task, link_to: [...linkTo, toTaskId] };
                }
            }
            return task;
        });
        updateSbp({ ...sbp, tasks: updatedTasks });
        setConnectingFrom(null);
    };
    const handleTaskDisconnect = (fromTaskId, toTaskId) => {
        const updatedTasks = sbp.tasks.map((task) => {
            if (task.id === fromTaskId) {
                return {
                    ...task,
                    link_to: task.link_to?.filter((id) => id !== toTaskId),
                };
            }
            return task;
        });
        updateSbp({ ...sbp, tasks: updatedTasks });
    };
    return (_jsxs("div", { className: "flex h-full", children: [_jsx("div", { className: "flex-1 overflow-auto", children: _jsx(SbpCanvas, { sbp: sbp, cjm: cjm, selectedTask: selectedTask, selectedLane: selectedLane, connectingFrom: connectingFrom, onTaskSelect: setSelectedTask, onLaneSelect: setSelectedLane, onTaskUpdate: handleTaskUpdate, onLaneUpdate: handleLaneUpdate, onConnectStart: setConnectingFrom, onConnect: handleTaskConnect, onDisconnect: handleTaskDisconnect }) }), _jsx(PropertyPanel, { selectedTask: selectedTask, selectedLane: selectedLane, onTaskUpdate: handleTaskUpdate, onLaneUpdate: handleLaneUpdate, onTaskDelete: handleTaskDelete, onLaneDelete: handleLaneDelete, onClose: () => {
                    setSelectedTask(null);
                    setSelectedLane(null);
                } })] }));
}
