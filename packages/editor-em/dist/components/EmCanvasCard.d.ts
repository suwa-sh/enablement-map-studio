import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl, EmAction } from '@enablement-map-studio/dsl';
interface EmCanvasCardProps {
    em: EmDsl | null;
    outcome: OutcomeDsl | null;
    sbp: SbpDsl | null;
    cjm: CjmDsl | null;
    onEmUpdate: (em: EmDsl) => void;
    onActionSelect: (action: EmAction | null) => void;
}
export declare function EmCanvasCard({ em, outcome, sbp, cjm, onEmUpdate, onActionSelect, }: EmCanvasCardProps): import("react/jsx-runtime").JSX.Element;
export {};
