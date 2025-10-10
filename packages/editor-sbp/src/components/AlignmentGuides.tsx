import { memo } from 'react';
import type { AlignmentLine } from '../hooks/useAlignmentGuides';

interface AlignmentGuidesProps {
  lines: AlignmentLine[];
  viewportWidth: number;
  viewportHeight: number;
}

export const AlignmentGuides = memo(({ lines, viewportWidth, viewportHeight }: AlignmentGuidesProps) => {
  if (lines.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {lines.map((line) => {
        if (line.type === 'horizontal') {
          // 水平ガイドライン
          return (
            <line
              key={line.id}
              x1={0}
              y1={line.position}
              x2={viewportWidth}
              y2={line.position}
              stroke="#2196f3"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.6}
            />
          );
        } else {
          // 垂直ガイドライン
          return (
            <line
              key={line.id}
              x1={line.position}
              y1={0}
              x2={line.position}
              y2={viewportHeight}
              stroke="#2196f3"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.6}
            />
          );
        }
      })}
    </svg>
  );
});

AlignmentGuides.displayName = 'AlignmentGuides';
