import { Box, Paper, Typography, Chip } from '@mui/material';
import type { SbpLane, SbpTask, CjmDsl } from '@enablement-map-studio/dsl';
import { TaskCard } from './TaskCard';

interface LaneRowProps {
  lane: SbpLane;
  tasks: SbpTask[];
  allTasks: SbpTask[];
  cjm: CjmDsl | null;
  isSelected: boolean;
  selectedTaskId?: string;
  connectingFrom: string | null;
  onLaneClick: () => void;
  onTaskClick: (task: SbpTask) => void;
  onConnectStart: (taskId: string) => void;
  onConnect: (fromTaskId: string, toTaskId: string) => void;
  onDisconnect: (fromTaskId: string, toTaskId: string) => void;
}

const getLaneColor = (kind: SbpLane['kind']): string => {
  switch (kind) {
    case 'cjm':
      return '#e3f2fd'; // blue-50
    case 'human':
      return '#e8f5e9'; // green-50
    case 'team':
      return '#f3e5f5'; // purple-50
    case 'system':
      return '#fafafa'; // grey-50
  }
};

export function LaneRow({
  lane,
  tasks,
  allTasks,
  cjm,
  isSelected,
  selectedTaskId,
  connectingFrom,
  onLaneClick,
  onTaskClick,
  onConnectStart,
  onConnect,
  onDisconnect,
}: LaneRowProps) {
  const bgColor = getLaneColor(lane.kind);

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Lane header */}
      <Box
        onClick={onLaneClick}
        sx={{
          p: 2,
          cursor: 'pointer',
          bgcolor: isSelected ? 'primary.lighter' : bgColor,
          borderBottom: isSelected ? 2 : 0,
          borderColor: 'primary.main',
          transition: 'all 0.2s',
          '&:hover': { bgcolor: isSelected ? 'primary.lighter' : bgColor, opacity: 0.9 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight="bold">{lane.name}</Typography>
          <Chip label={lane.kind.toUpperCase()} size="small" variant="outlined" />
        </Box>
      </Box>

      {/* Tasks in lane */}
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', p: 2 }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            allTasks={allTasks}
            cjm={cjm}
            isSelected={selectedTaskId === task.id}
            isConnectingTarget={connectingFrom !== null && connectingFrom !== task.id}
            onTaskClick={() => onTaskClick(task)}
            onConnectStart={() => onConnectStart(task.id)}
            onConnect={(toTaskId) => onConnect(task.id, toTaskId)}
            onDisconnect={onDisconnect}
          />
        ))}
      </Box>
    </Paper>
  );
}
