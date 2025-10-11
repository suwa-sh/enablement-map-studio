import type { OutcomeDsl, SbpDsl } from '@enablement-map-studio/dsl';
interface PropertyPanelProps {
    outcome: OutcomeDsl | null;
    sbp: SbpDsl;
    onOutcomeUpdate: (outcome: OutcomeDsl) => void;
    onClose: () => void;
}
export declare function PropertyPanel({ outcome, sbp, onOutcomeUpdate, onClose, }: PropertyPanelProps): import("react/jsx-runtime").JSX.Element | null;
export {};
