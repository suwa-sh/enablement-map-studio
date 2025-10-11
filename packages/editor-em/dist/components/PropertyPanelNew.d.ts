import type { EmAction, EmDsl } from '@enablement-map-studio/dsl';
interface PropertyPanelNewProps {
    selectedAction: EmAction | null;
    em: EmDsl | null;
    onEmUpdate: (em: EmDsl) => void;
    onClose: () => void;
}
export declare function PropertyPanelNew({ selectedAction, em, onEmUpdate, onClose, }: PropertyPanelNewProps): import("react/jsx-runtime").JSX.Element | null;
export {};
