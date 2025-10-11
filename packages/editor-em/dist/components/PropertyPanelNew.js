import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Drawer, Typography, TextField, Button, Stack, IconButton, Divider, Paper, } from '@mui/material';
import { Close, Save, Delete, Add } from '@mui/icons-material';
import { generateId } from '@enablement-map-studio/dsl';
export function PropertyPanelNew({ selectedAction, em, onEmUpdate, onClose, }) {
    const [editedAction, setEditedAction] = useState(selectedAction);
    useEffect(() => {
        setEditedAction(selectedAction);
    }, [selectedAction]);
    const handleSave = () => {
        if (!editedAction)
            return;
        const updatedActions = em.actions.map((a) => a.id === editedAction.id ? editedAction : a);
        onEmUpdate({ ...em, actions: updatedActions });
    };
    const handleDelete = () => {
        if (!editedAction)
            return;
        if (!window.confirm('この行動を削除しますか?'))
            return;
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
        if (!editedAction)
            return;
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
        if (!editedAction)
            return;
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
        if (!editedAction)
            return;
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
    if (!editedAction)
        return null;
    const relatedSkills = (em.skills || []).filter((s) => s.action_id === editedAction.id);
    const relatedKnowledge = (em.knowledge || []).filter((k) => k.action_id === editedAction.id);
    const relatedTools = (em.tools || []).filter((t) => t.action_id === editedAction.id);
    return (_jsx(Drawer, { anchor: "right", open: !!editedAction, onClose: onClose, variant: "persistent", sx: {
            '& .MuiDrawer-paper': {
                width: '33vw',
                minWidth: 400,
                boxSizing: 'border-box',
            },
        }, children: _jsxs(Box, { sx: { p: 3, height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }, children: [_jsx(Typography, { variant: "h6", children: "\u30D7\u30ED\u30D1\u30C6\u30A3" }), _jsx(IconButton, { onClick: onClose, size: "small", children: _jsx(Close, {}) })] }), _jsx(Box, { sx: { flex: 1, overflow: 'auto' }, children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", sx: { mb: 1 }, children: "\u884C\u52D5\u540D" }), _jsx(TextField, { fullWidth: true, size: "small", value: editedAction.name, onChange: (e) => setEditedAction({ ...editedAction, name: e.target.value }) })] }), _jsx(Divider, {}), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "subtitle2", fontWeight: "bold", children: ["\u30B9\u30AD\u30EB (", relatedSkills.length, ")"] }), _jsx(Button, { size: "small", startIcon: _jsx(Add, {}), onClick: handleAddSkill, children: "\u8FFD\u52A0" })] }), relatedSkills.length === 0 && (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "\u30B9\u30AD\u30EB\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093" })), relatedSkills.map((skill) => {
                                        const handleSkillNameChange = (newName) => {
                                            const updatedSkills = (em.skills || []).map((s) => s.id === skill.id ? { ...s, name: newName } : s);
                                            onEmUpdate({ ...em, skills: updatedSkills });
                                        };
                                        const handleAddLearning = () => {
                                            const newLearning = {
                                                title: '新しい学習コンテンツ',
                                                url: '',
                                            };
                                            const updatedSkills = (em.skills || []).map((s) => s.id === skill.id
                                                ? { ...s, learnings: [...(s.learnings || []), newLearning] }
                                                : s);
                                            onEmUpdate({ ...em, skills: updatedSkills });
                                        };
                                        const handleLearningChange = (learningIndex, field, value) => {
                                            const updatedSkills = (em.skills || []).map((s) => s.id === skill.id
                                                ? {
                                                    ...s,
                                                    learnings: (s.learnings || []).map((l, idx) => idx === learningIndex ? { ...l, [field]: value } : l),
                                                }
                                                : s);
                                            onEmUpdate({ ...em, skills: updatedSkills });
                                        };
                                        const handleDeleteSkill = () => {
                                            if (!window.confirm('このスキルを削除しますか?'))
                                                return;
                                            const updatedSkills = (em.skills || []).filter((s) => s.id !== skill.id);
                                            onEmUpdate({ ...em, skills: updatedSkills });
                                        };
                                        const handleDeleteLearning = (learningIndex) => {
                                            if (!window.confirm('この学習コンテンツを削除しますか?'))
                                                return;
                                            const updatedSkills = (em.skills || []).map((s) => s.id === skill.id
                                                ? {
                                                    ...s,
                                                    learnings: (s.learnings || []).filter((_, idx) => idx !== learningIndex),
                                                }
                                                : s);
                                            onEmUpdate({ ...em, skills: updatedSkills });
                                        };
                                        return (_jsx(Paper, { elevation: 1, sx: { p: 2, mb: 2, bgcolor: 'grey.50' }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(TextField, { fullWidth: true, size: "small", label: "\u30B9\u30AD\u30EB\u540D", value: skill.name, onChange: (e) => handleSkillNameChange(e.target.value) }), _jsx(IconButton, { size: "small", color: "error", onClick: handleDeleteSkill, children: _jsx(Delete, {}) })] }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsxs(Typography, { variant: "caption", fontWeight: "medium", children: ["\u5B66\u7FD2\u30B3\u30F3\u30C6\u30F3\u30C4 (", skill.learnings?.length || 0, ")"] }), _jsx(Button, { size: "small", startIcon: _jsx(Add, {}), onClick: handleAddLearning, children: "\u8FFD\u52A0" })] }), (!skill.learnings || skill.learnings.length === 0) && (_jsx(Typography, { variant: "caption", color: "text.secondary", children: "\u5B66\u7FD2\u30B3\u30F3\u30C6\u30F3\u30C4\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093" })), skill.learnings?.map((learning, learningIndex) => (_jsx(Paper, { elevation: 0, sx: { p: 1.5, mb: 1, bgcolor: 'white', border: 1, borderColor: 'divider' }, children: _jsxs(Stack, { spacing: 1, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(TextField, { fullWidth: true, size: "small", label: "\u540D\u524D", value: learning.title, onChange: (e) => handleLearningChange(learningIndex, 'title', e.target.value) }), _jsx(IconButton, { size: "small", color: "error", onClick: () => handleDeleteLearning(learningIndex), children: _jsx(Delete, {}) })] }), _jsx(TextField, { fullWidth: true, size: "small", label: "URL", value: learning.url || '', onChange: (e) => handleLearningChange(learningIndex, 'url', e.target.value) })] }) }, learningIndex)))] })] }) }, skill.id));
                                    })] }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "subtitle2", fontWeight: "bold", children: ["\u30CA\u30EC\u30C3\u30B8 (", relatedKnowledge.length, ")"] }), _jsx(Button, { size: "small", startIcon: _jsx(Add, {}), onClick: handleAddKnowledge, children: "\u8FFD\u52A0" })] }), relatedKnowledge.length === 0 && (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "\u30CA\u30EC\u30C3\u30B8\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093" })), relatedKnowledge.map((k) => {
                                        const handleKnowledgeChange = (field, value) => {
                                            const updatedKnowledge = (em.knowledge || []).map((item) => item.id === k.id ? { ...item, [field]: value } : item);
                                            onEmUpdate({ ...em, knowledge: updatedKnowledge });
                                        };
                                        const handleDeleteKnowledge = () => {
                                            if (!window.confirm('このナレッジを削除しますか?'))
                                                return;
                                            const updatedKnowledge = (em.knowledge || []).filter((item) => item.id !== k.id);
                                            onEmUpdate({ ...em, knowledge: updatedKnowledge });
                                        };
                                        return (_jsx(Paper, { elevation: 1, sx: { p: 2, mb: 1, bgcolor: 'grey.50' }, children: _jsxs(Stack, { spacing: 1, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(TextField, { fullWidth: true, size: "small", label: "\u540D\u524D", value: k.name, onChange: (e) => handleKnowledgeChange('name', e.target.value) }), _jsx(IconButton, { size: "small", color: "error", onClick: handleDeleteKnowledge, children: _jsx(Delete, {}) })] }), _jsx(TextField, { fullWidth: true, size: "small", label: "URL", value: k.url || '', onChange: (e) => handleKnowledgeChange('url', e.target.value) })] }) }, k.id));
                                    })] }), _jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "subtitle2", fontWeight: "bold", children: ["\u30C4\u30FC\u30EB (", relatedTools.length, ")"] }), _jsx(Button, { size: "small", startIcon: _jsx(Add, {}), onClick: handleAddTool, children: "\u8FFD\u52A0" })] }), relatedTools.length === 0 && (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "\u30C4\u30FC\u30EB\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093" })), relatedTools.map((tool) => {
                                        const handleToolChange = (field, value) => {
                                            const updatedTools = (em.tools || []).map((item) => item.id === tool.id ? { ...item, [field]: value } : item);
                                            onEmUpdate({ ...em, tools: updatedTools });
                                        };
                                        const handleDeleteTool = () => {
                                            if (!window.confirm('このツールを削除しますか?'))
                                                return;
                                            const updatedTools = (em.tools || []).filter((item) => item.id !== tool.id);
                                            onEmUpdate({ ...em, tools: updatedTools });
                                        };
                                        return (_jsx(Paper, { elevation: 1, sx: { p: 2, mb: 1, bgcolor: 'grey.50' }, children: _jsxs(Stack, { spacing: 1, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(TextField, { fullWidth: true, size: "small", label: "\u540D\u524D", value: tool.name, onChange: (e) => handleToolChange('name', e.target.value) }), _jsx(IconButton, { size: "small", color: "error", onClick: handleDeleteTool, children: _jsx(Delete, {}) })] }), _jsx(TextField, { fullWidth: true, size: "small", label: "URL", value: tool.url || '', onChange: (e) => handleToolChange('url', e.target.value) })] }) }, tool.id));
                                    })] })] }) }), _jsx(Box, { sx: { mt: 3 }, children: _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(Button, { onClick: handleSave, variant: "contained", startIcon: _jsx(Save, {}), sx: { flex: 1 }, children: "SAVE" }), _jsx(Button, { onClick: handleDelete, variant: "outlined", color: "error", startIcon: _jsx(Delete, {}), sx: { flex: 1 }, children: "DELETE" })] }) })] }) }));
}
