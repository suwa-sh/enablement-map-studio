import type { OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';
interface OutcomeCanvasProps {
    outcome: OutcomeDsl;
    sbp: SbpDsl;
    cjm: CjmDsl | null;
    selectedPhaseId: string | null;
    onPhaseSelect: (phaseId: string | null) => void;
}
export declare function OutcomeCanvas({ outcome, sbp, cjm, selectedPhaseId, onPhaseSelect, }: OutcomeCanvasProps): import("react/jsx-runtime").JSX.Element;
export {};
