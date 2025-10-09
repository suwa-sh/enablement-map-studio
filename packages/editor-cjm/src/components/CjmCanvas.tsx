import { useMemo, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, DragIndicator } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CjmDsl, CjmAction, CjmPhase } from '@enablement-map-studio/dsl';

interface CjmCanvasProps {
  cjm: CjmDsl;
  selectedAction: CjmAction | null;
  selectedPhase: CjmPhase | null;
  onActionSelect: (action: CjmAction) => void;
  onPhaseSelect: (phase: CjmPhase) => void;
  onAddPhase: () => void;
  onAddAction: (phaseId: string, actionName: string) => void;
  onReorderActions: (actions: CjmAction[]) => void;
  onReorderPhases: (phases: CjmPhase[]) => void;
}

interface SortableActionCellProps {
  action: CjmAction;
  isSelected: boolean;
  onSelect: () => void;
}

interface SortablePhaseCellProps {
  phase: CjmPhase;
  colSpan: number;
  isSelected: boolean;
  onSelect: () => void;
}

function SortablePhaseCell({ phase, colSpan, isSelected, onSelect }: SortablePhaseCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableCell
      ref={setNodeRef}
      style={style}
      colSpan={colSpan}
      sx={{
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: isSelected ? 'primary.light' : 'grey.100',
        fontWeight: 'bold',
        p: 3,
        color: 'text.primary',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
          <DragIndicator fontSize="small" />
        </Box>
        <Typography
          onClick={onSelect}
          sx={{ cursor: 'pointer', flex: 1 }}
        >
          {phase.name}
        </Typography>
      </Stack>
    </TableCell>
  );
}

function SortableActionCell({ action, isSelected, onSelect }: SortableActionCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: isSelected ? 'primary.lighter' : 'transparent',
        '&:hover': { bgcolor: 'grey.100' },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <DragIndicator fontSize="small" />
      </Box>
      <Typography 
        variant="body2" 
        color="text.primary" 
        onClick={onSelect} 
        sx={{ 
          flex: 1,
          cursor: 'pointer',
        }}
      >
        {action.name}
      </Typography>
    </Box>
  );
}

