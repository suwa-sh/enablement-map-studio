import type { SbpTask, CjmDsl } from '@enablement-map-studio/dsl';
interface TaskCardProps {
    task: SbpTask;
    allTasks: SbpTask[];
    cjm: CjmDsl | null;
    isSelected: boolean;
    isConnectingTarget: boolean;
    onTaskClick: () => void;
    onConnectStart: () => void;
    onConnect: (toTaskId: string) => void;
    onDisconnect: (fromTaskId: string, toTaskId: string) => void;
}
export declare function TaskCard({ task, allTasks, cjm, isSelected, isConnectingTarget, onTaskClick, onConnectStart, onConnect, onDisconnect, }: TaskCardProps): import("react/jsx-runtime").JSX.Element;
export {};
