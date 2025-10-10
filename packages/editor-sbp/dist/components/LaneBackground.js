import { jsx as _jsx } from "react/jsx-runtime";
import { Box, Typography } from '@mui/material';
// レーンの種類ごとの色
const LANE_COLORS = {
    cjm: '#e3f2fd', // 青（Customer Journey）
    human: '#fff3e0', // オレンジ（人間）
    team: '#f3e5f5', // 紫（チーム）
    system: '#e8f5e9', // 緑（システム）
};
export function LaneBackground({ lanes }) {
    return (_jsx(Box, { sx: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: -1,
        }, children: lanes.map((lane) => (_jsx(Box, { sx: {
                position: 'absolute',
                left: 0,
                top: lane.y,
                width: '100%',
                height: lane.height,
                bgcolor: LANE_COLORS[lane.kind] || '#fafafa',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'flex-start',
                pl: 2,
                pt: 1,
            }, children: _jsx(Typography, { variant: "subtitle2", fontWeight: "bold", color: "text.secondary", sx: {
                    pointerEvents: 'auto',
                    userSelect: 'none',
                }, children: lane.name }) }, lane.id))) }));
}
