import { type AppState } from '../store';
/**
 * Hook for managing undo/redo functionality with Zustand store
 *
 * This hook syncs the Zustand store's state with use-undo's history management.
 * It provides undo/redo functions and state that can be used in the UI.
 */
export declare function useUndoableStore(): {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    resetHistory: (newPresent: AppState) => void;
};
//# sourceMappingURL=useUndoableStore.d.ts.map