const EmotionCurve = ({ phases, actions }: { phases: CjmPhase[]; actions: CjmAction[] }) => {
  const chartData = useMemo(() => {
    const phaseOrder = new Map(phases.map((p, idx) => [p.id, idx]));

    const sortedActions = [...actions].sort((a, b) => {
      const phaseA = phaseOrder.get(a.phase) ?? 0;
      const phaseB = phaseOrder.get(b.phase) ?? 0;
      return phaseA - phaseB;
    });

    return sortedActions.map((action) => ({
      name: action.name,
      score: action.emotion_score,
      phase: phases.find((p) => p.id === action.phase)?.name || '',
    }));
  }, [phases, actions]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis domain={[-2, 2]} ticks={[-2, -1, 0, 1, 2]} />
        <Tooltip
          content={({ payload }) => {
            if (!payload?.[0]) return null;
            const data = payload[0].payload;
            return (
              <Paper sx={{ p: 1, boxShadow: 2 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  {data.phase}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {data.name}
                </Typography>
                <Typography variant="body2">
                  スコア: {data.score}
                </Typography>
              </Paper>
            );
          }}
        />
        <Line type="monotone" dataKey="score" stroke="#1976d2" strokeWidth={2} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export function CjmCanvas({
  cjm,
  selectedAction,
  selectedPhase,
  onActionSelect,
  onPhaseSelect,
  onAddPhase,
  onAddAction,
  onReorderActions,
  onReorderPhases,
}: CjmCanvasProps) {
  const [addActionDialogOpen, setAddActionDialogOpen] = useState(false);
  const [newActionName, setNewActionName] = useState('');
  const [selectedPhaseForNewAction, setSelectedPhaseForNewAction] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const phaseActionsMap = useMemo(() => {
    return cjm.phases.map((phase) => ({
      phase,
      actions: cjm.actions.filter((a) => a.phase === phase.id),
    }));
  }, [cjm]);

  const totalColumns = useMemo(() => {
    return phaseActionsMap.reduce((sum, { actions }) => sum + Math.max(1, actions.length), 0);
  }, [phaseActionsMap]);

  const handleDragEndPhases = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cjm.phases.findIndex((p) => p.id === active.id);
      const newIndex = cjm.phases.findIndex((p) => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(cjm.phases, oldIndex, newIndex);
        onReorderPhases(reordered);
      }
    }
  };

  const handleDragEndActions = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find which phase the dragged action belongs to
      const draggedAction = cjm.actions.find((a) => a.id === active.id);
      const targetAction = cjm.actions.find((a) => a.id === over.id);

      if (!draggedAction || !targetAction) return;

      // Only allow reordering within the same phase
      if (draggedAction.phase !== targetAction.phase) return;

      const phaseId = draggedAction.phase;
      const phaseActions = cjm.actions.filter((a) => a.phase === phaseId);
      const otherActions = cjm.actions.filter((a) => a.phase !== phaseId);

      const oldIndex = phaseActions.findIndex((a) => a.id === active.id);
      const newIndex = phaseActions.findIndex((a) => a.id === over.id);

      const reordered = arrayMove(phaseActions, oldIndex, newIndex);
      onReorderActions([...otherActions, ...reordered]);
    }
  };

  const handleOpenAddActionDialog = () => {
    setNewActionName('');
    setSelectedPhaseForNewAction(cjm.phases[0]?.id || '');
    setAddActionDialogOpen(true);
  };

  const handleCloseAddActionDialog = () => {
    setAddActionDialogOpen(false);
  };

  const handleAddActionSubmit = () => {
    if (newActionName.trim() && selectedPhaseForNewAction) {
      onAddAction(selectedPhaseForNewAction, newActionName.trim());
      handleCloseAddActionDialog();
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* ツールバー */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddPhase}
        >
          フェーズ追加
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddActionDialog}
        >
          アクション追加
        </Button>
      </Stack>

      <TableContainer component={Paper} elevation={2} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3 }}>
                フェーズ
              </TableCell>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndPhases}
              >
                <SortableContext items={cjm.phases.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
                  {phaseActionsMap.map(({ phase, actions }) => {
                    const colSpan = Math.max(1, actions.length);
                    return (
                      <SortablePhaseCell
                        key={phase.id}
                        phase={phase}
                        colSpan={colSpan}
                        isSelected={selectedPhase?.id === phase.id}
                        onSelect={() => onPhaseSelect(phase)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* アクション */}
            <TableRow>
              <TableCell sx={{ width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3, color: 'text.primary' }}>アクション</TableCell>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndActions}
              >
                {phaseActionsMap.map(({ phase, actions }) => {
                  const columns = Math.max(1, actions.length);
                  const actionIds = actions.map((a) => a.id);

                  return (
                    <SortableContext key={phase.id} items={actionIds} strategy={horizontalListSortingStrategy}>
                      {Array.from({ length: columns }).map((_, idx) => {
                        const action = actions[idx];
                        return (
                          <TableCell
                            key={`${phase.id}-action-${idx}`}
                            sx={{
                              borderLeft: idx === 0 ? 1 : 0,
                              borderColor: 'divider',
                              verticalAlign: 'top',
                              p: 3,
                              minWidth: 150,
                            }}
                          >
                            {action && (
                              <SortableActionCell
                                action={action}
                                isSelected={selectedAction?.id === action.id}
                                onSelect={() => onActionSelect(action)}
                              />
                            )}
                          </TableCell>
                        );
                      })}
                    </SortableContext>
                  );
                })}
              </DndContext>
            </TableRow>

            {/* タッチポイント */}
            <TableRow>
              <TableCell sx={{ width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3, color: 'text.primary' }}>タッチポイント</TableCell>
              {phaseActionsMap.map(({ phase, actions }) => {
                const columns = Math.max(1, actions.length);
                return Array.from({ length: columns }).map((_, idx) => {
                  const action = actions[idx];
                  return (
                    <TableCell
                      key={`${phase.id}-tp-${idx}`}
                      sx={{
                        borderLeft: idx === 0 ? 1 : 0,
                        borderColor: 'divider',
                        verticalAlign: 'top',
                        p: 3,
                      }}
                    >
                      {action?.touchpoints?.map((tp, i) => (
                        <Typography key={i} variant="caption" display="block" color="text.primary">
                          • {tp}
                        </Typography>
                      ))}
                    </TableCell>
                  );
                });
              })}
            </TableRow>

            {/* 思考・感情 */}
            <TableRow>
              <TableCell sx={{ width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3, color: 'text.primary' }}>思考・感情</TableCell>
              {phaseActionsMap.map(({ phase, actions }) => {
                const columns = Math.max(1, actions.length);
                return Array.from({ length: columns }).map((_, idx) => {
                  const action = actions[idx];
                  return (
                    <TableCell
                      key={`${phase.id}-tf-${idx}`}
                      sx={{
                        borderLeft: idx === 0 ? 1 : 0,
                        borderColor: 'divider',
                        verticalAlign: 'top',
                        p: 3,
                      }}
                    >
                      {action?.thoughts_feelings?.map((tf, i) => (
                        <Typography key={i} variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                          • {tf}
                        </Typography>
                      ))}
                    </TableCell>
                  );
                });
              })}
            </TableRow>

            {/* 感情曲線 */}
            <TableRow>
              <TableCell sx={{ width: 140, minWidth: 140, bgcolor: 'grey.100', fontWeight: 'bold', whiteSpace: 'nowrap', p: 3, color: 'text.primary' }}>感情曲線</TableCell>
              <TableCell colSpan={totalColumns} sx={{ p: 3 }}>
                <EmotionCurve phases={cjm.phases} actions={cjm.actions} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* アクション追加ダイアログ */}
      <Dialog open={addActionDialogOpen} onClose={handleCloseAddActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>アクション追加</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>フェーズ</InputLabel>
              <Select
                value={selectedPhaseForNewAction}
                label="フェーズ"
                onChange={(e) => setSelectedPhaseForNewAction(e.target.value)}
              >
                {cjm.phases.map((phase) => (
                  <MenuItem key={phase.id} value={phase.id}>
                    {phase.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              label="アクション名"
              fullWidth
              value={newActionName}
              onChange={(e) => setNewActionName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddActionSubmit();
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddActionDialog}>キャンセル</Button>
          <Button onClick={handleAddActionSubmit} variant="contained" disabled={!newActionName.trim()}>
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
