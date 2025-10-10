import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Typography, Paper } from '@mui/material';
export const TaskNode = memo(({ data, selected }) => {
    const { task, isReadonly } = data;
    const handleStyle = {
        background: '#555',
        width: 10,
        height: 10,
        border: '2px solid white',
    };
    return (_jsxs(Box, { sx: { position: 'relative' }, children: [_jsx(Handle, { type: "target", position: Position.Top, id: "top", style: handleStyle }), _jsx(Handle, { type: "target", position: Position.Left, id: "left", style: handleStyle }), _jsxs(Paper, { elevation: selected ? 8 : 2, sx: {
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
                        }, children: task.name }), isReadonly && (_jsx(Typography, { variant: "caption", color: "text.disabled", sx: { display: 'block', mt: 0.5 }, children: "(CJM\u9023\u52D5)" }))] }), _jsx(Handle, { type: "source", position: Position.Bottom, id: "bottom", style: handleStyle }), _jsx(Handle, { type: "source", position: Position.Right, id: "right", style: handleStyle })] }));
});
TaskNode.displayName = 'TaskNode';
