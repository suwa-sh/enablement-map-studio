import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CjmDsl, SbpDsl, OutcomeDsl, EmDsl } from '@enablement-map-studio/dsl';
import {
  parseYaml,
  exportYaml,
  checkReferenceIntegrity,
  type ReferenceCheckResult,
} from '@enablement-map-studio/dsl';

// File metadata for tracking file state
export interface FileMetadata {
  fileName: string;
  lastSaved: Date;
  hasUnsavedChanges: boolean;
}

// Nested state for undo/redo
export interface AppState {
  cjm: CjmDsl | null;
  sbp: SbpDsl | null;
  outcome: OutcomeDsl | null;
  em: EmDsl | null;
}

export interface AppStore {
  // Nested DSL data (tracked by undo/redo)
  state: AppState;

  // Reference check result (not tracked)
  referenceCheck: ReferenceCheckResult | null;

  // File metadata (tracked for save state)
  fileMetadata: FileMetadata | null;

  // Actions
  loadYaml: (content: string) => void;
  exportYaml: () => string;
  updateCjm: (cjm: CjmDsl) => void;
  updateSbp: (sbp: SbpDsl) => void;
  updateOutcome: (outcome: OutcomeDsl) => void;
  updateEm: (em: EmDsl) => void;
  checkReferences: () => ReferenceCheckResult;
  reset: () => void;

  // File metadata actions
  setFileMetadata: (metadata: FileMetadata | null) => void;
  markAsModified: () => void;
  markAsSaved: () => void;
}

const initialState: AppState = {
  cjm: null,
  sbp: null,
  outcome: null,
  em: null,
};

const storeImpl = (set: any, get: any): AppStore => ({
  state: initialState,
  referenceCheck: null,
  fileMetadata: null,

  loadYaml: (content: string) => {
    try {
      const parsed = parseYaml(content);
      const refCheck = checkReferenceIntegrity(parsed);

      set({
        state: {
          cjm: parsed.cjm,
          sbp: parsed.sbp,
          outcome: parsed.outcome,
          em: parsed.em,
        },
        referenceCheck: refCheck,
      });

      if (!refCheck.valid) {
        console.warn('Reference integrity check failed:', refCheck.errors);
      }
    } catch (error) {
      console.error('Failed to load YAML:', error);
      throw error;
    }
  },

  exportYaml: () => {
    const { state } = get();
    return exportYaml(state);
  },

  updateCjm: (cjm: CjmDsl) => {
    set((store: AppStore) => ({ state: { ...store.state, cjm } }));
    get().checkReferences();
    get().markAsModified();
  },

  updateSbp: (sbp: SbpDsl) => {
    set((store: AppStore) => ({ state: { ...store.state, sbp } }));
    get().checkReferences();
    get().markAsModified();
  },

  updateOutcome: (outcome: OutcomeDsl) => {
    set((store: AppStore) => ({ state: { ...store.state, outcome } }));
    get().checkReferences();
    get().markAsModified();
  },

  updateEm: (em: EmDsl) => {
    set((store: AppStore) => ({ state: { ...store.state, em } }));
    get().checkReferences();
    get().markAsModified();
  },

  checkReferences: () => {
    const { state } = get();
    const refCheck = checkReferenceIntegrity(state);
    set({ referenceCheck: refCheck });
    return refCheck;
  },

  reset: () =>
    set({ state: initialState, referenceCheck: null, fileMetadata: null }),

  setFileMetadata: (metadata: FileMetadata | null) => {
    set({ fileMetadata: metadata });
  },

  markAsModified: () => {
    const { fileMetadata } = get();
    if (fileMetadata) {
      set({
        fileMetadata: {
          ...fileMetadata,
          hasUnsavedChanges: true,
        },
      });
    }
  },

  markAsSaved: () => {
    const { fileMetadata } = get();
    if (fileMetadata) {
      set({
        fileMetadata: {
          ...fileMetadata,
          hasUnsavedChanges: false,
          lastSaved: new Date(),
        },
      });
    }
  },
});

export const useAppStore = create<AppStore>()(
  persist(storeImpl, {
    name: 'enablement-map-studio-storage',
    partialize: (store) => ({
      state: store.state,
      referenceCheck: store.referenceCheck,
      fileMetadata: store.fileMetadata,
    }),
  })
);
