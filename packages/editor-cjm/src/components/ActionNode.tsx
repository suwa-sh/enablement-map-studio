import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Paper, Typography, Box, Chip } from '@mui/material';
import type { CjmAction } from '@enablement-map-studio/dsl';

interface ActionNodeData {
  action: CjmAction;
  selected: boolean;
  onSelect: () => void;
}

const getEmotionColor = (score: number): string => {
  if (score >= 2) return '#4caf50'; // green
  if (score === 1) return '#8bc34a'; // light green
  if (score === 0) return '#ff9800'; // orange
  if (score === -1) return '#ff5722'; // deep orange
  return '#f44336'; // red
};

const getEmotionLabel = (score: number): string => {
  if (score >= 2) return 'Very Positive';
  if (score === 1) return 'Positive';
  if (score === 0) return 'Neutral';
  if (score === -1) return 'Negative';
  return 'Very Negative';
};

export const ActionNode = memo(({ data }: { data: ActionNodeData }) => {
  const emotionColor = getEmotionColor(data.action.emotion_score);
  const emotionLabel = getEmotionLabel(data.action.emotion_score);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Paper
        elevation={data.selected ? 8 : 2}
        onClick={data.onSelect}
        sx={{
          p: 2,
          minWidth: 250,
          maxWidth: 300,
          cursor: 'pointer',
          border: data.selected ? 2 : 0,
          borderColor: 'primary.main',
          '&:hover': {
            elevation: 4,
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {data.action.name}
        </Typography>

        <Chip
          label={emotionLabel}
          size="small"
          sx={{
            bgcolor: emotionColor,
            color: 'white',
            mb: 1,
          }}
        />

        {data.action.touchpoints && data.action.touchpoints.length > 0 && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Touchpoints:
            </Typography>
            <Typography variant="body2">
              {data.action.touchpoints.join(', ')}
            </Typography>
          </Box>
        )}

        {data.action.thoughts_feelings && data.action.thoughts_feelings.length > 0 && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Thoughts & Feelings:
            </Typography>
            {data.action.thoughts_feelings.slice(0, 2).map((item, idx) => (
              <Typography key={idx} variant="body2" fontSize="0.875rem">
                • {item}
              </Typography>
            ))}
            {data.action.thoughts_feelings.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{data.action.thoughts_feelings.length - 2} more
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </>
  );
});

ActionNode.displayName = 'ActionNode';
