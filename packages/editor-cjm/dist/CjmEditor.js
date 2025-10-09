import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAppStore } from '@enablement-map-studio/store';
import { CjmCanvas } from './components/CjmCanvas';
import { PropertyPanel } from './components/PropertyPanel';
export function CjmEditor() {
    const cjm = useAppStore((state) => state.cjm);
    const updateCjm = useAppStore((state) => state.updateCjm);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedPhase, setSelectedPhase] = useState(null);
    if (!cjm) {
        return (_jsx("div", { className: "flex h-full items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "No CJM data loaded. Please load a YAML file." }) }));
    }
    const handleActionUpdate = (updatedAction) => {
        const updatedActions = cjm.actions.map((action) => action.id === updatedAction.id ? updatedAction : action);
        updateCjm({ ...cjm, actions: updatedActions });
        setSelectedAction(updatedAction);
    };
    const handlePhaseUpdate = (updatedPhase) => {
        const updatedPhases = cjm.phases.map((phase) => phase.id === updatedPhase.id ? updatedPhase : phase);
        updateCjm({ ...cjm, phases: updatedPhases });
        setSelectedPhase(updatedPhase);
    };
    const handleActionDelete = (actionId) => {
        const updatedActions = cjm.actions.filter((action) => action.id !== actionId);
        updateCjm({ ...cjm, actions: updatedActions });
        setSelectedAction(null);
    };
    const handlePhaseDelete = (phaseId) => {
        // Delete phase and all associated actions
        const updatedPhases = cjm.phases.filter((phase) => phase.id !== phaseId);
        const updatedActions = cjm.actions.filter((action) => action.phase !== phaseId);
        updateCjm({ ...cjm, phases: updatedPhases, actions: updatedActions });
        setSelectedPhase(null);
    };
    return (_jsxs("div", { className: "flex h-full", children: [_jsx("div", { className: "flex-1 overflow-auto", children: _jsx(CjmCanvas, { cjm: cjm, selectedAction: selectedAction, selectedPhase: selectedPhase, onActionSelect: setSelectedAction, onPhaseSelect: setSelectedPhase, onActionUpdate: handleActionUpdate, onPhaseUpdate: handlePhaseUpdate }) }), _jsx(PropertyPanel, { selectedAction: selectedAction, selectedPhase: selectedPhase, onActionUpdate: handleActionUpdate, onPhaseUpdate: handlePhaseUpdate, onActionDelete: handleActionDelete, onPhaseDelete: handlePhaseDelete, onClose: () => {
                    setSelectedAction(null);
                    setSelectedPhase(null);
                } })] }));
}
