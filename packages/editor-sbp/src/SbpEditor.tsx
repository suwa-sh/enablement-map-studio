import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import type { SbpTask, SbpLane } from '@enablement-map-studio/dsl';
import { SbpCanvas } from './components/SbpCanvas';
import { PropertyPanel } from './components/PropertyPanel';
import {
  isInputFocused,
  deleteLaneWithRelatedData,
  deleteTaskWithRelatedData,
} from './utils/deletion';
import { findNonOverlappingPosition } from './utils/positioning';

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
        id: `sbp:${Date.now()}`,
        lanes: [cjmLane],
        tasks: [],
        connections: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sbp, cjm]);

  // グローバルキーボードイベントリスナー（Delete/Backspaceキーで削除）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は処理しない
      if (isInputFocused()) {
        return;
      }

      // Delete または Backspace キーが押された場合
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLaneId && sbp) {
          e.preventDefault();
          updateSbp(deleteLaneWithRelatedData(sbp, selectedLaneId));
          setSelectedLaneId(null);
        } else if (selectedTask && sbp) {
          e.preventDefault();
          updateSbp(deleteTaskWithRelatedData(sbp, selectedTask.id));
          setSelectedTask(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedLaneId, selectedTask, sbp, updateSbp]);

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
    updateSbp(deleteTaskWithRelatedData(sbp, taskId));
    setSelectedTask(null);
  };

  const handleLaneDelete = (laneId: string) => {
    if (!sbp) return;
    updateSbp(deleteLaneWithRelatedData(sbp, laneId));
    setSelectedLaneId(null);
  };


  const handleSbpUpdate = (updatedSbp: typeof sbp) => {
    if (updatedSbp) {
      updateSbp(updatedSbp);
    }
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
        id: `sbp:${Date.now()}`,
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

    // 既存タスクと重ならない位置を計算
    const position = findNonOverlappingPosition(sbp.tasks, laneId);

    const newTask: SbpTask = {
      id: generateId('sbp', 'task'),
      name: taskName,
      lane: laneId,
      position,
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
            disabled
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
