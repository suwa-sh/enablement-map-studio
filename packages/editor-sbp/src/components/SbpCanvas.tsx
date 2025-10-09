import { Box, Stack } from '@mui/material';
import type { SbpDsl, SbpTask, SbpLane, CjmDsl } from '@enablement-map-studio/dsl';
import { LaneRow } from './LaneRow';

interface SbpCanvasProps {
  sbp: SbpDsl;
  cjm: CjmDsl | null;
  selectedTask: SbpTask | null;
  selectedLane: SbpLane | null;
  connectingFrom: string | null;
  onTaskSelect: (task: SbpTask) => void;
  onLaneSelect: (lane: SbpLane) => void;
  onTaskUpdate: (task: SbpTask) => void;
  onLaneUpdate: (lane: SbpLane) => void;
  onConnectStart: (taskId: string) => void;
  onConnect: (fromTaskId: string, toTaskId: string) => void;
  onDisconnect: (fromTaskId: string, toTaskId: string) => void;
}

export function SbpCanvas({
  sbp,
  cjm,
  selectedTask,
  selectedLane,
  connectingFrom,
  onTaskSelect,
  onLaneSelect,
  onConnectStart,
  onConnect,
  onDisconnect,
}: SbpCanvasProps) {
  return (
    <Box sx={{ height: '100%', bgcolor: 'grey.50', p: 3 }}>
      <Stack spacing={2}>
        {sbp.lanes.map((lane) => {
          const laneTasks = sbp.tasks.filter((task) => task.lane === lane.id);

          return (
            <LaneRow
              key={lane.id}
              lane={lane}
              tasks={laneTasks}
              allTasks={sbp.tasks}
              cjm={cjm}
              isSelected={selectedLane?.id === lane.id}
              selectedTaskId={selectedTask?.id}
              connectingFrom={connectingFrom}
              onLaneClick={() => onLaneSelect(lane)}
              onTaskClick={onTaskSelect}
              onConnectStart={onConnectStart}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
