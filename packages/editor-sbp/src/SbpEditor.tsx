import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import type { SbpTask, SbpLane, SbpDsl } from '@enablement-map-studio/dsl';
import { SbpCanvas } from './components/SbpCanvas';
import { PropertyPanel } from './components/PropertyPanel';

export function SbpEditor() {
  const sbp = useAppStore((state) => state.state.sbp);
  const cjm = useAppStore((state) => state.state.cjm);
  const updateSbp = useAppStore((state) => state.updateSbp);

  const [selectedTask, setSelectedTask] = useState<SbpTask | null>(null);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);

  // Always get the latest lane data from the store
  const selectedLane = selectedLaneId && sbp ? sbp.lanes.find(lane => lane.id === selectedLaneId) || null : null;

  // CJMが存在する場合は自動的にCJMレーンを含むSBPを初期化
  useEffect(() => {
    if (!sbp && cjm) {
      const cjmLane: SbpLane = {
        id: generateId('sbp', 'lane'),
        name: 'Customer Journey',
        kind: 'cjm',
      };
      updateSbp({
        kind: 'sbp',
        version: '1.0',
        lanes: [cjmLane],
        tasks: [],
        connections: [],
      });
    }
  }, [sbp, cjm, updateSbp]);

  const handleTaskUpdate = (updatedTask: SbpTask) => {
    if (!sbp) return;
    const updatedTasks = sbp.tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    updateSbp({ ...sbp, tasks: updatedTasks });
    setSelectedTask(updatedTask);
  };

  const handleLaneUpdate = (updatedLane: SbpLane) => {
    if (!sbp) return;
    const updatedLanes = sbp.lanes.map((lane) =>
      lane.id === updatedLane.id ? updatedLane : lane
    );
    updateSbp({ ...sbp, lanes: updatedLanes });
    // Don't update selectedLane to avoid re-rendering PropertyPanel with stale data
  };

  const handleTaskDelete = (taskId: string) => {
    if (!sbp) return;
    // Remove task and all connections to it
    const updatedTasks = sbp.tasks.filter((task) => task.id !== taskId);
    const updatedConnections = sbp.connections.filter(
      (conn) => conn.source !== taskId && conn.target !== taskId
    );
    updateSbp({ ...sbp, tasks: updatedTasks, connections: updatedConnections });
    setSelectedTask(null);
  };

  const handleLaneDelete = (laneId: string) => {
    if (!sbp) return;
    // Delete lane and all its tasks
    const updatedLanes = sbp.lanes.filter((lane) => lane.id !== laneId);
    const deletedTaskIds = sbp.tasks
      .filter((task) => task.lane === laneId)
      .map((task) => task.id);
    const updatedTasks = sbp.tasks.filter((task) => task.lane !== laneId);
    const updatedConnections = sbp.connections.filter(
      (conn) => !deletedTaskIds.includes(conn.source) && !deletedTaskIds.includes(conn.target)
    );
    updateSbp({ ...sbp, lanes: updatedLanes, tasks: updatedTasks, connections: updatedConnections });
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

    // sbpがnullの場合は初期化してから追加
    if (!sbp) {
      updateSbp({
        kind: 'sbp',
        version: '1.0',
        lanes: [newLane],
        tasks: [],
        connections: [],
      });
    } else {
      updateSbp({ ...sbp, lanes: [...sbp.lanes, newLane] });
    }
    setSelectedLaneId(newLane.id);
  };

  const handleLaneReorder = (reorderedLanes: SbpLane[]) => {
    if (!sbp) return;
    updateSbp({ ...sbp, lanes: reorderedLanes });
  };

  const handleTaskAdd = (laneId: string, taskName: string) => {
    if (!sbp) return;
    const newTask: SbpTask = {
      id: generateId('sbp', 'task'),
      name: taskName,
      lane: laneId,
      connections: [],
      position: { x: 100, y: 100 },
    };
    updateSbp({ ...sbp, tasks: [...sbp.tasks, newTask] });
    setSelectedTask(newTask);
  };

  // 空状態の表示（SBPが存在しない場合）
  if (!sbp) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleLaneAdd}
          >
            レーン追加
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            disabled
          >
            タスク追加
          </Button>
        </Stack>
        <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">CJMを作成する か YAML をロードしてください</Typography>
        </Box>
      </Box>
    );
  }

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
          onTaskAdd={handleTaskAdd}
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
