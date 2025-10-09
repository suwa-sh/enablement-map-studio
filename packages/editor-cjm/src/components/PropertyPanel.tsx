import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Slider,
} from '@mui/material';
import { Close, Save, Delete } from '@mui/icons-material';
import type { CjmAction, CjmPhase } from '@enablement-map-studio/dsl';

interface PropertyPanelProps {
  selectedAction: CjmAction | null;
  selectedPhase: CjmPhase | null;
  onActionUpdate: (action: CjmAction) => void;
  onPhaseUpdate: (phase: CjmPhase) => void;
  onActionDelete: (actionId: string) => void;
  onPhaseDelete: (phaseId: string) => void;
  onClose: () => void;
}

export function PropertyPanel({
  selectedAction,
  selectedPhase,
  onActionUpdate,
  onPhaseUpdate,
  onActionDelete,
  onPhaseDelete,
  onClose,
}: PropertyPanelProps) {
  const [editedAction, setEditedAction] = useState<CjmAction | null>(null);
  const [editedPhase, setEditedPhase] = useState<CjmPhase | null>(null);

  useEffect(() => {
    setEditedAction(selectedAction);
  }, [selectedAction]);

  useEffect(() => {
    setEditedPhase(selectedPhase);
  }, [selectedPhase]);

  const handleSave = () => {
    if (editedAction) {
      onActionUpdate(editedAction);
    } else if (editedPhase) {
      onPhaseUpdate(editedPhase);
    }
  };

  const handleDelete = () => {
    if (window.confirm('このアイテムを削除してもよろしいですか？')) {
      if (editedAction) {
        onActionDelete(editedAction.id);
      } else if (editedPhase) {
        onPhaseDelete(editedPhase.id);
      }
    }
  };

  const open = Boolean(selectedAction || selectedPhase);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} variant="temporary">
      <Box sx={{ width: '33vw', minWidth: 400, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Properties</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {editedPhase && (
          <Stack spacing={3}>
            <TextField
              label="フェーズ名"
              fullWidth
              value={editedPhase.name}
              onChange={(e) => setEditedPhase({ ...editedPhase, name: e.target.value })}
            />

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
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                sx={{ flex: 1 }}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        )}

        {editedAction && (
          <Stack spacing={3}>
            <TextField
              label="アクション"
              fullWidth
              value={editedAction.name}
              onChange={(e) => setEditedAction({ ...editedAction, name: e.target.value })}
            />

            <TextField
              label="タッチポイント"
              fullWidth
              multiline
              rows={3}
              value={editedAction.touchpoints?.join('\n') || ''}
              onChange={(e) =>
                setEditedAction({
                  ...editedAction,
                  touchpoints: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="1行に1つ入力"
            />

            <TextField
              label="思考・感情"
              fullWidth
              multiline
              rows={3}
              value={editedAction.thoughts_feelings?.join('\n') || ''}
              onChange={(e) =>
                setEditedAction({
                  ...editedAction,
                  thoughts_feelings: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="1行に1つ入力"
            />

            <Box>
              <Typography gutterBottom>感情スコア: {editedAction.emotion_score}</Typography>
              <Slider
                value={editedAction.emotion_score}
                onChange={(_e, value) =>
                  setEditedAction({ ...editedAction, emotion_score: value as number })
                }
                min={-2}
                max={2}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

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
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                sx={{ flex: 1 }}
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
