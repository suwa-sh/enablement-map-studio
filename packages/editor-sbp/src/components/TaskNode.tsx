import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Box, Typography, Paper } from '@mui/material';
import type { SbpTask } from '@enablement-map-studio/dsl';

// グローバルスタイルを追加（ハンドルのホバー表示）
if (typeof document !== 'undefined') {
  const styleId = 'task-node-handle-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .task-node-wrapper:hover .task-node-handle {
        opacity: 1 !important;
      }
      .react-flow__handle.task-node-handle.connecting {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export interface TaskNodeData {
  task: SbpTask;
  isReadonly: boolean;
  isSelected: boolean;
}

export const TaskNode = memo(({ data, selected }: NodeProps) => {
  const { task, isReadonly } = data as unknown as TaskNodeData;

  // 統一されたハンドルスタイル: グレーの丸
  // opacity: 0 でデフォルト非表示（CSSでホバー時に表示）
  const handleStyle = {
    background: '#9e9e9e',
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '2px solid white',
    opacity: 0,
    transition: 'opacity 0.2s',
  };

  return (
    <Box
      sx={{ position: 'relative' }}
      className="task-node-wrapper"
    >
      {/* すべてのハンドルで source と target の両方を許可（双方向接続） */}
      {/* Top Handle */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={handleStyle}
        className="task-node-handle"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={handleStyle}
        className="task-node-handle"
      />

      {/* Left Handle */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={handleStyle}
        className="task-node-handle"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={handleStyle}
        className="task-node-handle"
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

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={handleStyle}
        className="task-node-handle"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={handleStyle}
        className="task-node-handle"
      />

      {/* Right Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={handleStyle}
        className="task-node-handle"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={handleStyle}
        className="task-node-handle"
      />
    </Box>
  );
});

TaskNode.displayName = 'TaskNode';
