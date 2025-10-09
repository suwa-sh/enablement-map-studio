import type { SbpDsl, SbpTask, SbpLane, CjmDsl } from '@enablement-map-studio/dsl';
interface SbpCanvasProps {
    sbp: SbpDsl;
    cjm: CjmDsl | null;
    selectedTask: SbpTask | null;
    selectedLane: SbpLane | null;
    connectingFrom: string | null;
    onTaskSelect: (task: SbpTask) => void;
    onLaneSelect: (lane: SbpLane) => void;
    onTaskUpdate: (task: SbpTask) => void;
    onLaneUpdate: (lane: SbpLane) => void;
    onConnectStart: (taskId: string) => void;
    onConnect: (fromTaskId: string, toTaskId: string) => void;
    onDisconnect: (fromTaskId: string, toTaskId: string) => void;
}
export declare function SbpCanvas({ sbp, cjm, selectedTask, selectedLane, connectingFrom, onTaskSelect, onLaneSelect, onConnectStart, onConnect, onDisconnect, }: SbpCanvasProps): import("react/jsx-runtime").JSX.Element;
export {};
