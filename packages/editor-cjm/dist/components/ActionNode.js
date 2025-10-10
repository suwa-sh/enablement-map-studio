import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Paper, Typography, Box, Chip } from '@mui/material';
const getEmotionColor = (score) => {
    if (score >= 2)
        return '#4caf50'; // green
    if (score === 1)
        return '#8bc34a'; // light green
    if (score === 0)
        return '#ff9800'; // orange
    if (score === -1)
        return '#ff5722'; // deep orange
    return '#f44336'; // red
};
const getEmotionLabel = (score) => {
    if (score >= 2)
        return 'Very Positive';
    if (score === 1)
        return 'Positive';
    if (score === 0)
        return 'Neutral';
    if (score === -1)
        return 'Negative';
    return 'Very Negative';
};
export const ActionNode = memo(({ data }) => {
    const emotionColor = getEmotionColor(data.action.emotion_score);
    const emotionLabel = getEmotionLabel(data.action.emotion_score);
    return (_jsxs(_Fragment, { children: [_jsx(Handle, { type: "target", position: Position.Top }), _jsxs(Paper, { elevation: data.selected ? 8 : 2, onClick: data.onSelect, sx: {
                    p: 2,
                    minWidth: 250,
                    maxWidth: 300,
                    cursor: 'pointer',
                    border: data.selected ? 2 : 0,
                    borderColor: 'primary.main',
                    '&:hover': {
                        elevation: 4,
                    },
                }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "bold", gutterBottom: true, children: data.action.name }), _jsx(Chip, { label: emotionLabel, size: "small", sx: {
                            bgcolor: emotionColor,
                            color: 'white',
                            mb: 1,
                        } }), data.action.touchpoints && data.action.touchpoints.length > 0 && (_jsxs(Box, { mt: 1, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Touchpoints:" }), _jsx(Typography, { variant: "body2", children: data.action.touchpoints.join(', ') })] })), data.action.thoughts_feelings && data.action.thoughts_feelings.length > 0 && (_jsxs(Box, { mt: 1, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Thoughts & Feelings:" }), data.action.thoughts_feelings.slice(0, 2).map((item, idx) => (_jsxs(Typography, { variant: "body2", fontSize: "0.875rem", children: ["\u2022 ", item] }, idx))), data.action.thoughts_feelings.length > 2 && (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["+", data.action.thoughts_feelings.length - 2, " more"] }))] }))] })] }));
});
ActionNode.displayName = 'ActionNode';
