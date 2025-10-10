import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, Typography, Chip, Button } from '@mui/material';
import { Close } from '@mui/icons-material';
export function TaskCard({ task, allTasks, cjm, isSelected, isConnectingTarget, onTaskClick, onConnectStart, onConnect, onDisconnect, }) {
    // Get CJM action name if this is a reference
    const cjmAction = task.source_id && cjm
        ? cjm.actions.find((a) => a.id === task.source_id)
        : null;
    const isReadonly = task.readonly || !!cjmAction;
    const handleCardClick = () => {
        if (isConnectingTarget) {
            onConnect(task.id);
        }
        else {
            onTaskClick();
        }
    };
    const connectedTasks = task.link_to || [];
    return (_jsxs(Box, { sx: { minWidth: 250, flexShrink: 0 }, children: [_jsxs(Card, { onClick: handleCardClick, sx: {
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
                }, children: [_jsxs(Box, { sx: { mb: 1 }, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", children: task.name }), cjmAction && (_jsxs(Typography, { variant: "caption", color: "text.secondary", display: "block", sx: { mt: 0.5 }, children: ["From CJM: ", cjmAction.name] }))] }), isReadonly && (_jsx(Box, { sx: { mb: 1 }, children: _jsx(Chip, { label: "Read-only", size: "small", variant: "outlined" }) })), connectedTasks.length > 0 && (_jsx(Box, { sx: { mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }, children: _jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["\u2192 ", connectedTasks.length, " connection(s)"] }) })), connectedTasks.length > 0 && (_jsx(Box, { sx: { mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }, children: connectedTasks.map((connectedId) => {
                            const connectedTask = allTasks.find((t) => t.id === connectedId);
                            return (_jsx(Chip, { label: connectedTask?.name || connectedId, size: "small", onDelete: (e) => {
                                    e.stopPropagation();
                                    onDisconnect(task.id, connectedId);
                                }, deleteIcon: _jsx(Close, {}), color: "primary", variant: "outlined", sx: { maxWidth: '100%' } }, connectedId));
                        }) }))] }), !isReadonly && (_jsx(Button, { onClick: (e) => {
                    e.stopPropagation();
                    onConnectStart();
                }, variant: "outlined", size: "small", fullWidth: true, sx: { mt: 1, borderStyle: 'dashed' }, children: "Connect to..." }))] }));
}
