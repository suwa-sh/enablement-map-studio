import { useEffect, useRef } from 'react';
import useUndo from 'use-undo';
import { useAppStore, type AppState } from '../store';

/**
 * Hook for managing undo/redo functionality with Zustand store
 *
 * This hook syncs the Zustand store's state with use-undo's history management.
 * It provides undo/redo functions and state that can be used in the UI.
 */
export function useUndoableStore() {
  const state = useAppStore((store) => store.state);
  const setState = useAppStore.setState;

  const [undoState, { set: setUndoState, undo, redo, canUndo, canRedo, reset: resetHistory }] = useUndo<AppState>(state);

  // Track if we're applying undo/redo to avoid circular updates
  const isApplyingHistory = useRef(false);

  // Sync Zustand state changes to undo history
  useEffect(() => {
    if (isApplyingHistory.current) {
      isApplyingHistory.current = false;
      return;
    }

    // Only add to history if state has actually changed
    if (JSON.stringify(undoState.present) !== JSON.stringify(state)) {
      setUndoState(state);
    }
  }, [state, setUndoState, undoState.present]);

  // Apply undo
  const handleUndo = () => {
    if (!canUndo) return;

    isApplyingHistory.current = true;
    undo();

    // Update Zustand store with the previous state
    setState((store) => ({
      ...store,
      state: undoState.past[undoState.past.length - 1],
    }));
  };

  // Apply redo
  const handleRedo = () => {
    if (!canRedo) return;

    isApplyingHistory.current = true;
    redo();

    // Update Zustand store with the next state
    setState((store) => ({
      ...store,
      state: undoState.future[0],
    }));
  };

  return {
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
    resetHistory,
  };
}
