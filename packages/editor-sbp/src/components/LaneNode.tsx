import { memo } from 'react';
import { NodeResizer, type NodeProps, type OnResize, type OnResizeEnd } from '@xyflow/react';
import { Box, Typography } from '@mui/material';
import type { SbpLane } from '@enablement-map-studio/dsl';

export interface LaneNodeData {
  lane: SbpLane;
  onResize?: OnResize;
  onResizeEnd?: OnResizeEnd;
}

const LANE_COLORS: Record<string, string> = {
  cjm: '#f5f5f5', // Grey (Customer Journey)
  team: '#e3f2fd', // Blue (Team)
  human: '#ffebee', // Red (Human)
  system: '#f3e5f5', // Purple (System)
};

export const LaneNode = memo(({ data, selected }: NodeProps) => {
  const { lane, onResize, onResizeEnd } = data as unknown as LaneNodeData;
  const bgColor = LANE_COLORS[lane.kind] || '#f5f5f5';

  return (
    <>
      <NodeResizer
        minWidth={800}
        minHeight={150}
        maxHeight={400}
        isVisible={selected}
        color="#1976d2"
        lineStyle={{ borderWidth: 2 }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
      />
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: bgColor,
          border: '2px solid',
          borderColor: selected ? 'primary.main' : 'divider',
          borderRadius: 1,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* レーン名ラベル */}
        <Box
          sx={{
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
          }}
        >
          <Typography variant="body2" fontWeight="bold" color="text.secondary">
            {lane.name}
          </Typography>
        </Box>
      </Box>
    </>
  );
});

LaneNode.displayName = 'LaneNode';
