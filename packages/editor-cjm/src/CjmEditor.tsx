import { useState } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import type { CjmAction, CjmPhase, CjmDsl } from '@enablement-map-studio/dsl';
import { CjmCanvas } from './components/CjmCanvas';
import { PropertyPanel } from './components/PropertyPanel';

export function CjmEditor() {
  const cjm = useAppStore((state) => state.state.cjm);
  const updateCjm = useAppStore((state) => state.updateCjm);

  const [selectedAction, setSelectedAction] = useState<CjmAction | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<CjmPhase | null>(null);

  const handleActionUpdate = (updatedAction: CjmAction) => {
    if (!cjm) return;
    const updatedActions = cjm.actions.map((action) =>
      action.id === updatedAction.id ? updatedAction : action
    );
    updateCjm({ ...cjm, actions: updatedActions });
    setSelectedAction(updatedAction);
  };

  const handlePhaseUpdate = (updatedPhase: CjmPhase) => {
    if (!cjm) return;
    const updatedPhases = cjm.phases.map((phase) =>
      phase.id === updatedPhase.id ? updatedPhase : phase
    );
    updateCjm({ ...cjm, phases: updatedPhases });
    setSelectedPhase(updatedPhase);
  };

  const handleActionDelete = (actionId: string) => {
    if (!cjm) return;
    const updatedActions = cjm.actions.filter((action) => action.id !== actionId);
    updateCjm({ ...cjm, actions: updatedActions });
    setSelectedAction(null);
  };

  const handlePhaseDelete = (phaseId: string) => {
    if (!cjm) return;
    // Delete phase and all associated actions
    const updatedPhases = cjm.phases.filter((phase) => phase.id !== phaseId);
    const updatedActions = cjm.actions.filter((action) => action.phase !== phaseId);
    updateCjm({ ...cjm, phases: updatedPhases, actions: updatedActions });
    setSelectedPhase(null);
  };

  const handleAddPhase = () => {
    const newPhase: CjmPhase = {
      id: generateId('cjm', 'phase'),
      name: '新しいフェーズ',
    };

    const newAction: CjmAction = {
      id: generateId('cjm', 'action'),
      name: 'アクション 1',
      phase: newPhase.id,
      emotion_score: 0,
      touchpoints: [],
      thoughts_feelings: [],
    };

    // cjmがnullの場合は初期化してから追加
    if (!cjm) {
      updateCjm({
        kind: 'cjm',
        version: '1.0',
        id: generateId('cjm', 'cjm'),
        phases: [newPhase],
        actions: [newAction],
      });
    } else {
      updateCjm({
        ...cjm,
        phases: [...cjm.phases, newPhase],
        actions: [...cjm.actions, newAction],
      });
    }
    setSelectedPhase(newPhase);
  };

  const handleAddAction = (phaseId: string, actionName: string) => {
    if (!cjm) return;
    const newAction: CjmAction = {
      id: generateId('cjm', 'action'),
      name: actionName,
      phase: phaseId,
      emotion_score: 0,
      touchpoints: [],
      thoughts_feelings: [],
    };
    updateCjm({ ...cjm, actions: [...cjm.actions, newAction] });
    setSelectedAction(newAction);
  };

  const handleReorderActions = (reorderedActions: CjmAction[]) => {
    if (!cjm) return;
    updateCjm({ ...cjm, actions: reorderedActions });
  };

  const handleReorderPhases = (reorderedPhases: CjmPhase[]) => {
    if (!cjm) return;
    updateCjm({ ...cjm, phases: reorderedPhases });
  };

  const handlePersonaUpdate = (personaName: string) => {
    if (!cjm) return;
    updateCjm({
      ...cjm,
      persona: personaName.trim() ? { name: personaName.trim() } : undefined,
    });
  };

  // 空状態の表示
  if (!cjm) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddPhase}
          >
            フェーズ追加
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            disabled
          >
            アクション追加
          </Button>
        </Stack>
        <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">フェーズを追加する か YAML をロードしてください</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <CjmCanvas
          cjm={cjm}
          selectedAction={selectedAction}
          selectedPhase={selectedPhase}
          onActionSelect={setSelectedAction}
          onPhaseSelect={setSelectedPhase}
          onAddPhase={handleAddPhase}
          onAddAction={handleAddAction}
          onReorderActions={handleReorderActions}
          onReorderPhases={handleReorderPhases}
          onPersonaUpdate={handlePersonaUpdate}
        />
      </Box>
      <PropertyPanel
        selectedAction={selectedAction}
        selectedPhase={selectedPhase}
        onActionUpdate={handleActionUpdate}
        onPhaseUpdate={handlePhaseUpdate}
        onActionDelete={handleActionDelete}
        onPhaseDelete={handlePhaseDelete}
        onClose={() => {
          setSelectedAction(null);
          setSelectedPhase(null);
        }}
      />
    </Box>
  );
}
