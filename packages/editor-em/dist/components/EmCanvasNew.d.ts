import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl, EmAction } from '@enablement-map-studio/dsl';
interface EmCanvasNewProps {
    em: EmDsl;
    outcome: OutcomeDsl | null;
    sbp: SbpDsl | null;
    cjm: CjmDsl | null;
    onEmUpdate: (em: EmDsl) => void;
    onActionSelect: (action: EmAction) => void;
}
export declare function EmCanvasNew({ em, outcome, sbp, cjm, onEmUpdate, onActionSelect, }: EmCanvasNewProps): import("react/jsx-runtime").JSX.Element;
export {};
