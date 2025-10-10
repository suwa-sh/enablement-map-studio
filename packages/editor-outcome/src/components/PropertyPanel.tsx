import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import type { OutcomeDsl, SbpDsl } from '@enablement-map-studio/dsl';

interface PropertyPanelProps {
  outcome: OutcomeDsl | null;
  sbp: SbpDsl;
  onOutcomeUpdate: (outcome: OutcomeDsl) => void;
  onClose: () => void;
}

const UNIT_OPTIONS = ['%', '件', '円', '時間', '人', '回', 'pt'];

export function PropertyPanel({
  outcome,
  sbp,
  onOutcomeUpdate,
  onClose,
}: PropertyPanelProps) {
  const [editedOutcome, setEditedOutcome] = useState<OutcomeDsl | null>(outcome);
  const [isTargetFocused, setIsTargetFocused] = useState(false);

  useEffect(() => {
    setEditedOutcome(outcome);
  }, [outcome]);

  const handleSave = () => {
    if (editedOutcome) {
      onOutcomeUpdate(editedOutcome);
    }
  };

  if (!editedOutcome) return null;

  const selectedTask = editedOutcome.primary_csf.source_id
    ? sbp.tasks.find((t) => t.id === editedOutcome.primary_csf.source_id)
    : null;

  return (
    <Drawer
      anchor="right"
      open={!!editedOutcome}
      onClose={onClose}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          width: '33vw',
          minWidth: 400,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">プロパティ</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Stack spacing={3}>
            {/* KGI Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                KGI (重要目標達成指標)
              </Typography>
              <TextField
                label="名前"
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
                CSF (重要成功要因)
              </Typography>

              {selectedTask && (
                <Paper elevation={0} sx={{ mb: 2, p: 2, border: 1, borderColor: 'success.main', bgcolor: 'success.lighter' }}>
                  <Typography variant="caption" fontWeight="medium" color="success.dark">ソースタスク</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedTask.name}</Typography>
                </Paper>
              )}

              <TextField
                label="説明"
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
            </Box>

            {/* KPI Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                KPI (重要業績評価指標)
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="名前"
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
                  label="説明"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="オプション"
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
                    label="目標値"
                    fullWidth
                    size="small"
                    type={isTargetFocused ? "number" : "text"}
                    value={
                      isTargetFocused
                        ? editedOutcome.primary_kpi.target
                        : editedOutcome.primary_kpi.target.toLocaleString('ja-JP', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })
                    }
                    onChange={(e) =>
                      setEditedOutcome({
                        ...editedOutcome,
                        primary_kpi: {
                          ...editedOutcome.primary_kpi,
                          target: Number(e.target.value),
                        },
                      })
                    }
                    onFocus={() => setIsTargetFocused(true)}
                    onBlur={() => setIsTargetFocused(false)}
                  />

                  <FormControl fullWidth size="small">
                    <InputLabel>ユニット</InputLabel>
                    <Select
                      value={editedOutcome.primary_kpi.unit || ''}
                      label="ユニット"
                      onChange={(e) =>
                        setEditedOutcome({
                          ...editedOutcome,
                          primary_kpi: {
                            ...editedOutcome.primary_kpi,
                            unit: e.target.value,
                          },
                        })
                      }
                    >
                      <MenuItem value="">
                        <em>選択なし</em>
                      </MenuItem>
                      {UNIT_OPTIONS.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Save button */}
        <Box sx={{ mt: 3 }}>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<Save />}
            fullWidth
          >
            SAVE
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
