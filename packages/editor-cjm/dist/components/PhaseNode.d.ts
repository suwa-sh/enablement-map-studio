import type { CjmPhase } from '@enablement-map-studio/dsl';
interface PhaseNodeData {
    phase: CjmPhase;
    selected: boolean;
    onSelect: () => void;
}
export declare const PhaseNode: import("react").MemoExoticComponent<({ data }: {
    data: PhaseNodeData;
}) => import("react/jsx-runtime").JSX.Element>;
export {};
