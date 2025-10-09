import type { CjmDsl, SbpDsl, OutcomeDsl, EmDsl } from '@enablement-map-studio/dsl';
import { type ReferenceCheckResult } from '@enablement-map-studio/dsl';
export interface AppStore {
    cjm: CjmDsl | null;
    sbp: SbpDsl | null;
    outcome: OutcomeDsl | null;
    em: EmDsl | null;
    referenceCheck: ReferenceCheckResult | null;
    loadYaml: (content: string) => void;
    exportYaml: () => string;
    updateCjm: (cjm: CjmDsl) => void;
    updateSbp: (sbp: SbpDsl) => void;
    updateOutcome: (outcome: OutcomeDsl) => void;
    updateEm: (em: EmDsl) => void;
    checkReferences: () => ReferenceCheckResult;
    reset: () => void;
}
export declare const useAppStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AppStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AppStore, AppStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AppStore) => void) => () => void;
        onFinishHydration: (fn: (state: AppStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AppStore, AppStore>>;
    };
}>;
//# sourceMappingURL=store.d.ts.map