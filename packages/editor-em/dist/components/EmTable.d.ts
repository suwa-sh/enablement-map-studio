import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';
interface EmTableProps {
    em: EmDsl | null;
    outcome: OutcomeDsl | null;
    sbp: SbpDsl | null;
    cjm: CjmDsl | null;
}
export declare function EmTable({ em, outcome, sbp, cjm }: EmTableProps): import("react/jsx-runtime").JSX.Element;
export {};
