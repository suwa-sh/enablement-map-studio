import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';
import type {
  EmAction,
  EmSkill,
  EmKnowledge,
  EmTool,
} from '@enablement-map-studio/dsl';
import { EmCanvas } from './components/EmCanvas';
import { PropertyPanel } from './components/PropertyPanel';

export type SelectedItem =
  | { type: 'action'; item: EmAction }
  | { type: 'skill'; item: EmSkill }
  | { type: 'knowledge'; item: EmKnowledge }
  | { type: 'tool'; item: EmTool }
  | null;

export function EmEditor() {
  const em = useAppStore((state) => state.em);
  const outcome = useAppStore((state) => state.outcome);
  const sbp = useAppStore((state) => state.sbp);
  const cjm = useAppStore((state) => state.cjm);
  const updateEm = useAppStore((state) => state.updateEm);

  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  if (!em) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No EM data loaded. Please load a YAML file.</Typography>
      </Box>
    );
  }

  const handleActionUpdate = (updatedAction: EmAction) => {
    const updatedActions = em.actions.map((action) =>
      action.id === updatedAction.id ? updatedAction : action
    );
    updateEm({ ...em, actions: updatedActions });
    setSelectedItem({ type: 'action', item: updatedAction });
  };

  const handleSkillUpdate = (updatedSkill: EmSkill) => {
    const updatedSkills = (em.skills || []).map((skill) =>
      skill.id === updatedSkill.id ? updatedSkill : skill
    );
    updateEm({ ...em, skills: updatedSkills });
    setSelectedItem({ type: 'skill', item: updatedSkill });
  };

  const handleKnowledgeUpdate = (updatedKnowledge: EmKnowledge) => {
    const updatedKnowledge_ = (em.knowledge || []).map((k) =>
      k.id === updatedKnowledge.id ? updatedKnowledge : k
    );
    updateEm({ ...em, knowledge: updatedKnowledge_ });
    setSelectedItem({ type: 'knowledge', item: updatedKnowledge });
  };

  const handleToolUpdate = (updatedTool: EmTool) => {
    const updatedTools = (em.tools || []).map((tool) =>
      tool.id === updatedTool.id ? updatedTool : tool
    );
    updateEm({ ...em, tools: updatedTools });
    setSelectedItem({ type: 'tool', item: updatedTool });
  };

  const handleDelete = () => {
    if (!selectedItem) return;

    if (selectedItem.type === 'action') {
      const updatedActions = em.actions.filter((a) => a.id !== selectedItem.item.id);
      // Also delete associated resources
      const updatedSkills = (em.skills || []).filter(
        (s) => s.action_id !== selectedItem.item.id
      );
      const updatedKnowledge = (em.knowledge || []).filter(
        (k) => k.action_id !== selectedItem.item.id
      );
      const updatedTools = (em.tools || []).filter(
        (t) => t.action_id !== selectedItem.item.id
      );
      updateEm({
        ...em,
        actions: updatedActions,
        skills: updatedSkills,
        knowledge: updatedKnowledge,
        tools: updatedTools,
      });
    } else if (selectedItem.type === 'skill') {
      const updatedSkills = (em.skills || []).filter(
        (s) => s.id !== selectedItem.item.id
      );
      updateEm({ ...em, skills: updatedSkills });
    } else if (selectedItem.type === 'knowledge') {
      const updatedKnowledge = (em.knowledge || []).filter(
        (k) => k.id !== selectedItem.item.id
      );
      updateEm({ ...em, knowledge: updatedKnowledge });
    } else if (selectedItem.type === 'tool') {
      const updatedTools = (em.tools || []).filter(
        (t) => t.id !== selectedItem.item.id
      );
      updateEm({ ...em, tools: updatedTools });
    }

    setSelectedItem(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <EmCanvas
          em={em}
          outcome={outcome}
          sbp={sbp}
          cjm={cjm}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
        />
      </Box>
      <PropertyPanel
        selectedItem={selectedItem}
        onActionUpdate={handleActionUpdate}
        onSkillUpdate={handleSkillUpdate}
        onKnowledgeUpdate={handleKnowledgeUpdate}
        onToolUpdate={handleToolUpdate}
        onDelete={handleDelete}
        onClose={() => setSelectedItem(null)}
      />
    </Box>
  );
}
