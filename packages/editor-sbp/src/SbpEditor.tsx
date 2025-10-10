import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import type { SbpTask, SbpLane } from '@enablement-map-studio/dsl';
import { SbpCanvas } from './components/SbpCanvas';
import { PropertyPanel } from './components/PropertyPanel';

export function SbpEditor() {
  const sbp = useAppStore((state) => state.sbp);
  const cjm = useAppStore((state) => state.cjm);
  const updateSbp = useAppStore((state) => state.updateSbp);

  const [selectedTask, setSelectedTask] = useState<SbpTask | null>(null);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);

  // Always get the latest lane data from the store
  const selectedLane = selectedLaneId ? sbp.lanes.find(lane => lane.id === selectedLaneId) || null : null;

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
    // Don't update selectedLane to avoid re-rendering PropertyPanel with stale data
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
    setSelectedLaneId(null);
  };


  const handleSbpUpdate = (updatedSbp: typeof sbp) => {
    updateSbp(updatedSbp);
  };

  const handleLaneAdd = () => {
    const newLane: SbpLane = {
      id: generateId('sbp', 'lane'),
      name: '新しいレーン',
      kind: 'team',
    };
    updateSbp({ ...sbp, lanes: [...sbp.lanes, newLane] });
    setSelectedLaneId(newLane.id);
  };

  const handleLaneReorder = (reorderedLanes: SbpLane[]) => {
    updateSbp({ ...sbp, lanes: reorderedLanes });
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <SbpCanvas
          sbp={sbp}
          cjm={cjm}
          selectedTask={selectedTask}
          selectedLane={selectedLane}
          onTaskSelect={setSelectedTask}
          onLaneSelect={(lane) => setSelectedLaneId(lane.id)}
          onTaskUpdate={handleTaskUpdate}
          onLaneUpdate={handleLaneUpdate}
          onLaneAdd={handleLaneAdd}
          onLaneReorder={handleLaneReorder}
          onSbpUpdate={handleSbpUpdate}
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
          setSelectedLaneId(null);
        }}
      />
    </Box>
  );
}
