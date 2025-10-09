import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import type { CjmAction, CjmPhase } from '@enablement-map-studio/dsl';
import { CjmCanvas } from './components/CjmCanvas';
import { PropertyPanel } from './components/PropertyPanel';

export function CjmEditor() {
  const cjm = useAppStore((state) => state.cjm);
  const updateCjm = useAppStore((state) => state.updateCjm);

  const [selectedAction, setSelectedAction] = useState<CjmAction | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<CjmPhase | null>(null);

  if (!cjm) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No CJM data loaded. Please load a YAML file.</Typography>
      </Box>
    );
  }

  const handleActionUpdate = (updatedAction: CjmAction) => {
    const updatedActions = cjm.actions.map((action) =>
      action.id === updatedAction.id ? updatedAction : action
    );
    updateCjm({ ...cjm, actions: updatedActions });
    setSelectedAction(updatedAction);
  };

  const handlePhaseUpdate = (updatedPhase: CjmPhase) => {
    const updatedPhases = cjm.phases.map((phase) =>
      phase.id === updatedPhase.id ? updatedPhase : phase
    );
    updateCjm({ ...cjm, phases: updatedPhases });
    setSelectedPhase(updatedPhase);
  };

  const handleActionDelete = (actionId: string) => {
    const updatedActions = cjm.actions.filter((action) => action.id !== actionId);
    updateCjm({ ...cjm, actions: updatedActions });
    setSelectedAction(null);
  };

  const handlePhaseDelete = (phaseId: string) => {
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

    updateCjm({
      ...cjm,
      phases: [...cjm.phases, newPhase],
      actions: [...cjm.actions, newAction],
    });
    setSelectedPhase(newPhase);
  };

  const handleAddAction = (phaseId: string, actionName: string) => {
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
    updateCjm({ ...cjm, actions: reorderedActions });
  };

  const handleReorderPhases = (reorderedPhases: CjmPhase[]) => {
    updateCjm({ ...cjm, phases: reorderedPhases });
  };

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
