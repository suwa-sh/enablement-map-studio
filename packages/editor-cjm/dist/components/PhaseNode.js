import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Paper, Typography } from '@mui/material';
export const PhaseNode = memo(({ data }) => {
    return (_jsxs(_Fragment, { children: [_jsx(Paper, { elevation: data.selected ? 8 : 2, onClick: data.onSelect, sx: {
                    p: 2,
                    minWidth: 200,
                    cursor: 'pointer',
                    border: data.selected ? 2 : 0,
                    borderColor: 'primary.main',
                    bgcolor: 'primary.lighter',
                    '&:hover': {
                        elevation: 4,
                    },
                }, children: _jsx(Typography, { variant: "h6", fontWeight: "bold", children: data.phase.name }) }), _jsx(Handle, { type: "source", position: Position.Bottom })] }));
});
PhaseNode.displayName = 'PhaseNode';
