import type { CjmAction } from '@enablement-map-studio/dsl';
interface ActionNodeData {
    action: CjmAction;
    selected: boolean;
    onSelect: () => void;
}
export declare const ActionNode: import("react").MemoExoticComponent<({ data }: {
    data: ActionNodeData;
}) => import("react/jsx-runtime").JSX.Element>;
export {};
