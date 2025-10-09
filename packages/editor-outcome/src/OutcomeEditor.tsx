import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';
import { OutcomeCanvas } from './components/OutcomeCanvas';
import { OutcomeForm } from './components/OutcomeForm';

export function OutcomeEditor() {
  const outcome = useAppStore((state) => state.outcome);
  const sbp = useAppStore((state) => state.sbp);
  const cjm = useAppStore((state) => state.cjm);
  const updateOutcome = useAppStore((state) => state.updateOutcome);

  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

  if (!outcome) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No Outcome data loaded. Please load a YAML file.</Typography>
      </Box>
    );
  }

  if (!sbp) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No SBP data loaded. Cannot display Outcome editor.</Typography>
      </Box>
    );
  }

  const handleOutcomeUpdate = (updatedOutcome: typeof outcome) => {
    updateOutcome(updatedOutcome);
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
        />
      </Box>
      <OutcomeForm
        outcome={outcome}
        sbp={sbp}
        cjm={cjm}
        selectedPhaseId={selectedPhaseId}
        onOutcomeUpdate={handleOutcomeUpdate}
      />
    </Box>
  );
}
