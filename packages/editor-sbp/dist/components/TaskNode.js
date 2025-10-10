import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Typography, Paper } from '@mui/material';
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
export const TaskNode = memo(({ data, selected }) => {
    const { task, isReadonly } = data;
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
    return (_jsxs(Box, { sx: { position: 'relative' }, className: "task-node-wrapper", children: [_jsx(Handle, { type: "source", position: Position.Top, id: "top", style: handleStyle, className: "task-node-handle" }), _jsx(Handle, { type: "target", position: Position.Top, id: "top", style: handleStyle, className: "task-node-handle" }), _jsx(Handle, { type: "source", position: Position.Left, id: "left", style: handleStyle, className: "task-node-handle" }), _jsx(Handle, { type: "target", position: Position.Left, id: "left", style: handleStyle, className: "task-node-handle" }), _jsxs(Paper, { elevation: selected ? 8 : 2, sx: {
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
                }, children: [_jsx(Typography, { variant: "body2", fontWeight: selected ? 'bold' : 'normal', color: isReadonly ? 'text.secondary' : 'text.primary', sx: {
                            wordBreak: 'break-word',
                            userSelect: 'none',
                        }, children: task.name }), isReadonly && (_jsx(Typography, { variant: "caption", color: "text.disabled", sx: { display: 'block', mt: 0.5 }, children: "(CJM\u9023\u52D5)" }))] }), _jsx(Handle, { type: "source", position: Position.Bottom, id: "bottom", style: handleStyle, className: "task-node-handle" }), _jsx(Handle, { type: "target", position: Position.Bottom, id: "bottom", style: handleStyle, className: "task-node-handle" }), _jsx(Handle, { type: "source", position: Position.Right, id: "right", style: handleStyle, className: "task-node-handle" }), _jsx(Handle, { type: "target", position: Position.Right, id: "right", style: handleStyle, className: "task-node-handle" })] }));
});
TaskNode.displayName = 'TaskNode';
