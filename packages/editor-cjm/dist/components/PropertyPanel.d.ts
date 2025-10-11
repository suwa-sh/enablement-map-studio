import type { CjmAction, CjmPhase, CjmPersona } from '@enablement-map-studio/dsl';
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
export declare function PropertyPanel({ selectedAction, selectedPhase, selectedPersona, onActionUpdate, onPhaseUpdate, onPersonaUpdate, onActionDelete, onPhaseDelete, onClose, }: PropertyPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
