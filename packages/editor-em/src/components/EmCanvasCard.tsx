import { useState, useMemo, useCallback } from 'react';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import { Add, Star } from '@mui/icons-material';
import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl, EmAction } from '@enablement-map-studio/dsl';
import { generateId } from '@enablement-map-studio/dsl';

interface EmCanvasCardProps {
  em: EmDsl | null;
  outcome: OutcomeDsl | null;
  sbp: SbpDsl | null;
  cjm: CjmDsl | null;
  onEmUpdate: (em: EmDsl) => void;
  onActionSelect: (action: EmAction | null) => void;
}

export function EmCanvasCard({
  em,
  outcome,
  sbp,
  cjm,
  onEmUpdate,
  onActionSelect,
}: EmCanvasCardProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [csfFilterActive, setCsfFilterActive] = useState(false);

  // Get CSF task
  const csfTask = useMemo(() => {
    if (!outcome || !sbp) return null;
    return sbp.tasks.find((task) => task.id === outcome.primary_csf.source_id);
  }, [outcome, sbp]);

  // When CSF filter is active, derive related elements
  const csfRelatedData = useMemo(() => {
    if (!csfFilterActive || !csfTask || !cjm || !em || !sbp) return null;

    // Get CJM action linked to CSF task
    const cjmAction = csfTask.readonly
      ? cjm.actions.find((a) => a.id === csfTask.id)
      : cjm.actions.find((a) => a.id === csfTask.source_id);

    // Get all tasks connected to CSF task via edges (graph traversal)
    // IMPORTANT: connections are stored in sbp.connections array, not task.connections
    const connectedTaskIds = new Set<string>([csfTask.id]);
    const toVisit = [csfTask.id];
    const visited = new Set<string>();

    while (toVisit.length > 0) {
      const currentTaskId = toVisit.pop()!;
      if (visited.has(currentTaskId)) continue;
      visited.add(currentTaskId);

      // Find all connections where this task is the source (outgoing edges)
      sbp.connections.forEach((conn) => {
        if (conn.source === currentTaskId && !connectedTaskIds.has(conn.target)) {
          connectedTaskIds.add(conn.target);
          toVisit.push(conn.target);
        }
      });

      // Find all connections where this task is the target (incoming edges)
      sbp.connections.forEach((conn) => {
        if (conn.target === currentTaskId && !connectedTaskIds.has(conn.source)) {
          connectedTaskIds.add(conn.source);
          toVisit.push(conn.source);
        }
      });
    }

    // Get EM actions linked to any connected task
    const emActionIds = new Set<string>();
    connectedTaskIds.forEach((taskId) => {
      em.actions.forEach((action) => {
        if (action.source_id === taskId) {
          emActionIds.add(action.id);
        }
      });
    });

    return {
      cjmActionId: cjmAction?.id || null,
      cjmPhaseId: cjmAction?.phase || null,
      connectedTaskIds, // All tasks connected to CSF task
      emActionIds,
    };
  }, [csfFilterActive, csfTask, cjm, em, sbp]);

  // Get visible lanes based on CSF filter and lane selection
  const visibleLanes = useMemo(() => {
    if (!sbp) return [];

    let lanes = sbp.lanes;

    // CSF filter: show all lanes (don't filter by lane)
    // Users want to see all lanes, not just the CSF task's lane

    // Lane selection: show only selected lane
    if (selectedLaneId) {
      lanes = lanes.filter((lane) => lane.id === selectedLaneId);
    }

    return lanes;
  }, [sbp, selectedLaneId]);

  // Get visible tasks based on CSF filter and phase selection
  const visibleTaskIds = useMemo(() => {
    if (!sbp) return null; // null means show all

    let taskIds: string[] = [];

    // CSF filter: show all tasks connected to CSF task
    if (csfRelatedData) {
      taskIds = Array.from(csfRelatedData.connectedTaskIds);
    }
    // Phase filter: show tasks for selected phase
    else if (selectedPhaseId && cjm) {
      const phaseActions = cjm.actions
        .filter((action) => action.phase === selectedPhaseId)
        .map((action) => action.id);

      taskIds = sbp.tasks
        .filter((task) => {
          if (task.readonly && phaseActions.includes(task.id)) return true;
          if (task.source_id && phaseActions.includes(task.source_id)) return true;
          return false;
        })
        .map((task) => task.id);
    }
    // No filter: show all
    else {
      return null;
    }

    return new Set(taskIds);
  }, [sbp, cjm, csfRelatedData, selectedPhaseId]);

  // Get EM actions filtered by CSF or selected task
  const visibleActions = useMemo(() => {
    if (!em) return [];

    // CSF filter: show only CSF-related actions
    if (csfRelatedData) {
      return em.actions.filter((action) => csfRelatedData.emActionIds.has(action.id));
    }

    // Task selection: show actions for selected task
    if (selectedTaskId) {
      return em.actions.filter((action) => action.source_id === selectedTaskId);
    }

    // No filter: show all
    return em.actions;
  }, [em, csfRelatedData, selectedTaskId]);

  const handleAddAction = useCallback(() => {
    if (!em || !sbp) return;

    const firstTask = sbp.tasks.find((t) => !t.readonly);
    if (!firstTask) return;

    const newAction: EmAction = {
      id: generateId('em', 'action'),
      name: '新しい行動',
      source_id: selectedTaskId || firstTask.id,
    };

    const updatedEm: EmDsl = {
      ...em,
      actions: [...em.actions, newAction],
    };

    onEmUpdate(updatedEm);
    onActionSelect(newAction);
  }, [em, sbp, selectedTaskId, onEmUpdate, onActionSelect]);

  if (!outcome || !sbp || !cjm) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          Outcome、SBP、CJM データをロードしてください
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', bgcolor: 'grey.50', p: 3, overflow: 'auto' }}>
      {/* Button area */}
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddAction}>
          必要な行動を追加
        </Button>
      </Box>

      {/* Filter area - single column layout */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {/* Outcome card */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>求める成果</Typography>

          {/* KGI/CSF/KPI in one row */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Paper elevation={1} sx={{ flex: 1, p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                KGI
              </Typography>
              <Typography variant="body2">{outcome.kgi.name}</Typography>
            </Paper>

            <Paper elevation={1} sx={{ flex: 1, p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                CSF
              </Typography>
              <Typography variant="body2">
                {outcome.primary_csf.rationale || '（未設定）'}
              </Typography>
            </Paper>

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

          {/* Filter buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => setCsfFilterActive(false)}
              variant={!csfFilterActive ? 'contained' : 'outlined'}
              size="small"
            >
              すべて
            </Button>
            <Button
              onClick={() => setCsfFilterActive(true)}
              variant={csfFilterActive ? 'contained' : 'outlined'}
              size="small"
            >
              CSF
            </Button>
          </Stack>
        </Paper>

        {/* CJM Phase card */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>CJMフェーズ</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              onClick={() => setSelectedPhaseId(null)}
              variant={selectedPhaseId === null ? 'contained' : 'outlined'}
              size="small"
            >
              すべて
            </Button>
            {cjm.phases.map((phase) => (
              <Button
                key={phase.id}
                onClick={() => setSelectedPhaseId(phase.id)}
                variant={selectedPhaseId === phase.id ? 'contained' : 'outlined'}
                size="small"
              >
                {phase.name}
              </Button>
            ))}
          </Stack>
        </Paper>
      </Stack>

      {/* SBP area */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>SBP</Typography>

        {/* Lane filter buttons */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Button
            onClick={() => setSelectedLaneId(null)}
            variant={selectedLaneId === null ? 'contained' : 'outlined'}
            size="small"
          >
            すべて
          </Button>
          {sbp.lanes.map((lane) => (
            <Button
              key={lane.id}
              onClick={() => setSelectedLaneId(lane.id)}
              variant={selectedLaneId === lane.id ? 'contained' : 'outlined'}
              size="small"
            >
              {lane.name}
            </Button>
          ))}
        </Stack>

        <Stack spacing={2}>
          {visibleLanes.map((lane) => {
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
                    const isSelected = task.id === selectedTaskId;

                    return (
                      <Paper
                        key={task.id}
                        elevation={isCsfTask ? 4 : isSelected ? 3 : 1}
                        onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                        sx={{
                          minWidth: 200,
                          flexShrink: 0,
                          p: 2,
                          border: 2,
                          borderColor: isCsfTask ? 'success.main' : isSelected ? 'primary.main' : 'grey.300',
                          bgcolor: isCsfTask ? 'success.lighter' : isSelected ? 'primary.lighter' : 'white',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: isCsfTask ? 'success.light' : isSelected ? 'primary.light' : 'grey.100',
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

      {/* Required Actions area */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>必要な行動</Typography>
        {visibleActions.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            行動がありません。「必要な行動を追加」ボタンから追加してください。
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {visibleActions.map((action) => {
              const sourceTask = sbp.tasks.find((t) => t.id === action.source_id);

              return (
                <Paper
                  key={action.id}
                  elevation={1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionSelect(action);
                  }}
                  sx={{
                    minWidth: 200,
                    p: 2,
                    cursor: 'pointer',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'grey.100',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    {action.name}
                  </Typography>
                  {sourceTask && (
                    <Typography variant="caption" color="text.secondary">
                      タスク: {sourceTask.name}
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
