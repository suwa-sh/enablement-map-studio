import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, Star, ExpandMore, FilterList } from '@mui/icons-material';
import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl, EmAction } from '@enablement-map-studio/dsl';
import { generateId } from '@enablement-map-studio/dsl';

interface EmCanvasCardProps {
  em: EmDsl | null;
  outcome: OutcomeDsl | null;
  sbp: SbpDsl | null;
  cjm: CjmDsl | null;
  onEmUpdate: (em: EmDsl) => void;
  onActionSelect: (action: EmAction | null) => void;
  onFilterChange?: (visibleTaskIds: Set<string> | null) => void;
}

export function EmCanvasCard({
  em,
  outcome,
  sbp,
  cjm,
  onEmUpdate,
  onActionSelect,
  onFilterChange,
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

  // Get visible tasks based on CSF filter, phase, and lane (Phase AND Lane)
  const visibleTaskIds = useMemo(() => {
    if (!sbp) return null; // null means show all

    // CSF filter: show all tasks connected to CSF task (exclusive)
    if (csfRelatedData) {
      return csfRelatedData.connectedTaskIds;
    }

    // If no filter is active, return null (show all)
    if (!selectedPhaseId && !selectedLaneId) {
      return null;
    }

    // Phase filter only: Apply graph traversal to show all connected tasks
    if (selectedPhaseId && !selectedLaneId && cjm) {
      const phaseActions = cjm.actions
        .filter((action) => action.phase === selectedPhaseId)
        .map((action) => action.id);

      const initialTasks = sbp.tasks.filter((task) => {
        if (task.readonly && phaseActions.includes(task.id)) return true;
        if (task.source_id && phaseActions.includes(task.source_id)) return true;
        return false;
      });

      // Graph traversal: expand to include all connected tasks
      const connectedTaskIds = new Set<string>(initialTasks.map((task) => task.id));
      const toVisit = [...connectedTaskIds];
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

      return connectedTaskIds;
    }

    // Lane filter only: Show only tasks in selected lane (no graph traversal)
    if (selectedLaneId && !selectedPhaseId) {
      const laneTasks = sbp.tasks.filter((task) => task.lane === selectedLaneId);
      return new Set(laneTasks.map((task) => task.id));
    }

    // Phase AND Lane: Apply graph traversal for Phase, then filter by Lane
    if (selectedPhaseId && selectedLaneId && cjm) {
      const phaseActions = cjm.actions
        .filter((action) => action.phase === selectedPhaseId)
        .map((action) => action.id);

      const initialTasks = sbp.tasks.filter((task) => {
        if (task.readonly && phaseActions.includes(task.id)) return true;
        if (task.source_id && phaseActions.includes(task.source_id)) return true;
        return false;
      });

      // Graph traversal: expand to include all connected tasks
      const connectedTaskIds = new Set<string>(initialTasks.map((task) => task.id));
      const toVisit = [...connectedTaskIds];
      const visited = new Set<string>();

      while (toVisit.length > 0) {
        const currentTaskId = toVisit.pop()!;
        if (visited.has(currentTaskId)) continue;
        visited.add(currentTaskId);

        sbp.connections.forEach((conn) => {
          if (conn.source === currentTaskId && !connectedTaskIds.has(conn.target)) {
            connectedTaskIds.add(conn.target);
            toVisit.push(conn.target);
          }
        });

        sbp.connections.forEach((conn) => {
          if (conn.target === currentTaskId && !connectedTaskIds.has(conn.source)) {
            connectedTaskIds.add(conn.source);
            toVisit.push(conn.source);
          }
        });
      }

      // Filter by lane after graph traversal
      const laneFilteredTaskIds = new Set<string>();
      connectedTaskIds.forEach((taskId) => {
        const task = sbp.tasks.find((t) => t.id === taskId);
        if (task && task.lane === selectedLaneId) {
          laneFilteredTaskIds.add(taskId);
        }
      });

      return laneFilteredTaskIds;
    }

    return null;
  }, [sbp, cjm, csfRelatedData, selectedPhaseId, selectedLaneId]);

  // Get EM actions filtered by CSF, phase/lane, or selected task
  const visibleActions = useMemo(() => {
    if (!em) return [];

    // CSF filter: show only CSF-related actions
    if (csfRelatedData) {
      return em.actions.filter((action) => csfRelatedData.emActionIds.has(action.id));
    }

    // Phase/Lane filter: show actions linked to visible tasks (Phase AND Lane)
    if (visibleTaskIds) {
      return em.actions.filter((action) => visibleTaskIds.has(action.source_id));
    }

    // Task selection: show actions for selected task
    if (selectedTaskId) {
      return em.actions.filter((action) => action.source_id === selectedTaskId);
    }

    // No filter: show all
    return em.actions;
  }, [em, csfRelatedData, visibleTaskIds, selectedTaskId]);

  // Calculate visible CJM actions count for display
  const visibleCjmActionsCount = useMemo(() => {
    if (!cjm) return 0;
    if (csfRelatedData && csfRelatedData.cjmActionId) {
      return cjm.actions.filter((a) => a.id === csfRelatedData.cjmActionId).length;
    }
    if (selectedPhaseId) {
      return cjm.actions.filter((a) => a.phase === selectedPhaseId).length;
    }
    return cjm.actions.length;
  }, [cjm, csfRelatedData, selectedPhaseId]);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(visibleTaskIds);
    }
  }, [visibleTaskIds, onFilterChange]);

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
      {/* Button area and Filter panel - horizontal layout, sticky */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'grey.50',
          pt: 0,
          pb: 2,
        }}
      >
        {/* Button area */}
        <Button variant="contained" startIcon={<Add />} onClick={handleAddAction}>
          必要な行動を追加
        </Button>

        {/* Filter panel */}
        <Accordion sx={{ width: '50%', maxWidth: 800 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterList fontSize="small" />
            <Typography variant="button">フィルター</Typography>
            {(csfFilterActive || selectedPhaseId || selectedLaneId) && (
              <Chip
                label={visibleActions.length}
                size="small"
                color="primary"
              />
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {/* Filter controls - horizontal layout */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {/* CSF Filter */}
              <FormControlLabel
                control={
                  <Switch
                    checked={csfFilterActive}
                    onChange={(e) => {
                      setCsfFilterActive(e.target.checked);
                      if (e.target.checked) {
                        // Clear other filters when CSF is activated
                        setSelectedPhaseId(null);
                        setSelectedLaneId(null);
                      }
                    }}
                  />
                }
                label="CSFで絞り込む"
                sx={{ minWidth: 150 }}
              />

              {/* CJM Phase Filter */}
              <FormControl sx={{ flex: 1, minWidth: 200 }} disabled={csfFilterActive}>
                <InputLabel id="phase-filter-label">顧客の意思決定プロセス</InputLabel>
                <Select
                  labelId="phase-filter-label"
                  value={selectedPhaseId || ''}
                  onChange={(e) => setSelectedPhaseId(e.target.value || null)}
                  label="顧客の意思決定プロセス"
                >
                  <MenuItem value="">すべて</MenuItem>
                  {cjm.phases.map((phase) => (
                    <MenuItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* SBP Lane Filter */}
              <FormControl sx={{ flex: 1, minWidth: 200 }} disabled={csfFilterActive}>
                <InputLabel id="lane-filter-label">組織の価値提供プロセス</InputLabel>
                <Select
                  labelId="lane-filter-label"
                  value={selectedLaneId || ''}
                  onChange={(e) => setSelectedLaneId(e.target.value || null)}
                  label="組織の価値提供プロセス"
                >
                  <MenuItem value="">すべて</MenuItem>
                  {sbp.lanes.slice(1).map((lane) => (
                    <MenuItem key={lane.id} value={lane.id}>
                      {lane.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Filter summary - inside accordion */}
            {(csfFilterActive || selectedPhaseId || selectedLaneId) && (
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50', border: 1, borderColor: 'grey.300' }}>
                <Typography variant="body2" color="text.primary">
                  フィルタ中: 顧客の意思決定プロセス {visibleCjmActionsCount}件 → 組織の価値提供プロセス {visibleTaskIds?.size || sbp.tasks.length}件 → 必要な行動 {visibleActions.length}件
                </Typography>
              </Paper>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
      </Stack>

      {/* Two-column layout: Organization outcome (left) and Customer (right) */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {/* Left: Outcome card */}
        <Paper elevation={2} sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>組織の求める成果</Typography>

          {/* KGI/CSF/KPI in one row */}
          <Stack direction="row" spacing={2}>
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
        </Paper>

        {/* Right: Customer card */}
        {cjm.persona && (
          <Paper elevation={2} sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>顧客</Typography>
            <Stack direction="row" spacing={2}>
              <Paper elevation={1} sx={{ flex: 1, p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  ペルソナ
                </Typography>
                <Typography variant="body2">{cjm.persona.name}</Typography>
              </Paper>

              {cjm.persona.description && (
                <Paper elevation={1} sx={{ flex: 1, p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    説明
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {cjm.persona.description}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Single column layout below */}
      {/* CJM Phase card */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          顧客の意思決定プロセス
        </Typography>

        {/* CJM Actions - horizontal layout with frame */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
            アクション ({visibleCjmActionsCount}件)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {cjm.actions
              .filter((action) => {
                // CSF filter: show only CSF-related action
                if (csfRelatedData) {
                  return action.id === csfRelatedData.cjmActionId;
                }
                // Phase filter
                return selectedPhaseId === null || action.phase === selectedPhaseId;
              })
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

      {/* SBP area */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          組織の価値提供プロセス
        </Typography>

        <Stack spacing={2}>
          {visibleLanes
            .filter((lane) => lane.kind !== 'cjm') // Skip CJM lane
            .map((lane) => {
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
                          borderColor: isCsfTask ? 'primary.main' : isSelected ? 'primary.main' : 'grey.300',
                          bgcolor: isCsfTask ? 'primary.lighter' : isSelected ? 'primary.lighter' : 'white',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: isCsfTask ? 'primary.light' : isSelected ? 'primary.light' : 'grey.100',
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

      {/* Required Actions area - full width below */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>必要な行動 ({visibleActions.length}件)</Typography>
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
