import { useMemo } from 'react';
import type { CjmPhase, CjmAction } from '@enablement-map-studio/dsl';

interface EmotionCurveProps {
  phases: CjmPhase[];
  actions: CjmAction[];
}

export function EmotionCurve({ phases, actions }: EmotionCurveProps) {
  const curveData = useMemo(() => {
    // Sort actions by phase order
    const phaseOrder = new Map(phases.map((p, idx) => [p.id, idx]));
    const sortedActions = [...actions].sort(
      (a, b) => (phaseOrder.get(a.phase) ?? 0) - (phaseOrder.get(b.phase) ?? 0)
    );

    return sortedActions;
  }, [phases, actions]);

  if (curveData.length === 0) {
    return null;
  }

  // Calculate SVG path
  const width = 100; // percentage
  const height = 100;
  const padding = 10;

  const xStep = (width - padding * 2) / Math.max(curveData.length - 1, 1);
  const yScale = (height - padding * 2) / 4; // -2 to 2 range = 4 units
  const yCenter = height / 2;

  const pathPoints = curveData.map((action, idx) => {
    const x = padding + idx * xStep;
    const y = yCenter - action.emotion_score * yScale;
    return { x, y, score: action.emotion_score, name: action.name };
  });

  const linePath =
    pathPoints.length > 0
      ? pathPoints.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
      : '';

  return (
    <div className="h-full w-full p-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        {/* Center line (neutral emotion) */}
        <line
          x1={padding}
          y1={yCenter}
          x2={width - padding}
          y2={yCenter}
          stroke="#d1d5db"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />

        {/* Emotion curve */}
        <path d={linePath} stroke="#3b82f6" strokeWidth="2" fill="none" />

        {/* Data points */}
        {pathPoints.map((point, idx) => (
          <g key={idx}>
            <circle cx={point.x} cy={point.y} r="2" fill="#3b82f6">
              <title>{`${point.name}: ${point.score}`}</title>
            </circle>
          </g>
        ))}

        {/* Y-axis labels */}
        <text x={padding / 2} y={padding} fontSize="3" fill="#6b7280" textAnchor="middle">
          +2
        </text>
        <text x={padding / 2} y={yCenter} fontSize="3" fill="#6b7280" textAnchor="middle">
          0
        </text>
        <text x={padding / 2} y={height - padding} fontSize="3" fill="#6b7280" textAnchor="middle">
          -2
        </text>
      </svg>
    </div>
  );
}
