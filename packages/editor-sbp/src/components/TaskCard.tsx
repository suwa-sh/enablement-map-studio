import { Box, Card, Typography, Chip, Button } from '@mui/material';
import { Close } from '@mui/icons-material';
import type { SbpTask, SbpConnection, CjmDsl } from '@enablement-map-studio/dsl';

interface TaskCardProps {
  task: SbpTask;
  allTasks: SbpTask[];
  connections: SbpConnection[];
  cjm: CjmDsl | null;
  isSelected: boolean;
  isConnectingTarget: boolean;
  onTaskClick: () => void;
  onConnectStart: () => void;
  onConnect: (toTaskId: string) => void;
  onDisconnect: (fromTaskId: string, toTaskId: string) => void;
}

export function TaskCard({
  task,
  allTasks,
  connections,
  cjm,
  isSelected,
  isConnectingTarget,
  onTaskClick,
  onConnectStart,
  onConnect,
  onDisconnect,
}: TaskCardProps) {
  // Get CJM action name if this is a reference
  const cjmAction = task.source_id && cjm
    ? cjm.actions.find((a) => a.id === task.source_id)
    : null;

  const isReadonly = task.readonly || !!cjmAction;

  const handleCardClick = () => {
    if (isConnectingTarget) {
      onConnect(task.id);
    } else {
      onTaskClick();
    }
  };

  // Get connected task IDs from connections array
  const connectedTaskIds = connections
    .filter((conn) => conn.source === task.id)
    .map((conn) => conn.target);

  return (
    <Box sx={{ minWidth: 250, flexShrink: 0 }}>
      <Card
        onClick={handleCardClick}
        sx={{
          p: 2,
          cursor: 'pointer',
          border: 2,
          borderColor: isSelected ? 'primary.main' : isReadonly ? 'grey.300' : 'grey.300',
          bgcolor: isSelected ? 'primary.lighter' : isReadonly ? 'grey.50' : 'white',
          boxShadow: isSelected ? 4 : 1,
          transition: 'all 0.2s',
          '&:hover': isReadonly ? {} : { borderColor: 'primary.light' },
          ...(isConnectingTarget && {
            boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.3)',
          }),
        }}
      >
        {/* Task name */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">{task.name}</Typography>
          {cjmAction && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              From CJM: {cjmAction.name}
            </Typography>
          )}
        </Box>

        {/* Readonly indicator */}
        {isReadonly && (
          <Box sx={{ mb: 1 }}>
            <Chip label="Read-only" size="small" variant="outlined" />
          </Box>
        )}

        {/* Connection count */}
        {connectedTaskIds.length > 0 && (
          <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              → {connectedTaskIds.length} connection(s)
            </Typography>
          </Box>
        )}

        {/* Connected task badges */}
        {connectedTaskIds.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {connectedTaskIds.map((connectedId) => {
              const connectedTask = allTasks.find((t) => t.id === connectedId);
              return (
                <Chip
                  key={connectedId}
                  label={connectedTask?.name || connectedId}
                  size="small"
                  onDelete={(e) => {
                    e.stopPropagation();
                    onDisconnect(task.id, connectedId);
                  }}
                  deleteIcon={<Close />}
                  color="primary"
                  variant="outlined"
                  sx={{ maxWidth: '100%' }}
                />
              );
            })}
          </Box>
        )}
      </Card>

      {/* Connect button */}
      {!isReadonly && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onConnectStart();
          }}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mt: 1, borderStyle: 'dashed' }}
        >
          Connect to...
        </Button>
      )}
    </Box>
  );
}
