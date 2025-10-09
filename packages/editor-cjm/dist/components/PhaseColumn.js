import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ActionCard } from './ActionCard';
export function PhaseColumn({ phase, actions, isSelected, selectedActionId, onPhaseClick, onActionClick, }) {
    return (_jsxs("div", { className: "min-w-[300px] flex-shrink-0", children: [_jsx("button", { onClick: onPhaseClick, className: `mb-4 w-full rounded-t-lg p-4 text-left font-semibold transition-colors ${isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'}`, children: phase.name }), _jsx("div", { className: "space-y-4", children: actions.map((action) => (_jsx(ActionCard, { action: action, isSelected: selectedActionId === action.id, onClick: () => onActionClick(action) }, action.id))) })] }));
}
