import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import { SbpCanvas } from './components/SbpCanvas';
import { PropertyPanel } from './components/PropertyPanel';
export function SbpEditor() {
    const sbp = useAppStore((state) => state.state.sbp);
    const cjm = useAppStore((state) => state.state.cjm);
    const updateSbp = useAppStore((state) => state.updateSbp);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedLaneId, setSelectedLaneId] = useState(null);
    // Always get the latest lane data from the store
    const selectedLane = selectedLaneId && sbp ? sbp.lanes.find(lane => lane.id === selectedLaneId) || null : null;
    // CJMが存在する場合は自動的にCJMレーンを含むSBPを初期化
    useEffect(() => {
        if (!sbp && cjm) {
            const cjmLane = {
                id: generateId('sbp', 'lane'),
                name: 'Customer Journey',
                kind: 'cjm',
            };
            updateSbp({
                kind: 'sbp',
                version: '1.0',
                id: `sbp:${Date.now()}`,
                lanes: [cjmLane],
                tasks: [],
                connections: [],
            });
        }
    }, [sbp, cjm, updateSbp]);
    const handleTaskUpdate = (updatedTask) => {
        if (!sbp)
            return;
        const updatedTasks = sbp.tasks.map((task) => task.id === updatedTask.id ? updatedTask : task);
        updateSbp({ ...sbp, tasks: updatedTasks });
        setSelectedTask(updatedTask);
    };
    const handleLaneUpdate = (updatedLane) => {
        if (!sbp)
            return;
        const updatedLanes = sbp.lanes.map((lane) => lane.id === updatedLane.id ? updatedLane : lane);
        updateSbp({ ...sbp, lanes: updatedLanes });
        // Don't update selectedLane to avoid re-rendering PropertyPanel with stale data
    };
    const handleTaskDelete = (taskId) => {
        if (!sbp)
            return;
        // Remove task and all connections to it
        const updatedTasks = sbp.tasks.filter((task) => task.id !== taskId);
        const updatedConnections = sbp.connections.filter((conn) => conn.source !== taskId && conn.target !== taskId);
        updateSbp({ ...sbp, tasks: updatedTasks, connections: updatedConnections });
        setSelectedTask(null);
    };
    const handleLaneDelete = (laneId) => {
        if (!sbp)
            return;
        // Delete lane and all its tasks
        const updatedLanes = sbp.lanes.filter((lane) => lane.id !== laneId);
        const deletedTaskIds = sbp.tasks
            .filter((task) => task.lane === laneId)
            .map((task) => task.id);
        const updatedTasks = sbp.tasks.filter((task) => task.lane !== laneId);
        const updatedConnections = sbp.connections.filter((conn) => !deletedTaskIds.includes(conn.source) && !deletedTaskIds.includes(conn.target));
        updateSbp({ ...sbp, lanes: updatedLanes, tasks: updatedTasks, connections: updatedConnections });
        setSelectedLaneId(null);
    };
    const handleSbpUpdate = (updatedSbp) => {
        if (updatedSbp) {
            updateSbp(updatedSbp);
        }
    };
    const handleLaneAdd = () => {
        const newLane = {
            id: generateId('sbp', 'lane'),
            name: '新しいレーン',
            kind: 'team',
        };
        // sbpがnullの場合は初期化してから追加
        if (!sbp) {
            updateSbp({
                kind: 'sbp',
                version: '1.0',
                id: `sbp:${Date.now()}`,
                lanes: [newLane],
                tasks: [],
                connections: [],
            });
        }
        else {
            updateSbp({ ...sbp, lanes: [...sbp.lanes, newLane] });
        }
        setSelectedLaneId(newLane.id);
    };
    const handleLaneReorder = (reorderedLanes) => {
        if (!sbp)
            return;
        updateSbp({ ...sbp, lanes: reorderedLanes });
    };
    const handleTaskAdd = (laneId, taskName) => {
        if (!sbp)
            return;
        const newTask = {
            id: generateId('sbp', 'task'),
            name: taskName,
            lane: laneId,
            position: { x: 100, y: 100 },
        };
        updateSbp({ ...sbp, tasks: [...sbp.tasks, newTask] });
        setSelectedTask(newTask);
    };
    // 空状態の表示（SBPが存在しない場合）
    if (!sbp) {
        return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', height: '100%', p: 3 }, children: [_jsxs(Stack, { direction: "row", spacing: 2, sx: { mb: 2 }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleLaneAdd, children: "\u30EC\u30FC\u30F3\u8FFD\u52A0" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), disabled: true, children: "\u30BF\u30B9\u30AF\u8FFD\u52A0" })] }), _jsx(Box, { sx: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }, children: _jsx(Typography, { color: "text.secondary", children: "CJM\u3092\u4F5C\u6210\u3059\u308B \u304B YAML \u3092\u30ED\u30FC\u30C9\u3057\u3066\u304F\u3060\u3055\u3044" }) })] }));
    }
    return (_jsxs(Box, { sx: { display: 'flex', height: '100%' }, children: [_jsx(Box, { sx: { flex: 1, overflow: 'hidden' }, children: _jsx(SbpCanvas, { sbp: sbp, cjm: cjm, selectedTask: selectedTask, selectedLane: selectedLane, onTaskSelect: setSelectedTask, onLaneSelect: (lane) => setSelectedLaneId(lane.id), onTaskUpdate: handleTaskUpdate, onLaneUpdate: handleLaneUpdate, onLaneAdd: handleLaneAdd, onTaskAdd: handleTaskAdd, onLaneReorder: handleLaneReorder, onSbpUpdate: handleSbpUpdate }) }), _jsx(PropertyPanel, { selectedTask: selectedTask, selectedLane: selectedLane, onTaskUpdate: handleTaskUpdate, onLaneUpdate: handleLaneUpdate, onTaskDelete: handleTaskDelete, onLaneDelete: handleLaneDelete, onClose: () => {
                    setSelectedTask(null);
                    setSelectedLaneId(null);
                } })] }));
}
