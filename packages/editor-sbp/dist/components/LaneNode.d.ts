import { type NodeProps, type OnResize, type OnResizeEnd } from '@xyflow/react';
import type { SbpLane } from '@enablement-map-studio/dsl';
export interface LaneNodeData {
    lane: SbpLane;
    onResize?: OnResize;
    onResizeEnd?: OnResizeEnd;
}
export declare const LaneNode: import("react").MemoExoticComponent<({ data, selected }: NodeProps) => import("react/jsx-runtime").JSX.Element>;
