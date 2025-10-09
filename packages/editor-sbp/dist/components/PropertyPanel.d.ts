import type { SbpTask, SbpLane } from '@enablement-map-studio/dsl';
interface PropertyPanelProps {
    selectedTask: SbpTask | null;
    selectedLane: SbpLane | null;
    onTaskUpdate: (task: SbpTask) => void;
    onLaneUpdate: (lane: SbpLane) => void;
    onTaskDelete: (taskId: string) => void;
    onLaneDelete: (laneId: string) => void;
    onClose: () => void;
}
export declare function PropertyPanel({ selectedTask, selectedLane, onTaskUpdate, onLaneUpdate, onTaskDelete, onLaneDelete, onClose, }: PropertyPanelProps): import("react/jsx-runtime").JSX.Element | null;
export {};
