import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Box, Typography } from '@mui/material';
const LANE_COLORS = {
    cjm: '#e3f2fd', // Blue (Customer Journey)
    human: '#fff3e0', // Orange (Human)
    team: '#f3e5f5', // Purple (Team)
    system: '#e8f5e9', // Green (System)
};
export const LaneNode = memo(({ data, selected }) => {
    const { lane, onResize, onResizeEnd } = data;
    const bgColor = LANE_COLORS[lane.kind] || '#f5f5f5';
    return (_jsxs(_Fragment, { children: [_jsx(NodeResizer, { minWidth: 800, minHeight: 150, maxHeight: 400, isVisible: selected, color: "#1976d2", lineStyle: { borderWidth: 2 }, onResize: onResize, onResizeEnd: onResizeEnd }), _jsx(Box, { sx: {
                    width: '100%',
                    height: '100%',
                    bgcolor: bgColor,
                    border: '2px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    position: 'relative',
                    overflow: 'visible',
                }, children: _jsx(Box, { sx: {
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 1,
                    }, children: _jsx(Typography, { variant: "body2", fontWeight: "bold", color: "text.secondary", children: lane.name }) }) })] }));
});
LaneNode.displayName = 'LaneNode';
