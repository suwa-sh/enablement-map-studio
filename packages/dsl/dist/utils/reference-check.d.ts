import type { CjmDsl } from '../types/cjm';
import type { SbpDsl } from '../types/sbp';
import type { OutcomeDsl } from '../types/outcome';
import type { EmDsl } from '../types/em';
import type { ParsedYaml } from './yaml-parser';
export interface ReferenceError {
    type: 'missing_reference' | 'invalid_reference';
    source: string;
    sourceId: string;
    targetKind: string;
    targetId: string;
    message: string;
}
export interface ReferenceCheckResult {
    valid: boolean;
    errors: ReferenceError[];
}
/**
 * Check reference integrity across all DSLs
 */
export declare function checkReferenceIntegrity(data: ParsedYaml): ReferenceCheckResult;
/**
 * Get all CJM Actions referenced by a specific CJM Phase
 */
export declare function getCjmActionsForPhase(cjm: CjmDsl, phaseId: string): CjmDsl['actions'];
/**
 * Get all SBP Tasks that reference a specific CJM Action
 */
export declare function getSbpTasksForCjmAction(sbp: SbpDsl, cjmActionId: string): SbpDsl['tasks'];
/**
 * Get the SBP Task referenced by an Outcome CSF
 */
export declare function getSbpTaskForOutcomeCsf(sbp: SbpDsl, csfSourceId: string): SbpDsl['tasks'][0] | undefined;
/**
 * Get all EM Actions that reference a specific SBP Task
 */
export declare function getEmActionsForSbpTask(em: EmDsl, sbpTaskId: string): EmDsl['actions'];
/**
 * Build the complete hierarchy chain: Outcome → CJM Phase → CJM Action → SBP Task → EM Actions
 */
export declare function buildHierarchyChain(data: ParsedYaml, outcomeKpiId: string): {
    kpi: OutcomeDsl['primary_kpi'] | null;
    sbpTask: SbpDsl['tasks'][0] | null;
    cjmAction: CjmDsl['actions'][0] | null;
    cjmPhase: CjmDsl['phases'][0] | null;
    emActions: EmDsl['actions'];
} | null;
//# sourceMappingURL=reference-check.d.ts.map