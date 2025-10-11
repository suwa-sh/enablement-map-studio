import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseYaml, exportYaml, checkReferenceIntegrity, } from '@enablement-map-studio/dsl';
const initialState = {
    cjm: null,
    sbp: null,
    outcome: null,
    em: null,
};
const storeImpl = (set, get) => ({
    state: initialState,
    referenceCheck: null,
    loadYaml: (content) => {
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
        }
        catch (error) {
            console.error('Failed to load YAML:', error);
            throw error;
        }
    },
    exportYaml: () => {
        const { state } = get();
        return exportYaml(state);
    },
    updateCjm: (cjm) => {
        set((store) => ({ state: { ...store.state, cjm } }));
        get().checkReferences();
    },
    updateSbp: (sbp) => {
        set((store) => ({ state: { ...store.state, sbp } }));
        get().checkReferences();
    },
    updateOutcome: (outcome) => {
        set((store) => ({ state: { ...store.state, outcome } }));
        get().checkReferences();
    },
    updateEm: (em) => {
        set((store) => ({ state: { ...store.state, em } }));
        get().checkReferences();
    },
    checkReferences: () => {
        const { state } = get();
        const refCheck = checkReferenceIntegrity(state);
        set({ referenceCheck: refCheck });
        return refCheck;
    },
    reset: () => set({ state: initialState, referenceCheck: null }),
});
export const useAppStore = create()(persist(storeImpl, {
    name: 'enablement-map-studio-storage',
    partialize: (store) => ({
        state: store.state,
        referenceCheck: store.referenceCheck,
    }),
}));
