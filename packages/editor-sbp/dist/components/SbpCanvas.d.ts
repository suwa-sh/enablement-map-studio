import '@xyflow/react/dist/style.css';
import type { SbpDsl, SbpTask, SbpLane, CjmDsl } from '@enablement-map-studio/dsl';
interface SbpCanvasProps {
    sbp: SbpDsl;
    cjm: CjmDsl | null;
    selectedTask: SbpTask | null;
    selectedLane: SbpLane | null;
    onTaskSelect: (task: SbpTask) => void;
    onLaneSelect: (lane: SbpLane) => void;
    onTaskUpdate: (task: SbpTask) => void;
    onLaneUpdate: (lane: SbpLane) => void;
    onSbpUpdate: (sbp: SbpDsl) => void;
}
export declare function SbpCanvas({ sbp, cjm, selectedTask, onTaskSelect, onSbpUpdate, }: SbpCanvasProps): import("react/jsx-runtime").JSX.Element;
export {};
