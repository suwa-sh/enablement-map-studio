import type { EmAction, EmDsl } from '@enablement-map-studio/dsl';
interface PropertyPanelProps {
    selectedAction: EmAction | null;
    em: EmDsl | null;
    onEmUpdate: (em: EmDsl) => void;
    onClose: () => void;
}
export declare function PropertyPanel({ selectedAction, em, onEmUpdate, onClose, }: PropertyPanelProps): import("react/jsx-runtime").JSX.Element | null;
export {};
