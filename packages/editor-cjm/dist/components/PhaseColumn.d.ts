import type { CjmPhase, CjmAction } from '@enablement-map-studio/dsl';
interface PhaseColumnProps {
    phase: CjmPhase;
    actions: CjmAction[];
    isSelected: boolean;
    selectedActionId?: string;
    onPhaseClick: () => void;
    onActionClick: (action: CjmAction) => void;
}
export declare function PhaseColumn({ phase, actions, isSelected, selectedActionId, onPhaseClick, onActionClick, }: PhaseColumnProps): import("react/jsx-runtime").JSX.Element;
export {};
