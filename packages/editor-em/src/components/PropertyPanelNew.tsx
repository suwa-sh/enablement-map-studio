import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import { Close, Save, Delete, Add } from '@mui/icons-material';
import type {
  EmAction,
  EmDsl,
} from '@enablement-map-studio/dsl';
import { generateId } from '@enablement-map-studio/dsl';

interface PropertyPanelNewProps {
  selectedAction: EmAction | null;
  em: EmDsl | null;
  onEmUpdate: (em: EmDsl) => void;
  onClose: () => void;
}

export function PropertyPanelNew({
  selectedAction,
  em,
  onEmUpdate,
  onClose,
}: PropertyPanelNewProps) {
  const [editedAction, setEditedAction] = useState<EmAction | null>(selectedAction);

  useEffect(() => {
    setEditedAction(selectedAction);
  }, [selectedAction]);

  const handleSave = () => {
    if (!editedAction || !em) return;

    const updatedActions = em.actions.map((a) =>
      a.id === editedAction.id ? editedAction : a
    );

    onEmUpdate({ ...em, actions: updatedActions });
  };

  const handleDelete = () => {
    if (!editedAction || !em) return;
    if (!window.confirm('この行動を削除しますか?')) return;

    // Delete action and related resources
    const updatedActions = em.actions.filter((a) => a.id !== editedAction.id);
    const updatedSkills = (em.skills || []).filter((s) => s.action_id !== editedAction.id);
    const updatedKnowledge = (em.knowledge || []).filter((k) => k.action_id !== editedAction.id);
    const updatedTools = (em.tools || []).filter((t) => t.action_id !== editedAction.id);

    onEmUpdate({
      ...em,
      actions: updatedActions,
      skills: updatedSkills,
      knowledge: updatedKnowledge,
      tools: updatedTools,
    });

    onClose();
  };

  const handleAddSkill = () => {
    if (!editedAction || !em) return;

    const newSkill = {
      id: generateId('em', 'skill'),
      name: '新しいスキル',
      action_id: editedAction.id,
      learnings: [],
    };

    onEmUpdate({
      ...em,
      skills: [...(em.skills || []), newSkill],
    });
  };

  const handleAddKnowledge = () => {
    if (!editedAction || !em) return;

    const newKnowledge = {
      id: generateId('em', 'knowledge'),
      name: '新しいナレッジ',
      action_id: editedAction.id,
      url: '',
    };

    onEmUpdate({
      ...em,
      knowledge: [...(em.knowledge || []), newKnowledge],
    });
  };

  const handleAddTool = () => {
    if (!editedAction || !em) return;

    const newTool = {
      id: generateId('em', 'tool'),
      name: '新しいツール',
      action_id: editedAction.id,
      url: '',
    };

    onEmUpdate({
      ...em,
      tools: [...(em.tools || []), newTool],
    });
  };

  if (!editedAction || !em) return null;

  const relatedSkills = (em.skills || []).filter((s) => s.action_id === editedAction.id);
  const relatedKnowledge = (em.knowledge || []).filter((k) => k.action_id === editedAction.id);
  const relatedTools = (em.tools || []).filter((t) => t.action_id === editedAction.id);

  return (
    <Drawer
      anchor="right"
      open={!!editedAction}
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
            {/* Action Name */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                行動名
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editedAction.name}
                onChange={(e) =>
                  setEditedAction({ ...editedAction, name: e.target.value })
                }
              />
            </Box>

            <Divider />

            {/* Skills */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  スキル ({relatedSkills.length})
                </Typography>
                <Button size="small" startIcon={<Add />} onClick={handleAddSkill}>
                  追加
                </Button>
              </Box>
              {relatedSkills.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  スキルが設定されていません
                </Typography>
              )}
              {relatedSkills.map((skill) => {
                const handleSkillNameChange = (newName: string) => {
                  const updatedSkills = (em.skills || []).map((s) =>
                    s.id === skill.id ? { ...s, name: newName } : s
                  );
                  onEmUpdate({ ...em, skills: updatedSkills });
                };

                const handleAddLearning = () => {
                  const newLearning = {
                    title: '新しい学習コンテンツ',
                    url: '',
                  };
                  const updatedSkills = (em.skills || []).map((s) =>
                    s.id === skill.id
                      ? { ...s, learnings: [...(s.learnings || []), newLearning] }
                      : s
                  );
                  onEmUpdate({ ...em, skills: updatedSkills });
                };

                const handleLearningChange = (learningIndex: number, field: 'title' | 'url', value: string) => {
                  const updatedSkills = (em.skills || []).map((s) =>
                    s.id === skill.id
                      ? {
                          ...s,
                          learnings: (s.learnings || []).map((l, idx) =>
                            idx === learningIndex ? { ...l, [field]: value } : l
                          ),
                        }
                      : s
                  );
                  onEmUpdate({ ...em, skills: updatedSkills });
                };

                const handleDeleteSkill = () => {
                  if (!window.confirm('このスキルを削除しますか?')) return;
                  const updatedSkills = (em.skills || []).filter((s) => s.id !== skill.id);
                  onEmUpdate({ ...em, skills: updatedSkills });
                };

                const handleDeleteLearning = (learningIndex: number) => {
                  if (!window.confirm('この学習コンテンツを削除しますか?')) return;
                  const updatedSkills = (em.skills || []).map((s) =>
                    s.id === skill.id
                      ? {
                          ...s,
                          learnings: (s.learnings || []).filter((_, idx) => idx !== learningIndex),
                        }
                      : s
                  );
                  onEmUpdate({ ...em, skills: updatedSkills });
                };

                return (
                  <Paper key={skill.id} elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Stack spacing={2}>
                      {/* Skill name and delete */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="スキル名"
                          value={skill.name}
                          onChange={(e) => handleSkillNameChange(e.target.value)}
                        />
                        <IconButton size="small" color="error" onClick={handleDeleteSkill}>
                          <Delete />
                        </IconButton>
                      </Box>

                      {/* Learnings */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" fontWeight="medium">
                            学習コンテンツ ({skill.learnings?.length || 0})
                          </Typography>
                          <Button size="small" startIcon={<Add />} onClick={handleAddLearning}>
                            追加
                          </Button>
                        </Box>
                        {(!skill.learnings || skill.learnings.length === 0) && (
                          <Typography variant="caption" color="text.secondary">
                            学習コンテンツが設定されていません
                          </Typography>
                        )}
                        {skill.learnings?.map((learning, learningIndex) => (
                          <Paper key={learningIndex} elevation={0} sx={{ p: 1.5, mb: 1, bgcolor: 'white', border: 1, borderColor: 'divider' }}>
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="名前"
                                  value={learning.title}
                                  onChange={(e) => handleLearningChange(learningIndex, 'title', e.target.value)}
                                />
                                <IconButton size="small" color="error" onClick={() => handleDeleteLearning(learningIndex)}>
                                  <Delete />
                                </IconButton>
                              </Box>
                              <TextField
                                fullWidth
                                size="small"
                                label="URL"
                                value={learning.url || ''}
                                onChange={(e) => handleLearningChange(learningIndex, 'url', e.target.value)}
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>

            {/* Knowledge */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  ナレッジ ({relatedKnowledge.length})
                </Typography>
                <Button size="small" startIcon={<Add />} onClick={handleAddKnowledge}>
                  追加
                </Button>
              </Box>
              {relatedKnowledge.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  ナレッジが設定されていません
                </Typography>
              )}
              {relatedKnowledge.map((k) => {
                const handleKnowledgeChange = (field: 'name' | 'url', value: string) => {
                  const updatedKnowledge = (em.knowledge || []).map((item) =>
                    item.id === k.id ? { ...item, [field]: value } : item
                  );
                  onEmUpdate({ ...em, knowledge: updatedKnowledge });
                };

                const handleDeleteKnowledge = () => {
                  if (!window.confirm('このナレッジを削除しますか?')) return;
                  const updatedKnowledge = (em.knowledge || []).filter((item) => item.id !== k.id);
                  onEmUpdate({ ...em, knowledge: updatedKnowledge });
                };

                return (
                  <Paper key={k.id} elevation={1} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="名前"
                          value={k.name}
                          onChange={(e) => handleKnowledgeChange('name', e.target.value)}
                        />
                        <IconButton size="small" color="error" onClick={handleDeleteKnowledge}>
                          <Delete />
                        </IconButton>
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        label="URL"
                        value={k.url || ''}
                        onChange={(e) => handleKnowledgeChange('url', e.target.value)}
                      />
                    </Stack>
                  </Paper>
                );
              })}
            </Box>

            {/* Tools */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  ツール ({relatedTools.length})
                </Typography>
                <Button size="small" startIcon={<Add />} onClick={handleAddTool}>
                  追加
                </Button>
              </Box>
              {relatedTools.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  ツールが設定されていません
                </Typography>
              )}
              {relatedTools.map((tool) => {
                const handleToolChange = (field: 'name' | 'url', value: string) => {
                  const updatedTools = (em.tools || []).map((item) =>
                    item.id === tool.id ? { ...item, [field]: value } : item
                  );
                  onEmUpdate({ ...em, tools: updatedTools });
                };

                const handleDeleteTool = () => {
                  if (!window.confirm('このツールを削除しますか?')) return;
                  const updatedTools = (em.tools || []).filter((item) => item.id !== tool.id);
                  onEmUpdate({ ...em, tools: updatedTools });
                };

                return (
                  <Paper key={tool.id} elevation={1} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="名前"
                          value={tool.name}
                          onChange={(e) => handleToolChange('name', e.target.value)}
                        />
                        <IconButton size="small" color="error" onClick={handleDeleteTool}>
                          <Delete />
                        </IconButton>
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        label="URL"
                        value={tool.url || ''}
                        onChange={(e) => handleToolChange('url', e.target.value)}
                      />
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          </Stack>
        </Box>

        {/* Actions */}
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={<Save />}
              sx={{ flex: 1 }}
            >
              SAVE
            </Button>
            <Button
              onClick={handleDelete}
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              sx={{ flex: 1 }}
            >
              DELETE
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
