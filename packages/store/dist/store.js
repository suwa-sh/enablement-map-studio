import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseYaml, exportYaml, checkReferenceIntegrity, } from '@enablement-map-studio/dsl';
const initialState = {
    cjm: null,
    sbp: null,
    outcome: null,
    em: null,
    referenceCheck: null,
};
export const useAppStore = create()(persist((set, get) => ({
    ...initialState,
    loadYaml: (content) => {
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
        }
        catch (error) {
            console.error('Failed to load YAML:', error);
            throw error;
        }
    },
    exportYaml: () => {
        const { cjm, sbp, outcome, em } = get();
        return exportYaml({ cjm, sbp, outcome, em });
    },
    updateCjm: (cjm) => {
        set({ cjm });
        get().checkReferences();
    },
    updateSbp: (sbp) => {
        set({ sbp });
        get().checkReferences();
    },
    updateOutcome: (outcome) => {
        set({ outcome });
        get().checkReferences();
    },
    updateEm: (em) => {
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
}), {
    name: 'enablement-map-studio-storage',
}));
