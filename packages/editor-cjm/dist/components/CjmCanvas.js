import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PhaseColumn } from './PhaseColumn';
import { EmotionCurve } from './EmotionCurve';
export function CjmCanvas({ cjm, selectedAction, selectedPhase, onActionSelect, onPhaseSelect, }) {
    return (_jsxs("div", { className: "h-full bg-gray-50 p-6", children: [cjm.persona && (_jsxs("div", { className: "mb-6 rounded-lg bg-white p-4 shadow", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Persona" }), _jsx("p", { className: "mt-1 text-gray-700", children: cjm.persona.name })] })), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "flex gap-4 overflow-x-auto pb-32", children: cjm.phases.map((phase) => {
                            const phaseActions = cjm.actions.filter((action) => action.phase === phase.id);
                            return (_jsx(PhaseColumn, { phase: phase, actions: phaseActions, isSelected: selectedPhase?.id === phase.id, selectedActionId: selectedAction?.id, onPhaseClick: () => onPhaseSelect(phase), onActionClick: onActionSelect }, phase.id));
                        }) }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-24 bg-white shadow-inner", children: _jsx(EmotionCurve, { phases: cjm.phases, actions: cjm.actions }) })] })] }));
}
