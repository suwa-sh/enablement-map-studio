import type { CjmAction } from '@enablement-map-studio/dsl';
interface ActionCardProps {
    action: CjmAction;
    isSelected: boolean;
    onClick: () => void;
}
export declare function ActionCard({ action, isSelected, onClick }: ActionCardProps): import("react/jsx-runtime").JSX.Element;
export {};
