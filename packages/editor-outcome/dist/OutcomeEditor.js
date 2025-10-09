import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAppStore } from '@enablement-map-studio/store';
import { OutcomeCanvas } from './components/OutcomeCanvas';
import { OutcomeForm } from './components/OutcomeForm';
export function OutcomeEditor() {
    const outcome = useAppStore((state) => state.outcome);
    const sbp = useAppStore((state) => state.sbp);
    const cjm = useAppStore((state) => state.cjm);
    const updateOutcome = useAppStore((state) => state.updateOutcome);
    const [selectedPhaseId, setSelectedPhaseId] = useState(null);
    if (!outcome) {
        return (_jsx("div", { className: "flex h-full items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "No Outcome data loaded. Please load a YAML file." }) }));
    }
    if (!sbp) {
        return (_jsx("div", { className: "flex h-full items-center justify-center", children: _jsx("p", { className: "text-gray-500", children: "No SBP data loaded. Cannot display Outcome editor." }) }));
    }
    const handleOutcomeUpdate = (updatedOutcome) => {
        updateOutcome(updatedOutcome);
    };
    return (_jsxs("div", { className: "flex h-full", children: [_jsx("div", { className: "flex-1 overflow-auto", children: _jsx(OutcomeCanvas, { outcome: outcome, sbp: sbp, cjm: cjm, selectedPhaseId: selectedPhaseId, onPhaseSelect: setSelectedPhaseId }) }), _jsx(OutcomeForm, { outcome: outcome, sbp: sbp, cjm: cjm, selectedPhaseId: selectedPhaseId, onOutcomeUpdate: handleOutcomeUpdate })] }));
}
