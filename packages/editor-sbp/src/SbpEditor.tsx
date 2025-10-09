import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';
import type { SbpTask, SbpLane } from '@enablement-map-studio/dsl';
import { SbpCanvas } from './components/SbpCanvas';
import { PropertyPanel } from './components/PropertyPanel';

export function SbpEditor() {
  const sbp = useAppStore((state) => state.sbp);
  const cjm = useAppStore((state) => state.cjm);
  const updateSbp = useAppStore((state) => state.updateSbp);

  const [selectedTask, setSelectedTask] = useState<SbpTask | null>(null);
  const [selectedLane, setSelectedLane] = useState<SbpLane | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  if (!sbp) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No SBP data loaded. Please load a YAML file.</Typography>
      </Box>
    );
  }

  const handleTaskUpdate = (updatedTask: SbpTask) => {
    const updatedTasks = sbp.tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    updateSbp({ ...sbp, tasks: updatedTasks });
    setSelectedTask(updatedTask);
  };

  const handleLaneUpdate = (updatedLane: SbpLane) => {
    const updatedLanes = sbp.lanes.map((lane) =>
      lane.id === updatedLane.id ? updatedLane : lane
    );
    updateSbp({ ...sbp, lanes: updatedLanes });
    setSelectedLane(updatedLane);
  };

  const handleTaskDelete = (taskId: string) => {
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

  const handleLaneDelete = (laneId: string) => {
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

  const handleTaskConnect = (fromTaskId: string, toTaskId: string) => {
    const fromTask = sbp.tasks.find((t) => t.id === fromTaskId);
    if (!fromTask) return;

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

  const handleTaskDisconnect = (fromTaskId: string, toTaskId: string) => {
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

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <SbpCanvas
          sbp={sbp}
          cjm={cjm}
          selectedTask={selectedTask}
          selectedLane={selectedLane}
          connectingFrom={connectingFrom}
          onTaskSelect={setSelectedTask}
          onLaneSelect={setSelectedLane}
          onTaskUpdate={handleTaskUpdate}
          onLaneUpdate={handleLaneUpdate}
          onConnectStart={setConnectingFrom}
          onConnect={handleTaskConnect}
          onDisconnect={handleTaskDisconnect}
        />
      </Box>
      <PropertyPanel
        selectedTask={selectedTask}
        selectedLane={selectedLane}
        onTaskUpdate={handleTaskUpdate}
        onLaneUpdate={handleLaneUpdate}
        onTaskDelete={handleTaskDelete}
        onLaneDelete={handleLaneDelete}
        onClose={() => {
          setSelectedTask(null);
          setSelectedLane(null);
        }}
      />
    </Box>
  );
}
