import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { Close, Save, Delete } from '@mui/icons-material';
import type { SbpTask, SbpLane } from '@enablement-map-studio/dsl';

interface PropertyPanelProps {
  selectedTask: SbpTask | null;
  selectedLane: SbpLane | null;
  onTaskUpdate: (task: SbpTask) => void;
  onLaneUpdate: (lane: SbpLane) => void;
  onTaskDelete: (taskId: string) => void;
  onLaneDelete: (laneId: string) => void;
  onClose: () => void;
}

export function PropertyPanel({
  selectedTask,
  selectedLane,
  onTaskUpdate,
  onLaneUpdate,
  onTaskDelete,
  onLaneDelete,
  onClose,
}: PropertyPanelProps) {
  const [editedTask, setEditedTask] = useState<SbpTask | null>(null);
  const [editedLane, setEditedLane] = useState<SbpLane | null>(null);

  useEffect(() => {
    setEditedTask(selectedTask);
  }, [selectedTask]);

  useEffect(() => {
    setEditedLane(selectedLane);
  }, [selectedLane]);

  if (!selectedTask && !selectedLane) {
    return null;
  }

  const handleSave = () => {
    if (editedTask) {
      onTaskUpdate(editedTask);
    } else if (editedLane) {
      onLaneUpdate(editedLane);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (editedTask) {
        onTaskDelete(editedTask.id);
      } else if (editedLane) {
        onLaneDelete(editedLane.id);
      }
    }
  };

  const open = Boolean(selectedTask || selectedLane);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} variant="temporary">
      <Box sx={{ width: 360, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Properties</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {editedLane && (
          <Stack spacing={3}>
            <TextField
              label="Lane Name"
              fullWidth
              value={editedLane.name}
              onChange={(e) => setEditedLane({ ...editedLane, name: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Lane Kind</InputLabel>
              <Select
                value={editedLane.kind}
                label="Lane Kind"
                onChange={(e) =>
                  setEditedLane({
                    ...editedLane,
                    kind: e.target.value as SbpLane['kind'],
                  })
                }
              >
                <MenuItem value="cjm">CJM</MenuItem>
                <MenuItem value="human">Human</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                fullWidth
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        )}

        {editedTask && (
          <Stack spacing={3}>
            <TextField
              label="Task Name"
              fullWidth
              value={editedTask.name}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
              disabled={editedTask.readonly}
            />

            {editedTask.readonly && (
              <Alert severity="warning">
                This task is read-only (from CJM). Edit it in the CJM editor.
              </Alert>
            )}

            <TextField
              label="Source ID (CJM Action)"
              fullWidth
              value={editedTask.source_id || ''}
              onChange={(e) =>
                setEditedTask({ ...editedTask, source_id: e.target.value || undefined })
              }
              placeholder="Optional"
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                fullWidth
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                disabled={editedTask.readonly}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
