import { useMemo } from 'react';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import { Star } from '@mui/icons-material';
import type { OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';

interface OutcomeCanvasProps {
  outcome: OutcomeDsl;
  sbp: SbpDsl;
  cjm: CjmDsl | null;
  selectedPhaseId: string | null;
  onPhaseSelect: (phaseId: string | null) => void;
}

export function OutcomeCanvas({
  outcome,
  sbp,
  cjm,
  selectedPhaseId,
  onPhaseSelect,
}: OutcomeCanvasProps) {
  // Get tasks to highlight based on selected phase
  const highlightedTaskIds = useMemo(() => {
    if (!selectedPhaseId || !cjm) return new Set<string>();

    const phaseActions = cjm.actions
      .filter((action) => action.phase === selectedPhaseId)
      .map((action) => action.id);

    const tasks = sbp.tasks
      .filter((task) => task.source_id && phaseActions.includes(task.source_id))
      .map((task) => task.id);

    return new Set(tasks);
  }, [selectedPhaseId, cjm, sbp.tasks]);

  // Get the CSF source task
  const csfTask = sbp.tasks.find((task) => task.id === outcome.primary_csf.source_id);

  return (
    <Box sx={{ height: '100%', bgcolor: 'grey.50', p: 3 }}>
      {/* Phase selector */}
      {cjm && (
        <Paper elevation={2} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Select CJM Phase</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              onClick={() => onPhaseSelect(null)}
              variant={selectedPhaseId === null ? 'contained' : 'outlined'}
              size="small"
            >
              All Phases
            </Button>
            {cjm.phases.map((phase) => (
              <Button
                key={phase.id}
                onClick={() => onPhaseSelect(phase.id)}
                variant={selectedPhaseId === phase.id ? 'contained' : 'outlined'}
                size="small"
              >
                {phase.name}
              </Button>
            ))}
          </Stack>
        </Paper>
      )}

      {/* SBP swimlanes (read-only) */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Service Blueprint</Typography>
        <Stack spacing={2}>
          {sbp.lanes.map((lane) => {
            const laneTasks = sbp.tasks.filter((task) => task.lane === lane.id);

            return (
              <Box key={lane.id} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>{lane.name}</Typography>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                  {laneTasks.map((task) => {
                    const isHighlighted = highlightedTaskIds.has(task.id);
                    const isCsfTask = task.id === outcome.primary_csf.source_id;

                    return (
                      <Paper
                        key={task.id}
                        elevation={isCsfTask ? 4 : 1}
                        sx={{
                          minWidth: 200,
                          flexShrink: 0,
                          p: 2,
                          border: 2,
                          borderColor: isCsfTask ? 'success.main' : isHighlighted ? 'primary.light' : 'grey.300',
                          bgcolor: isCsfTask ? 'success.lighter' : isHighlighted ? 'primary.lighter' : 'white',
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">{task.name}</Typography>
                        {isCsfTask && (
                          <Chip
                            icon={<Star />}
                            label="CSF Source"
                            size="small"
                            color="success"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      {/* Current CSF info */}
      {csfTask && (
        <Paper elevation={2} sx={{ mt: 3, p: 2, bgcolor: 'success.lighter' }}>
          <Typography variant="h6" color="success.dark" sx={{ mb: 1 }}>Current CSF</Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Task:</strong> {csfTask.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Rationale:</strong> {outcome.primary_csf.rationale}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
