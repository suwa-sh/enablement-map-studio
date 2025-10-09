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
export function checkReferenceIntegrity(
  data: ParsedYaml
): ReferenceCheckResult {
  const errors: ReferenceError[] = [];

  // Check SBP Task → CJM Action references
  if (data.sbp && data.cjm) {
    errors.push(...checkSbpToCjmReferences(data.sbp, data.cjm));
  }

  // Check Outcome CSF → SBP Task references
  if (data.outcome && data.sbp) {
    errors.push(...checkOutcomeToSbpReferences(data.outcome, data.sbp));
  }

  // Check EM Action → SBP Task references
  if (data.em && data.sbp) {
    errors.push(...checkEmToSbpReferences(data.em, data.sbp));
  }

  // Check EM Outcome → Outcome KPI references
  if (data.em && data.outcome) {
    errors.push(...checkEmOutcomeToOutcomeReferences(data.em, data.outcome));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check SBP Task source_id references to CJM Actions
 */
function checkSbpToCjmReferences(
  sbp: SbpDsl,
  cjm: CjmDsl
): ReferenceError[] {
  const errors: ReferenceError[] = [];
  const cjmActionIds = new Set(cjm.actions.map((a) => a.id));

  for (const task of sbp.tasks) {
    if (task.source_id && !cjmActionIds.has(task.source_id)) {
      errors.push({
        type: 'missing_reference',
        source: 'sbp:task',
        sourceId: task.id,
        targetKind: 'cjm:action',
        targetId: task.source_id,
        message: `SBP Task "${task.name}" (${task.id}) references non-existent CJM Action: ${task.source_id}`,
      });
    }
  }

  return errors;
}

/**
 * Check Outcome CSF source_id references to SBP Tasks
 */
function checkOutcomeToSbpReferences(
  outcome: OutcomeDsl,
  sbp: SbpDsl
): ReferenceError[] {
  const errors: ReferenceError[] = [];
  const sbpTaskIds = new Set(sbp.tasks.map((t) => t.id));

  if (outcome.primary_csf?.source_id) {
    if (!sbpTaskIds.has(outcome.primary_csf.source_id)) {
      errors.push({
        type: 'missing_reference',
        source: 'outcome:csf',
        sourceId: outcome.primary_csf.id,
        targetKind: 'sbp:task',
        targetId: outcome.primary_csf.source_id,
        message: `Outcome CSF (${outcome.primary_csf.id}) references non-existent SBP Task: ${outcome.primary_csf.source_id}`,
      });
    }
  }

  return errors;
}

/**
 * Check EM Action source_id references to SBP Tasks
 */
function checkEmToSbpReferences(em: EmDsl, sbp: SbpDsl): ReferenceError[] {
  const errors: ReferenceError[] = [];
  const sbpTaskIds = new Set(sbp.tasks.map((t) => t.id));

  for (const action of em.actions) {
    if (action.source_id && !sbpTaskIds.has(action.source_id)) {
      errors.push({
        type: 'missing_reference',
        source: 'em:action',
        sourceId: action.id,
        targetKind: 'sbp:task',
        targetId: action.source_id,
        message: `EM Action "${action.name}" (${action.id}) references non-existent SBP Task: ${action.source_id}`,
      });
    }
  }

  return errors;
}

/**
 * Check EM Outcome source_id references to Outcome KPI
 */
function checkEmOutcomeToOutcomeReferences(
  em: EmDsl,
  outcome: OutcomeDsl
): ReferenceError[] {
  const errors: ReferenceError[] = [];
  const outcomeKpiId = outcome.primary_kpi.id;

  for (const emOutcome of em.outcomes) {
    if (emOutcome.source_id && emOutcome.source_id !== outcomeKpiId) {
      errors.push({
        type: 'missing_reference',
        source: 'em:outcome',
        sourceId: emOutcome.id,
        targetKind: 'outcome:kpi',
        targetId: emOutcome.source_id,
        message: `EM Outcome (${emOutcome.id}) references non-existent Outcome KPI: ${emOutcome.source_id}`,
      });
    }
  }

  return errors;
}

/**
 * Get all CJM Actions referenced by a specific CJM Phase
 */
export function getCjmActionsForPhase(
  cjm: CjmDsl,
  phaseId: string
): CjmDsl['actions'] {
  return cjm.actions.filter((action) => action.phase === phaseId);
}

/**
 * Get all SBP Tasks that reference a specific CJM Action
 */
export function getSbpTasksForCjmAction(
  sbp: SbpDsl,
  cjmActionId: string
): SbpDsl['tasks'] {
  return sbp.tasks.filter((task) => task.source_id === cjmActionId);
}

/**
 * Get the SBP Task referenced by an Outcome CSF
 */
export function getSbpTaskForOutcomeCsf(
  sbp: SbpDsl,
  csfSourceId: string
): SbpDsl['tasks'][0] | undefined {
  return sbp.tasks.find((task) => task.id === csfSourceId);
}

/**
 * Get all EM Actions that reference a specific SBP Task
 */
export function getEmActionsForSbpTask(
  em: EmDsl,
  sbpTaskId: string
): EmDsl['actions'] {
  return em.actions.filter((action) => action.source_id === sbpTaskId);
}

/**
 * Build the complete hierarchy chain: Outcome → CJM Phase → CJM Action → SBP Task → EM Actions
 */
export function buildHierarchyChain(
  data: ParsedYaml,
  outcomeKpiId: string
): {
  kpi: OutcomeDsl['primary_kpi'] | null;
  sbpTask: SbpDsl['tasks'][0] | null;
  cjmAction: CjmDsl['actions'][0] | null;
  cjmPhase: CjmDsl['phases'][0] | null;
  emActions: EmDsl['actions'];
} | null {
  if (!data.outcome || !data.sbp || !data.cjm || !data.em) {
    return null;
  }

  // Check if KPI ID matches
  if (data.outcome.primary_kpi.id !== outcomeKpiId) {
    return null;
  }

  const kpi = data.outcome.primary_kpi;
  const csfSourceId = data.outcome.primary_csf?.source_id;

  if (!csfSourceId) {
    return null;
  }

  // Find SBP Task
  const sbpTask = data.sbp.tasks.find((t) => t.id === csfSourceId);
  if (!sbpTask || !sbpTask.source_id) {
    return null;
  }

  // Find CJM Action
  const cjmAction = data.cjm.actions.find((a) => a.id === sbpTask.source_id);
  if (!cjmAction) {
    return null;
  }

  // Find CJM Phase
  const cjmPhase = data.cjm.phases.find((p) => p.id === cjmAction.phase);
  if (!cjmPhase) {
    return null;
  }

  // Find EM Actions
  const emActions = data.em.actions.filter(
    (a) => a.source_id === sbpTask.id
  );

  return {
    kpi,
    sbpTask,
    cjmAction,
    cjmPhase,
    emActions,
  };
}
