import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';
export interface HierarchyNode {
    id: string;
    type: 'outcome' | 'phase' | 'action' | 'task' | 'em-action';
    name: string;
    children: HierarchyNode[];
    data?: any;
}
/**
 * Build hierarchy: Outcome → CJM Phase → CJM Action → SBP Task → EM Actions
 */
export declare function buildHierarchy(em: EmDsl, outcome: OutcomeDsl | null, sbp: SbpDsl | null, cjm: CjmDsl | null): HierarchyNode[];
