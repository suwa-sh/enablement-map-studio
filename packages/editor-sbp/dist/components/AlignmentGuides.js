import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
export const AlignmentGuides = memo(({ lines, viewportWidth, viewportHeight }) => {
    if (lines.length === 0)
        return null;
    return (_jsx("svg", { style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
        }, children: lines.map((line) => {
            if (line.type === 'horizontal') {
                // 水平ガイドライン
                return (_jsx("line", { x1: 0, y1: line.position, x2: viewportWidth, y2: line.position, stroke: "#2196f3", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.6 }, line.id));
            }
            else {
                // 垂直ガイドライン
                return (_jsx("line", { x1: line.position, y1: 0, x2: line.position, y2: viewportHeight, stroke: "#2196f3", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.6 }, line.id));
            }
        }) }));
});
AlignmentGuides.displayName = 'AlignmentGuides';
