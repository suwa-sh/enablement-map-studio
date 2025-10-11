import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import type { OutcomeDsl } from '@enablement-map-studio/dsl';
import { OutcomeCanvas } from './components/OutcomeCanvas';
import { PropertyPanel } from './components/PropertyPanel';

export function OutcomeEditor() {
  const outcome = useAppStore((state) => state.state.outcome);
  const sbp = useAppStore((state) => state.state.sbp);
  const cjm = useAppStore((state) => state.state.cjm);
  const updateOutcome = useAppStore((state) => state.updateOutcome);

  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);

  // SBPが存在し、Outcomeがnullの場合は自動初期化
  useEffect(() => {
    if (!outcome && sbp) {
      const firstTask = sbp.tasks[0];
      const kgiId = generateId('outcome', 'kgi');
      const csfId = generateId('outcome', 'csf');
      const kpiId = generateId('outcome', 'kpi');

      const initialOutcome: OutcomeDsl = {
        kind: 'outcome',
        version: '1.0',
        id: generateId('outcome', 'outcome'),
        kgi: {
          id: kgiId,
          name: '新しいKGI',
        },
        primary_csf: {
          id: csfId,
          kgi_id: kgiId,
          source_id: firstTask?.id || '',
          rationale: '',
        },
        primary_kpi: {
          id: kpiId,
          csf_id: csfId,
          name: '新しいKPI',
          target: 0,
        },
      };

      updateOutcome(initialOutcome);
      setShowPropertyPanel(true);
    }
  }, [outcome, sbp, updateOutcome]);

  // 空状態の表示（SBPが存在しない場合）
  if (!sbp) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">CJMとSBPを作成する か YAML をロードしてください</Typography>
      </Box>
    );
  }

  // Outcomeの初期化中
  if (!outcome) {
    return null;
  }

  const handleTaskClick = (taskId: string) => {
    const updatedOutcome: OutcomeDsl = {
      ...outcome,
      primary_csf: {
        ...outcome.primary_csf,
        source_id: taskId,
      },
    };
    updateOutcome(updatedOutcome);
    setShowPropertyPanel(true);
  };

  const handleOutcomeUpdate = (updatedOutcome: OutcomeDsl) => {
    updateOutcome(updatedOutcome);
  };

  const handleClosePropertyPanel = () => {
    setShowPropertyPanel(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <OutcomeCanvas
          outcome={outcome}
          sbp={sbp}
          cjm={cjm}
          selectedPhaseId={selectedPhaseId}
          onPhaseSelect={setSelectedPhaseId}
          onTaskClick={handleTaskClick}
        />
      </Box>
      <PropertyPanel
        outcome={showPropertyPanel ? outcome : null}
        sbp={sbp}
        onOutcomeUpdate={handleOutcomeUpdate}
        onClose={handleClosePropertyPanel}
      />
    </Box>
  );
}
