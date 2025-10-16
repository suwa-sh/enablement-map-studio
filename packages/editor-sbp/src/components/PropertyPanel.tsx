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
import { useConfirm } from '@enablement-map-studio/ui';

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
  const { confirm } = useConfirm();
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

  const handleDelete = async () => {
    const confirmed = await confirm({ message: 'このアイテムを削除してもよろしいですか？' });
    if (confirmed) {
      if (editedTask) {
        onTaskDelete(editedTask.id);
      } else if (editedLane) {
        onLaneDelete(editedLane.id);
      }
    }
  };

  const open = Boolean(selectedTask || selectedLane);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">プロパティ</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {editedLane && (
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                label="レーン名"
                fullWidth
                value={editedLane.name}
                onChange={(e) => setEditedLane({ ...editedLane, name: e.target.value })}
              />

              <FormControl fullWidth>
                <InputLabel>レーン種別</InputLabel>
                <Select
                  value={editedLane.kind === 'cjm' ? 'cjm' : editedLane.kind}
                  label="レーン種別"
                  disabled={editedLane.kind === 'cjm'}
                  onChange={(e) =>
                    setEditedLane({
                      ...editedLane,
                      kind: e.target.value as SbpLane['kind'],
                    })
                  }
                >
                  {editedLane.kind === 'cjm' && <MenuItem value="cjm">顧客 (CJM連動)</MenuItem>}
                  <MenuItem value="human">Human</MenuItem>
                  <MenuItem value="team">Team</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
                {editedLane.kind === 'cjm' && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    CJM連動レーンの種別は変更できません
                  </Typography>
                )}
              </FormControl>
            </Stack>
          )}

          {editedTask && (
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                label="タスク名"
                fullWidth
                value={editedTask.name}
                onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                disabled={editedTask.readonly}
              />

              {editedTask.readonly && (
                <Alert severity="warning">
                  このタスクは読み取り専用です（CJM連動）。CJMエディタで編集してください。
                </Alert>
              )}

              {!editedTask.readonly && (
                <TextField
                  label="ソースID (CJMアクション)"
                  fullWidth
                  value={editedTask.source_id || ''}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, source_id: e.target.value || undefined })
                  }
                  placeholder="任意"
                  helperText="CJMアクションと連携する場合、アクションIDを指定"
                />
              )}
            </Stack>
          )}
        </Box>

        {/* Actions */}
        {editedLane && (
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ flex: 1 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                sx={{ flex: 1 }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        )}

        {editedTask && (
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ flex: 1 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                disabled={editedTask.readonly}
                sx={{ flex: 1 }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
