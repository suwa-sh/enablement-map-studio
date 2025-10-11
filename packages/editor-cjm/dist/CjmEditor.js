import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import { CjmCanvas } from './components/CjmCanvas';
import { PropertyPanel } from './components/PropertyPanel';
export function CjmEditor() {
    const cjm = useAppStore((state) => state.state.cjm);
    const updateCjm = useAppStore((state) => state.updateCjm);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedPhase, setSelectedPhase] = useState(null);
    const [selectedPersona, setSelectedPersona] = useState(null);
    const handleActionUpdate = (updatedAction) => {
        if (!cjm)
            return;
        const updatedActions = cjm.actions.map((action) => action.id === updatedAction.id ? updatedAction : action);
        updateCjm({ ...cjm, actions: updatedActions });
        setSelectedAction(updatedAction);
    };
    const handlePhaseUpdate = (updatedPhase) => {
        if (!cjm)
            return;
        const updatedPhases = cjm.phases.map((phase) => phase.id === updatedPhase.id ? updatedPhase : phase);
        updateCjm({ ...cjm, phases: updatedPhases });
        setSelectedPhase(updatedPhase);
    };
    const handleActionDelete = (actionId) => {
        if (!cjm)
            return;
        const updatedActions = cjm.actions.filter((action) => action.id !== actionId);
        updateCjm({ ...cjm, actions: updatedActions });
        setSelectedAction(null);
    };
    const handlePhaseDelete = (phaseId) => {
        if (!cjm)
            return;
        // Delete phase and all associated actions
        const updatedPhases = cjm.phases.filter((phase) => phase.id !== phaseId);
        const updatedActions = cjm.actions.filter((action) => action.phase !== phaseId);
        updateCjm({ ...cjm, phases: updatedPhases, actions: updatedActions });
        setSelectedPhase(null);
    };
    const handleAddPhase = () => {
        const newPhase = {
            id: generateId('cjm', 'phase'),
            name: '新しいフェーズ',
        };
        const newAction = {
            id: generateId('cjm', 'action'),
            name: 'アクション 1',
            phase: newPhase.id,
            emotion_score: 0,
            touchpoints: [],
            thoughts_feelings: [],
        };
        // cjmがnullの場合は初期化してから追加
        if (!cjm) {
            updateCjm({
                kind: 'cjm',
                version: '1.0',
                id: `cjm:${Date.now()}`,
                phases: [newPhase],
                actions: [newAction],
            });
        }
        else {
            updateCjm({
                ...cjm,
                phases: [...cjm.phases, newPhase],
                actions: [...cjm.actions, newAction],
            });
        }
        setSelectedPhase(newPhase);
    };
    const handleAddAction = (phaseId, actionName) => {
        if (!cjm)
            return;
        const newAction = {
            id: generateId('cjm', 'action'),
            name: actionName,
            phase: phaseId,
            emotion_score: 0,
            touchpoints: [],
            thoughts_feelings: [],
        };
        updateCjm({ ...cjm, actions: [...cjm.actions, newAction] });
        setSelectedAction(newAction);
    };
    const handleReorderActions = (reorderedActions) => {
        if (!cjm)
            return;
        updateCjm({ ...cjm, actions: reorderedActions });
    };
    const handleReorderPhases = (reorderedPhases) => {
        if (!cjm)
            return;
        updateCjm({ ...cjm, phases: reorderedPhases });
    };
    const handlePersonaSelect = () => {
        if (!cjm)
            return;
        // Clear other selections
        setSelectedAction(null);
        setSelectedPhase(null);
        // Set persona (create if doesn't exist)
        setSelectedPersona(cjm.persona || { name: '' });
    };
    const handlePersonaUpdate = (updatedPersona) => {
        if (!cjm)
            return;
        updateCjm({
            ...cjm,
            persona: updatedPersona.name.trim() ? updatedPersona : undefined,
        });
        setSelectedPersona(updatedPersona);
    };
    // 空状態の表示
    if (!cjm) {
        return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', height: '100%', p: 3 }, children: [_jsxs(Stack, { direction: "row", spacing: 2, sx: { mb: 2 }, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleAddPhase, children: "\u30D5\u30A7\u30FC\u30BA\u8FFD\u52A0" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), disabled: true, children: "\u30A2\u30AF\u30B7\u30E7\u30F3\u8FFD\u52A0" })] }), _jsx(Box, { sx: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }, children: _jsx(Typography, { color: "text.secondary", children: "\u30D5\u30A7\u30FC\u30BA\u3092\u8FFD\u52A0\u3059\u308B \u304B YAML \u3092\u30ED\u30FC\u30C9\u3057\u3066\u304F\u3060\u3055\u3044" }) })] }));
    }
    return (_jsxs(Box, { sx: { display: 'flex', height: '100%' }, children: [_jsx(Box, { sx: { flex: 1, overflow: 'auto' }, children: _jsx(CjmCanvas, { cjm: cjm, selectedAction: selectedAction, selectedPhase: selectedPhase, onActionSelect: (action) => {
                        setSelectedAction(action);
                        setSelectedPhase(null);
                        setSelectedPersona(null);
                    }, onPhaseSelect: (phase) => {
                        setSelectedPhase(phase);
                        setSelectedAction(null);
                        setSelectedPersona(null);
                    }, onPersonaSelect: handlePersonaSelect, onAddPhase: handleAddPhase, onAddAction: handleAddAction, onReorderActions: handleReorderActions, onReorderPhases: handleReorderPhases }) }), _jsx(PropertyPanel, { selectedAction: selectedAction, selectedPhase: selectedPhase, selectedPersona: selectedPersona, onActionUpdate: handleActionUpdate, onPhaseUpdate: handlePhaseUpdate, onPersonaUpdate: handlePersonaUpdate, onActionDelete: handleActionDelete, onPhaseDelete: handlePhaseDelete, onClose: () => {
                    setSelectedAction(null);
                    setSelectedPhase(null);
                    setSelectedPersona(null);
                } })] }));
}
