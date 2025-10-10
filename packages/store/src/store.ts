import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal, type TemporalState } from 'zundo';
import type { CjmDsl, SbpDsl, OutcomeDsl, EmDsl } from '@enablement-map-studio/dsl';
import {
  parseYaml,
  exportYaml,
  checkReferenceIntegrity,
  type ReferenceCheckResult,
} from '@enablement-map-studio/dsl';

export interface AppStore {
  // DSL data
  cjm: CjmDsl | null;
  sbp: SbpDsl | null;
  outcome: OutcomeDsl | null;
  em: EmDsl | null;

  // Reference check result
  referenceCheck: ReferenceCheckResult | null;

  // Actions
  loadYaml: (content: string) => void;
  exportYaml: () => string;
  updateCjm: (cjm: CjmDsl) => void;
  updateSbp: (sbp: SbpDsl) => void;
  updateOutcome: (outcome: OutcomeDsl) => void;
  updateEm: (em: EmDsl) => void;
  checkReferences: () => ReferenceCheckResult;
  reset: () => void;
}

const initialState = {
  cjm: null,
  sbp: null,
  outcome: null,
  em: null,
  referenceCheck: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    temporal(
      (set, get) => ({
        ...initialState,

        loadYaml: (content: string) => {
          try {
            const parsed = parseYaml(content);
            const refCheck = checkReferenceIntegrity(parsed);

            set({
              cjm: parsed.cjm,
              sbp: parsed.sbp,
              outcome: parsed.outcome,
              em: parsed.em,
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
          const { cjm, sbp, outcome, em } = get();
          return exportYaml({ cjm, sbp, outcome, em });
        },

        updateCjm: (cjm: CjmDsl) => {
          set({ cjm });
          get().checkReferences();
        },

        updateSbp: (sbp: SbpDsl) => {
          set({ sbp });
          get().checkReferences();
        },

        updateOutcome: (outcome: OutcomeDsl) => {
          set({ outcome });
          get().checkReferences();
        },

        updateEm: (em: EmDsl) => {
          set({ em });
          get().checkReferences();
        },

        checkReferences: () => {
          const { cjm, sbp, outcome, em } = get();
          const refCheck = checkReferenceIntegrity({ cjm, sbp, outcome, em });
          set({ referenceCheck: refCheck });
          return refCheck;
        },

        reset: () => set(initialState),
      }),
      {
        limit: 50,
        equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
        partialize: (state) => {
          const { cjm, sbp, outcome, em } = state;
          return { cjm, sbp, outcome, em } as Partial<Pick<AppStore, 'cjm' | 'sbp' | 'outcome' | 'em'>>;
        },
      }
    ),
    {
      name: 'enablement-map-studio-storage',
    }
  )
);

// Temporal store用のリアクティブフック
export const useTemporalStore = <T,>(
  selector: (state: TemporalState<Partial<Pick<AppStore, 'cjm' | 'sbp' | 'outcome' | 'em'>>>) => T,
  equality?: (a: T, b: T) => boolean
): T => {
  // useAppStore.temporalはストアなので、そのまま使える
  // zundoのドキュメントに従い、useStoreWithEqualityFnを使う代わりに
  // Zustandの標準的な方法でサブスクライブ
  if (equality) {
    return (useAppStore.temporal as any)(selector, equality);
  }
  return (useAppStore.temporal as any)(selector);
};
