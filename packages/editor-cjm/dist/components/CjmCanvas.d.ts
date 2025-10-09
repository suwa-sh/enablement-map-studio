import type { CjmDsl, CjmAction, CjmPhase } from '@enablement-map-studio/dsl';
interface CjmCanvasProps {
    cjm: CjmDsl;
    selectedAction: CjmAction | null;
    selectedPhase: CjmPhase | null;
    onActionSelect: (action: CjmAction) => void;
    onPhaseSelect: (phase: CjmPhase) => void;
    onActionUpdate: (action: CjmAction) => void;
    onPhaseUpdate: (phase: CjmPhase) => void;
}
export declare function CjmCanvas({ cjm, selectedAction, selectedPhase, onActionSelect, onPhaseSelect, }: CjmCanvasProps): import("react/jsx-runtime").JSX.Element;
export {};
