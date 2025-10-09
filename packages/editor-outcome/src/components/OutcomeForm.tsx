import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Alert,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import type { OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';

interface OutcomeFormProps {
  outcome: OutcomeDsl;
  sbp: SbpDsl;
  cjm: CjmDsl | null;
  selectedPhaseId: string | null;
  onOutcomeUpdate: (outcome: OutcomeDsl) => void;
}

export function OutcomeForm({
  outcome,
  sbp,
  // cjm,
  // selectedPhaseId,
  onOutcomeUpdate,
}: OutcomeFormProps) {
  const [editedOutcome, setEditedOutcome] = useState<OutcomeDsl>(outcome);

  useEffect(() => {
    setEditedOutcome(outcome);
  }, [outcome]);

  const handleSave = () => {
    onOutcomeUpdate(editedOutcome);
  };

  const selectedTask = editedOutcome.primary_csf.source_id
    ? sbp.tasks.find((t) => t.id === editedOutcome.primary_csf.source_id)
    : null;

  return (
    <Box sx={{ width: 384, overflow: 'auto', borderLeft: 1, borderColor: 'divider', bgcolor: 'white', p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Outcome Definition</Typography>

      <Stack spacing={3}>
        {/* KGI Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            KGI (Key Goal Indicator)
          </Typography>
          <TextField
            label="Name"
            fullWidth
            size="small"
            value={editedOutcome.kgi.name}
            onChange={(e) =>
              setEditedOutcome({
                ...editedOutcome,
                kgi: { ...editedOutcome.kgi, name: e.target.value },
              })
            }
          />
        </Box>

        {/* CSF Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            CSF (Critical Success Factor)
          </Typography>

          {selectedTask && (
            <Paper elevation={0} sx={{ mb: 2, p: 2, border: 1, borderColor: 'success.main', bgcolor: 'success.lighter' }}>
              <Typography variant="caption" fontWeight="medium" color="success.dark">Source Task</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedTask.name}</Typography>
            </Paper>
          )}

          <TextField
            label="Rationale"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={editedOutcome.primary_csf.rationale}
            onChange={(e) =>
              setEditedOutcome({
                ...editedOutcome,
                primary_csf: {
                  ...editedOutcome.primary_csf,
                  rationale: e.target.value,
                },
              })
            }
          />

          {/* Drag & Drop hint */}
          <Alert severity="info" sx={{ mt: 2 }}>
            To change CSF source, select a task from the canvas above (Drag & drop not implemented in this version)
          </Alert>
        </Box>

        {/* KPI Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            KPI (Key Performance Indicator)
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Name"
              fullWidth
              size="small"
              value={editedOutcome.primary_kpi.name}
              onChange={(e) =>
                setEditedOutcome({
                  ...editedOutcome,
                  primary_kpi: {
                    ...editedOutcome.primary_kpi,
                    name: e.target.value,
                  },
                })
              }
            />

            <TextField
              label="Definition"
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Optional"
              value={editedOutcome.primary_kpi.definition || ''}
              onChange={(e) =>
                setEditedOutcome({
                  ...editedOutcome,
                  primary_kpi: {
                    ...editedOutcome.primary_kpi,
                    definition: e.target.value,
                  },
                })
              }
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Unit"
                fullWidth
                size="small"
                placeholder="e.g., %"
                value={editedOutcome.primary_kpi.unit || ''}
                onChange={(e) =>
                  setEditedOutcome({
                    ...editedOutcome,
                    primary_kpi: {
                      ...editedOutcome.primary_kpi,
                      unit: e.target.value,
                    },
                  })
                }
              />

              <TextField
                label="Target"
                fullWidth
                size="small"
                type="number"
                value={editedOutcome.primary_kpi.target}
                onChange={(e) =>
                  setEditedOutcome({
                    ...editedOutcome,
                    primary_kpi: {
                      ...editedOutcome.primary_kpi,
                      target: Number(e.target.value),
                    },
                  })
                }
              />
            </Stack>
          </Stack>
        </Box>

        {/* Save button */}
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          fullWidth
        >
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
}
