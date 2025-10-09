import type { SbpLane, SbpTask, CjmDsl } from '@enablement-map-studio/dsl';
interface LaneRowProps {
    lane: SbpLane;
    tasks: SbpTask[];
    allTasks: SbpTask[];
    cjm: CjmDsl | null;
    isSelected: boolean;
    selectedTaskId?: string;
    connectingFrom: string | null;
    onLaneClick: () => void;
    onTaskClick: (task: SbpTask) => void;
    onConnectStart: (taskId: string) => void;
    onConnect: (fromTaskId: string, toTaskId: string) => void;
    onDisconnect: (fromTaskId: string, toTaskId: string) => void;
}
export declare function LaneRow({ lane, tasks, allTasks, cjm, isSelected, selectedTaskId, connectingFrom, onLaneClick, onTaskClick, onConnectStart, onConnect, onDisconnect, }: LaneRowProps): import("react/jsx-runtime").JSX.Element;
export {};
