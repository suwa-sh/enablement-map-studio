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
  onTaskClick: (taskId: string) => void;
}

export function OutcomeCanvas({
  outcome,
  sbp,
  cjm,
  selectedPhaseId,
  onPhaseSelect,
  onTaskClick,
}: OutcomeCanvasProps) {
  // Get tasks to display based on selected phase (filter instead of highlight)
  const visibleTaskIds = useMemo(() => {
    if (!selectedPhaseId || !cjm) return null; // null means show all

    const phaseActions = cjm.actions
      .filter((action) => action.phase === selectedPhaseId)
      .map((action) => action.id);

    const taskIds = sbp.tasks
      .filter((task) => {
        // Show CJM readonly tasks for this phase
        if (task.readonly && phaseActions.includes(task.id)) return true;
        // Show regular tasks linked to this phase's actions
        if (task.source_id && phaseActions.includes(task.source_id)) return true;
        return false;
      })
      .map((task) => task.id);

    return new Set(taskIds);
  }, [selectedPhaseId, cjm, sbp.tasks]);

  // Get the CSF source task
  const csfTask = sbp.tasks.find((task) => task.id === outcome.primary_csf.source_id);

  return (
    <Box sx={{ height: '100%', bgcolor: 'grey.50', p: 3 }}>
      {/* Phase selector */}
      {cjm && (
        <Paper elevation={2} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>CJMフェーズ</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              onClick={() => onPhaseSelect(null)}
              variant={selectedPhaseId === null ? 'contained' : 'outlined'}
            >
              すべて
            </Button>
            {cjm.phases.map((phase) => (
              <Button
                key={phase.id}
                onClick={() => onPhaseSelect(phase.id)}
                variant={selectedPhaseId === phase.id ? 'contained' : 'outlined'}
              >
                {phase.name}
              </Button>
            ))}
          </Stack>
        </Paper>
      )}

      {/* SBP swimlanes (read-only) */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>SBP</Typography>
        <Stack spacing={2}>
          {sbp.lanes.map((lane) => {
            const laneTasks = sbp.tasks
              .filter((task) => task.lane === lane.id)
              .filter((task) => visibleTaskIds === null || visibleTaskIds.has(task.id));

            // Skip empty lanes when filtering
            if (visibleTaskIds !== null && laneTasks.length === 0) return null;

            return (
              <Box key={lane.id} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>{lane.name}</Typography>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                  {laneTasks.map((task) => {
                    const isCsfTask = task.id === outcome.primary_csf.source_id;

                    return (
                      <Paper
                        key={task.id}
                        elevation={isCsfTask ? 4 : 1}
                        onClick={() => onTaskClick(task.id)}
                        sx={{
                          minWidth: 200,
                          flexShrink: 0,
                          p: 2,
                          border: 2,
                          borderColor: isCsfTask ? 'success.main' : 'grey.300',
                          bgcolor: isCsfTask ? 'success.lighter' : 'white',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: isCsfTask ? 'success.light' : 'grey.100',
                          },
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">{task.name}</Typography>
                        {isCsfTask && (
                          <Chip
                            icon={<Star />}
                            label="CSF"
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

      {/* 求める成果 Card */}
      <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>求める成果</Typography>
        <Stack spacing={2}>
          {/* KGI Card */}
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>
              KGI
            </Typography>
            <Typography variant="h6">{outcome.kgi.name}</Typography>
          </Paper>

          {/* CSF Card */}
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>
              CSF
            </Typography>
            {csfTask && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                ソースタスク: <strong>{csfTask.name}</strong>
              </Typography>
            )}
            <Typography variant="body1">{outcome.primary_csf.rationale || '（未設定）'}</Typography>
          </Paper>

          {/* KPI Card */}
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>
              KPI
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>{outcome.primary_kpi.name}</Typography>
            {outcome.primary_kpi.definition && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {outcome.primary_kpi.definition}
              </Typography>
            )}
            <Typography variant="body1" fontWeight="medium">
              目標値: {outcome.primary_kpi.target.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              {outcome.primary_kpi.unit && ` ${outcome.primary_kpi.unit}`}
            </Typography>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}
