import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';
import { EmCanvas } from './components/EmCanvas';
import { PropertyPanel } from './components/PropertyPanel';
export function EmEditor() {
    const em = useAppStore((state) => state.em);
    const outcome = useAppStore((state) => state.outcome);
    const sbp = useAppStore((state) => state.sbp);
    const cjm = useAppStore((state) => state.cjm);
    const updateEm = useAppStore((state) => state.updateEm);
    const [selectedItem, setSelectedItem] = useState(null);
    if (!em) {
        return (_jsx(Box, { sx: { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Typography, { color: "text.secondary", children: "No EM data loaded. Please load a YAML file." }) }));
    }
    const handleActionUpdate = (updatedAction) => {
        const updatedActions = em.actions.map((action) => action.id === updatedAction.id ? updatedAction : action);
        updateEm({ ...em, actions: updatedActions });
        setSelectedItem({ type: 'action', item: updatedAction });
    };
    const handleSkillUpdate = (updatedSkill) => {
        const updatedSkills = (em.skills || []).map((skill) => skill.id === updatedSkill.id ? updatedSkill : skill);
        updateEm({ ...em, skills: updatedSkills });
        setSelectedItem({ type: 'skill', item: updatedSkill });
    };
    const handleKnowledgeUpdate = (updatedKnowledge) => {
        const updatedKnowledge_ = (em.knowledge || []).map((k) => k.id === updatedKnowledge.id ? updatedKnowledge : k);
        updateEm({ ...em, knowledge: updatedKnowledge_ });
        setSelectedItem({ type: 'knowledge', item: updatedKnowledge });
    };
    const handleToolUpdate = (updatedTool) => {
        const updatedTools = (em.tools || []).map((tool) => tool.id === updatedTool.id ? updatedTool : tool);
        updateEm({ ...em, tools: updatedTools });
        setSelectedItem({ type: 'tool', item: updatedTool });
    };
    const handleDelete = () => {
        if (!selectedItem)
            return;
        if (selectedItem.type === 'action') {
            const updatedActions = em.actions.filter((a) => a.id !== selectedItem.item.id);
            // Also delete associated resources
            const updatedSkills = (em.skills || []).filter((s) => s.action_id !== selectedItem.item.id);
            const updatedKnowledge = (em.knowledge || []).filter((k) => k.action_id !== selectedItem.item.id);
            const updatedTools = (em.tools || []).filter((t) => t.action_id !== selectedItem.item.id);
            updateEm({
                ...em,
                actions: updatedActions,
                skills: updatedSkills,
                knowledge: updatedKnowledge,
                tools: updatedTools,
            });
        }
        else if (selectedItem.type === 'skill') {
            const updatedSkills = (em.skills || []).filter((s) => s.id !== selectedItem.item.id);
            updateEm({ ...em, skills: updatedSkills });
        }
        else if (selectedItem.type === 'knowledge') {
            const updatedKnowledge = (em.knowledge || []).filter((k) => k.id !== selectedItem.item.id);
            updateEm({ ...em, knowledge: updatedKnowledge });
        }
        else if (selectedItem.type === 'tool') {
            const updatedTools = (em.tools || []).filter((t) => t.id !== selectedItem.item.id);
            updateEm({ ...em, tools: updatedTools });
        }
        setSelectedItem(null);
    };
    return (_jsxs(Box, { sx: { display: 'flex', height: '100%' }, children: [_jsx(Box, { sx: { flex: 1, overflow: 'auto' }, children: _jsx(EmCanvas, { em: em, outcome: outcome, sbp: sbp, cjm: cjm, selectedItem: selectedItem, onSelectItem: setSelectedItem }) }), _jsx(PropertyPanel, { selectedItem: selectedItem, onActionUpdate: handleActionUpdate, onSkillUpdate: handleSkillUpdate, onKnowledgeUpdate: handleKnowledgeUpdate, onToolUpdate: handleToolUpdate, onDelete: handleDelete, onClose: () => setSelectedItem(null) })] }));
}
