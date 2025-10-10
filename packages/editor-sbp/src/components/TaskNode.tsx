import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Box, Typography, Paper } from '@mui/material';
import type { SbpTask } from '@enablement-map-studio/dsl';

export interface TaskNodeData {
  task: SbpTask;
  isReadonly: boolean;
  isSelected: boolean;
}

export const TaskNode = memo(({ data, selected }: NodeProps) => {
  const { task, isReadonly } = data as unknown as TaskNodeData;

  // 入力ハンドル: 青色の四角
  const inputHandleStyle = {
    background: '#2196f3',
    width: 10,
    height: 10,
    borderRadius: 2,
    border: '2px solid white',
  };

  // 出力ハンドル: 緑色の丸
  const outputHandleStyle = {
    background: '#4caf50',
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid white',
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Input handles: Top and Left */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={inputHandleStyle}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={inputHandleStyle}
      />

      <Paper
        elevation={selected ? 8 : 2}
        sx={{
          minWidth: 180,
          minHeight: 60,
          p: 2,
          bgcolor: isReadonly ? 'grey.200' : 'white',
          border: selected ? 2 : 1,
          borderColor: selected ? 'primary.main' : 'divider',
          cursor: isReadonly ? 'default' : 'grab',
          '&:hover': {
            borderColor: isReadonly ? 'divider' : 'primary.light',
          },
          transition: 'all 0.2s',
        }}
      >
        <Typography
          variant="body2"
          fontWeight={selected ? 'bold' : 'normal'}
          color={isReadonly ? 'text.secondary' : 'text.primary'}
          sx={{
            wordBreak: 'break-word',
            userSelect: 'none',
          }}
        >
          {task.name}
        </Typography>

        {isReadonly && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: 'block', mt: 0.5 }}
          >
            (CJM連動)
          </Typography>
        )}
      </Paper>

      {/* Output handles: Bottom and Right */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={outputHandleStyle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={outputHandleStyle}
      />
    </Box>
  );
});

TaskNode.displayName = 'TaskNode';
