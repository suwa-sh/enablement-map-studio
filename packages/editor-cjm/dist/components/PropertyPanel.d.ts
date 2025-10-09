import type { CjmAction, CjmPhase } from '@enablement-map-studio/dsl';
interface PropertyPanelProps {
    selectedAction: CjmAction | null;
    selectedPhase: CjmPhase | null;
    onActionUpdate: (action: CjmAction) => void;
    onPhaseUpdate: (phase: CjmPhase) => void;
    onActionDelete: (actionId: string) => void;
    onPhaseDelete: (phaseId: string) => void;
    onClose: () => void;
}
export declare function PropertyPanel({ selectedAction, selectedPhase, onActionUpdate, onPhaseUpdate, onActionDelete, onPhaseDelete, onClose, }: PropertyPanelProps): import("react/jsx-runtime").JSX.Element | null;
export {};
