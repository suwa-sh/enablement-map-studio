import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Paper, Typography } from '@mui/material';
import type { CjmPhase } from '@enablement-map-studio/dsl';

interface PhaseNodeData {
  phase: CjmPhase;
  selected: boolean;
  onSelect: () => void;
}

export const PhaseNode = memo(({ data }: { data: PhaseNodeData }) => {
  return (
    <>
      <Paper
        elevation={data.selected ? 8 : 2}
        onClick={data.onSelect}
        sx={{
          p: 2,
          minWidth: 200,
          cursor: 'pointer',
          border: data.selected ? 2 : 0,
          borderColor: 'primary.main',
          bgcolor: 'primary.lighter',
          '&:hover': {
            elevation: 4,
          },
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {data.phase.name}
        </Typography>
      </Paper>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

PhaseNode.displayName = 'PhaseNode';
