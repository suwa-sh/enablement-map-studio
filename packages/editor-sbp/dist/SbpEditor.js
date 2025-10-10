import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';
import { SbpCanvas } from './components/SbpCanvas';
import { PropertyPanel } from './components/PropertyPanel';
export function SbpEditor() {
    const sbp = useAppStore((state) => state.sbp);
    const cjm = useAppStore((state) => state.cjm);
    const updateSbp = useAppStore((state) => state.updateSbp);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedLane, setSelectedLane] = useState(null);
    if (!sbp) {
        return (_jsx(Box, { sx: { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Typography, { color: "text.secondary", children: "No SBP data loaded. Please load a YAML file." }) }));
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
    const handleSbpUpdate = (updatedSbp) => {
        updateSbp(updatedSbp);
    };
    return (_jsxs(Box, { sx: { display: 'flex', height: '100%' }, children: [_jsx(Box, { sx: { flex: 1, overflow: 'hidden' }, children: _jsx(SbpCanvas, { sbp: sbp, cjm: cjm, selectedTask: selectedTask, selectedLane: selectedLane, onTaskSelect: setSelectedTask, onLaneSelect: setSelectedLane, onTaskUpdate: handleTaskUpdate, onLaneUpdate: handleLaneUpdate, onSbpUpdate: handleSbpUpdate }) }), _jsx(PropertyPanel, { selectedTask: selectedTask, selectedLane: selectedLane, onTaskUpdate: handleTaskUpdate, onLaneUpdate: handleLaneUpdate, onTaskDelete: handleTaskDelete, onLaneDelete: handleLaneDelete, onClose: () => {
                    setSelectedTask(null);
                    setSelectedLane(null);
                } })] }));
}
