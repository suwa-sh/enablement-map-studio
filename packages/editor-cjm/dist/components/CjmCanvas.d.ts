import type { CjmDsl, CjmAction, CjmPhase } from '@enablement-map-studio/dsl';
interface CjmCanvasProps {
    cjm: CjmDsl;
    selectedAction: CjmAction | null;
    selectedPhase: CjmPhase | null;
    onActionSelect: (action: CjmAction) => void;
    onPhaseSelect: (phase: CjmPhase) => void;
    onAddPhase: () => void;
    onAddAction: (phaseId: string, actionName: string) => void;
    onReorderActions: (actions: CjmAction[]) => void;
    onReorderPhases: (phases: CjmPhase[]) => void;
}
export declare function CjmCanvas({ cjm, selectedAction, selectedPhase, onActionSelect, onPhaseSelect, onAddPhase, onAddAction, onReorderActions, onReorderPhases, }: CjmCanvasProps): import("react/jsx-runtime").JSX.Element;
export {};
