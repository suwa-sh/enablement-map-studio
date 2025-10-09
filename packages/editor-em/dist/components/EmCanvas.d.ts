import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';
import type { SelectedItem } from '../EmEditor';
interface EmCanvasProps {
    em: EmDsl;
    outcome: OutcomeDsl | null;
    sbp: SbpDsl | null;
    cjm: CjmDsl | null;
    selectedItem: SelectedItem;
    onSelectItem: (item: SelectedItem) => void;
}
export declare function EmCanvas({ em, outcome, sbp, cjm, selectedItem, onSelectItem, }: EmCanvasProps): import("react/jsx-runtime").JSX.Element;
export {};
