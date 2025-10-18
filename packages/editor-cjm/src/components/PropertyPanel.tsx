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
  Paper,
} from '@mui/material';
import { Close, Save, Delete } from '@mui/icons-material';
import type { CjmAction, CjmPhase, CjmPersona } from '@enablement-map-studio/dsl';
import { useConfirm, TEXTAREA_ROWS } from '@enablement-map-studio/ui';

interface PropertyPanelProps {
  selectedAction: CjmAction | null;
  selectedPhase: CjmPhase | null;
  selectedPersona: CjmPersona | null;
  onActionUpdate: (action: CjmAction) => void;
  onPhaseUpdate: (phase: CjmPhase) => void;
  onPersonaUpdate: (persona: CjmPersona) => void;
  onActionDelete: (actionId: string) => void;
  onPhaseDelete: (phaseId: string) => void;
  onClose: () => void;
}

export function PropertyPanel({
  selectedAction,
  selectedPhase,
  selectedPersona,
  onActionUpdate,
  onPhaseUpdate,
  onPersonaUpdate,
  onActionDelete,
  onPhaseDelete,
  onClose,
}: PropertyPanelProps) {
  const { confirm } = useConfirm();
  const [editedAction, setEditedAction] = useState<CjmAction | null>(null);
  const [editedPhase, setEditedPhase] = useState<CjmPhase | null>(null);
  const [editedPersona, setEditedPersona] = useState<CjmPersona | null>(null);

  useEffect(() => {
    setEditedAction(selectedAction);
  }, [selectedAction]);

  useEffect(() => {
    setEditedPhase(selectedPhase);
  }, [selectedPhase]);

  useEffect(() => {
    setEditedPersona(selectedPersona);
  }, [selectedPersona]);

  const handleSave = () => {
    if (editedAction) {
      onActionUpdate(editedAction);
    } else if (editedPhase) {
      onPhaseUpdate(editedPhase);
    } else if (editedPersona) {
      onPersonaUpdate(editedPersona);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({ message: 'このアイテムを削除してもよろしいですか？' });
    if (confirmed) {
      if (editedAction) {
        onActionDelete(editedAction.id);
      } else if (editedPhase) {
        onPhaseDelete(editedPhase.id);
      }
    }
  };

  // 改行区切りテキストから空行をトリムする共通関数
  const trimLines = (value: string): string[] => {
    return value.split('\n').filter(line => line.trim() !== '');
  };

  const handleTouchpointsBlur = (value: string) => {
    if (!editedAction) return;
    setEditedAction({
      ...editedAction,
      touchpoints: trimLines(value),
    });
  };

  const handleThoughtsFeelingsBlur = (value: string) => {
    if (!editedAction) return;
    setEditedAction({
      ...editedAction,
      thoughts_feelings: trimLines(value),
    });
  };

  const open = Boolean(selectedAction || selectedPhase || selectedPersona);

  // プレビュー項目を表示する共通コンポーネント
  const PreviewItems = ({
    label,
    items,
    variant = 'caption'
  }: {
    label: string;
    items: string[] | undefined;
    variant?: 'caption' | 'body2';
  }) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
        {label}
      </Typography>
      {items && items.length > 0 ? (
        items.filter(item => item.trim() !== '').map((item, i) => (
          <Typography key={i} variant={variant} display="block" color="text.primary" sx={{ mb: variant === 'body2' ? 0.5 : 0 }}>
            • {item}
          </Typography>
        ))
      ) : (
        <Typography variant={variant} color="text.secondary" sx={{ fontStyle: 'italic' }}>
          （未入力）
        </Typography>
      )}
    </Box>
  );

  // アクションボタンを表示する共通コンポーネント
  const ActionButtons = ({ showDelete = false }: { showDelete?: boolean }) => (
    <Box sx={{ mt: 3 }}>
      {showDelete ? (
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
      ) : (
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          fullWidth
        >
          Save
        </Button>
      )}
    </Box>
  );

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
          <IconButton onClick={onClose} size="small" aria-label="close">
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {editedPersona && (
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                label="ペルソナ名"
                fullWidth
                value={editedPersona.name}
                onChange={(e) => setEditedPersona({ ...editedPersona, name: e.target.value })}
              />

              <TextField
                label="説明"
                fullWidth
                multiline
                minRows={TEXTAREA_ROWS.LARGE}
                value={editedPersona.description || ''}
                onChange={(e) =>
                  setEditedPersona({ ...editedPersona, description: e.target.value })
                }
                placeholder="ペルソナの説明を入力"
              />
            </Stack>
          )}

          {editedPhase && (
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                label="フェーズ名"
                fullWidth
                value={editedPhase.name}
                onChange={(e) => setEditedPhase({ ...editedPhase, name: e.target.value })}
              />
            </Stack>
          )}

          {editedAction && (
            <Stack spacing={3} sx={{ pt: 1 }}>
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
                minRows={TEXTAREA_ROWS.SMALL}
                value={editedAction.touchpoints?.join('\n') || ''}
                onChange={(e) =>
                  setEditedAction({
                    ...editedAction,
                    touchpoints: e.target.value.split('\n'),
                  })
                }
                onBlur={(e) => handleTouchpointsBlur(e.target.value)}
                placeholder="1行に1つ入力"
              />

              <TextField
                label="思考・感情"
                fullWidth
                multiline
                minRows={TEXTAREA_ROWS.SMALL}
                value={editedAction.thoughts_feelings?.join('\n') || ''}
                onChange={(e) =>
                  setEditedAction({
                    ...editedAction,
                    thoughts_feelings: e.target.value.split('\n'),
                  })
                }
                onBlur={(e) => handleThoughtsFeelingsBlur(e.target.value)}
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

              {/* プレビューセクション */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: 'grey.50',
                }}
              >
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  プレビュー
                </Typography>
                <PreviewItems label="タッチポイント:" items={editedAction.touchpoints} variant="caption" />
                <PreviewItems label="思考・感情:" items={editedAction.thoughts_feelings} variant="body2" />
              </Paper>
            </Stack>
          )}
        </Box>

        {/* Actions */}
        {editedPersona && <ActionButtons />}
        {editedPhase && <ActionButtons showDelete />}
        {editedAction && <ActionButtons showDelete />}
      </Box>
    </Drawer>
  );
}
