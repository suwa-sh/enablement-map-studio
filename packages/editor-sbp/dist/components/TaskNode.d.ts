import { type NodeProps } from '@xyflow/react';
import type { SbpTask } from '@enablement-map-studio/dsl';
export interface TaskNodeData {
    task: SbpTask;
    isReadonly: boolean;
    isSelected: boolean;
}
export declare const TaskNode: import("react").MemoExoticComponent<({ data, selected }: NodeProps) => import("react/jsx-runtime").JSX.Element>;
