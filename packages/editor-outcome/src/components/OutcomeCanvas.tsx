import { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Star, ExpandMore, FilterList } from '@mui/icons-material';
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

  // Count visible items for filter summary
  const visibleCjmActionsCount = cjm
    ? cjm.actions.filter((action) => selectedPhaseId === null || action.phase === selectedPhaseId).length
    : 0;

  return (
    <Box sx={{ height: '100%', bgcolor: 'grey.50', p: 3, overflow: 'auto' }}>
      {/* Filter accordion - right aligned, 50% width, sticky */}
      {cjm && (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'grey.50',
            pt: 0,
            pb: 2,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Accordion sx={{ width: '50%', maxWidth: 800 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FilterList fontSize="small" />
                <Typography variant="button">フィルター</Typography>
                {selectedPhaseId && (
                  <Chip
                    label={visibleTaskIds?.size || sbp.tasks.length}
                    size="small"
                    color="primary"
                  />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {/* CJM Phase Filter */}
                <FormControl fullWidth>
                  <InputLabel id="phase-filter-label">CJM フェーズ</InputLabel>
                  <Select
                    labelId="phase-filter-label"
                    value={selectedPhaseId || ''}
                    onChange={(e) => onPhaseSelect(e.target.value || null)}
                    label="CJM フェーズ"
                  >
                    <MenuItem value="">すべて</MenuItem>
                    {cjm.phases.map((phase) => (
                      <MenuItem key={phase.id} value={phase.id}>
                        {phase.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Filter summary */}
                {selectedPhaseId && (
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50', border: 1, borderColor: 'grey.300' }}>
                    <Typography variant="body2" color="text.primary">
                      フィルタ中: CJM アクション {visibleCjmActionsCount}件 → SBP タスク {visibleTaskIds?.size || sbp.tasks.length}件
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* CJM actions */}
      {cjm && (
        <Paper elevation={2} sx={{ mb: 2, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>CJM</Typography>

          {/* CJM Actions - horizontal layout with frame */}
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
              アクション ({visibleCjmActionsCount}件)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
              {cjm.actions
                .filter((action) => selectedPhaseId === null || action.phase === selectedPhaseId)
                .map((action) => (
                  <Paper
                    key={action.id}
                    elevation={1}
                    sx={{
                      minWidth: 200,
                      flexShrink: 0,
                      p: 2,
                      border: 1,
                      borderColor: 'grey.300',
                      bgcolor: 'white',
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">{action.name}</Typography>
                  </Paper>
                ))}
            </Box>
          </Box>
        </Paper>
      )}

      {/* SBP swimlanes (read-only) - skip first lane */}
      <Paper elevation={2} sx={{ mb: 2, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>SBP</Typography>
        <Stack spacing={2}>
          {sbp.lanes.slice(1).map((lane) => {
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task.id);
                        }}
                        sx={{
                          minWidth: 200,
                          flexShrink: 0,
                          p: 2,
                          border: 2,
                          borderColor: isCsfTask ? 'primary.main' : 'grey.300',
                          bgcolor: isCsfTask ? 'primary.lighter' : 'white',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: isCsfTask ? 'primary.light' : 'grey.100',
                          },
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">{task.name}</Typography>
                        {isCsfTask && (
                          <Chip
                            icon={<Star />}
                            label="CSF"
                            size="small"
                            color="primary"
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

      {/* 組織の求める成果 Card */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>組織の求める成果</Typography>
        <Stack direction="row" spacing={2}>
          {/* KGI Card */}
          <Paper elevation={1} sx={{ flex: 1, p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              KGI
            </Typography>
            <Typography variant="body2">{outcome.kgi.name}</Typography>
          </Paper>

          {/* CSF Card */}
          <Paper elevation={1} sx={{ flex: 1, p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              CSF
            </Typography>
            <Typography variant="body2">
              {outcome.primary_csf.rationale || '（未設定）'}
            </Typography>
          </Paper>

          {/* KPI Card */}
          <Paper elevation={1} sx={{ flex: 1, p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              KPI
            </Typography>
            <Typography variant="body2">
              {outcome.primary_kpi.name}: {outcome.primary_kpi.target.toLocaleString('ja-JP', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
              {outcome.primary_kpi.unit && outcome.primary_kpi.unit}
            </Typography>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}
