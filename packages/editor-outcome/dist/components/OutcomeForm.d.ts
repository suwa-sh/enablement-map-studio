import type { OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';
interface OutcomeFormProps {
    outcome: OutcomeDsl;
    sbp: SbpDsl;
    cjm: CjmDsl | null;
    selectedPhaseId: string | null;
    onOutcomeUpdate: (outcome: OutcomeDsl) => void;
}
export declare function OutcomeForm({ outcome, sbp, onOutcomeUpdate, }: OutcomeFormProps): import("react/jsx-runtime").JSX.Element;
export {};
