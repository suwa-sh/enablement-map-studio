import type { EmDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';
import { generateId } from '@enablement-map-studio/dsl';

/**
 * Find or create CJM Phase
 * @param cjm Current CJM DSL
 * @param phaseName Phase name to find or create
 * @returns Updated CJM DSL and the phase (or null if phaseName is empty)
 */
export function findOrCreateCjmPhase(
  cjm: CjmDsl,
  phaseName: string
): { cjm: CjmDsl; phase: CjmDsl['phases'][0] | null } {
  const trimmedName = phaseName.trim();
  if (!trimmedName) return { cjm, phase: null };

  const existingPhase = cjm.phases.find(p => p.name === trimmedName);
  if (existingPhase) return { cjm, phase: existingPhase };

  const newPhase = {
    id: generateId('cjm', 'phase'),
    name: trimmedName,
  };
  return {
    cjm: { ...cjm, phases: [...cjm.phases, newPhase] },
    phase: newPhase,
  };
}

/**
 * Find or create CJM Action
 * @param cjm Current CJM DSL
 * @param actionName Action name to find or create
 * @param phaseId Phase ID to associate with the action
 * @returns Updated CJM DSL and the action (or null if actionName or phaseId is empty)
 */
export function findOrCreateCjmAction(
  cjm: CjmDsl,
  actionName: string,
  phaseId: string | null
): { cjm: CjmDsl; action: CjmDsl['actions'][0] | null } {
  const trimmedName = actionName.trim();
  if (!trimmedName || !phaseId) return { cjm, action: null };

  const existingAction = cjm.actions.find(a => a.name === trimmedName);
  if (existingAction) return { cjm, action: existingAction };

  const newAction = {
    id: generateId('cjm', 'action'),
    name: trimmedName,
    phase: phaseId,
    emotion_score: 0,
  };
  return {
    cjm: { ...cjm, actions: [...cjm.actions, newAction] },
    action: newAction,
  };
}

/**
 * Find or create SBP Lane
 * @param sbp Current SBP DSL
 * @param laneName Lane name to find or create
 * @returns Updated SBP DSL and the lane (or null if laneName is empty)
 */
export function findOrCreateSbpLane(
  sbp: SbpDsl,
  laneName: string
): { sbp: SbpDsl; lane: SbpDsl['lanes'][0] | null } {
  const trimmedName = laneName.trim();
  if (!trimmedName) return { sbp, lane: null };

  const existingLane = sbp.lanes.find(l => l.name === trimmedName);
  if (existingLane) return { sbp, lane: existingLane };

  const newLane = {
    id: generateId('sbp', 'lane'),
    name: trimmedName,
    kind: 'team' as const,
  };
  return {
    sbp: { ...sbp, lanes: [...sbp.lanes, newLane] },
    lane: newLane,
  };
}

/**
 * Find or create SBP Task
 * @param sbp Current SBP DSL
 * @param taskName Task name to find or create
 * @param laneId Lane ID to associate with the task
 * @returns Updated SBP DSL and the task (or null if taskName or laneId is empty)
 */
export function findOrCreateSbpTask(
  sbp: SbpDsl,
  taskName: string,
  laneId: string | null
): { sbp: SbpDsl; task: SbpDsl['tasks'][0] | null } {
  const trimmedName = taskName.trim();
  if (!trimmedName || !laneId) return { sbp, task: null };

  const existingTask = sbp.tasks.find(t => t.name === trimmedName);
  if (existingTask) return { sbp, task: existingTask };

  const newTask = {
    id: generateId('sbp', 'task'),
    name: trimmedName,
    lane: laneId,
  };
  return {
    sbp: { ...sbp, tasks: [...sbp.tasks, newTask] },
    task: newTask,
  };
}

/**
 * Find or create EM Action
 * @param em Current EM DSL
 * @param actionName Action name to find or create
 * @param sourceId SBP Task ID to associate with the action
 * @returns Updated EM DSL and the action (or null if actionName or sourceId is empty)
 */
export function findOrCreateEmAction(
  em: EmDsl,
  actionName: string,
  sourceId: string | null
): { em: EmDsl; action: EmDsl['actions'][0] | null } {
  const trimmedName = actionName.trim();
  if (!trimmedName || !sourceId) return { em, action: null };

  const existingAction = em.actions.find(a => a.name === trimmedName);
  if (existingAction) return { em, action: existingAction };

  const newAction = {
    id: generateId('em', 'action'),
    name: trimmedName,
    source_id: sourceId,
  };
  return {
    em: { ...em, actions: [...em.actions, newAction] },
    action: newAction,
  };
}

/**
 * Process skill resource (simple skill or skill with learning content)
 * @param em Current EM DSL
 * @param actionId EM Action ID to associate with the skill
 * @param resourceName Resource name (may contain '/' for learning content)
 * @param resourceUrl Resource URL
 * @returns Updated EM DSL
 */
export function processSkillResource(
  em: EmDsl,
  actionId: string,
  resourceName: string,
  resourceUrl: string
): EmDsl {
  if (!resourceName.includes('/')) {
    // Simple skill without learning content
    const existingSkill = em.skills?.find(s => s.name === resourceName && s.action_id === actionId);
    if (existingSkill) return em;

    const newSkill = {
      id: generateId('em', 'skill'),
      name: resourceName,
      action_id: actionId,
      learnings: [],
    };
    return {
      ...em,
      skills: [...(em.skills || []), newSkill],
    };
  }

  // Skill with learning content
  const [skillName, learningTitle] = resourceName.split('/').map(s => s.trim());

  let skill = em.skills?.find(s => s.name === skillName && s.action_id === actionId);
  if (!skill) {
    skill = {
      id: generateId('em', 'skill'),
      name: skillName,
      action_id: actionId,
      learnings: [],
    };
    em = {
      ...em,
      skills: [...(em.skills || []), skill],
    };
  }

  // Add or update learning
  const existingLearningIndex = skill.learnings?.findIndex(l => l.title === learningTitle) ?? -1;
  const updatedSkill = {
    ...skill,
    learnings:
      existingLearningIndex >= 0
        ? skill.learnings?.map((l, i) =>
            i === existingLearningIndex ? { title: learningTitle, url: resourceUrl } : l
          ) || []
        : [...(skill.learnings || []), { title: learningTitle, url: resourceUrl }],
  };

  return {
    ...em,
    skills: em.skills?.map(s => s.id === skill!.id ? updatedSkill : s),
  };
}

/**
 * Process knowledge resource
 * @param em Current EM DSL
 * @param actionId EM Action ID to associate with the knowledge
 * @param resourceName Resource name
 * @param resourceUrl Resource URL
 * @returns Updated EM DSL
 */
export function processKnowledgeResource(
  em: EmDsl,
  actionId: string,
  resourceName: string,
  resourceUrl: string
): EmDsl {
  const existingKnowledge = em.knowledge?.find(k => k.name === resourceName && k.action_id === actionId);
  if (existingKnowledge) {
    const updatedKnowledge = {
      ...existingKnowledge,
      url: resourceUrl,
    };
    return {
      ...em,
      knowledge: em.knowledge?.map(k => k.id === existingKnowledge.id ? updatedKnowledge : k),
    };
  }

  const newKnowledge = {
    id: generateId('em', 'knowledge'),
    name: resourceName,
    action_id: actionId,
    url: resourceUrl,
  };
  return {
    ...em,
    knowledge: [...(em.knowledge || []), newKnowledge],
  };
}

/**
 * Process tool resource
 * @param em Current EM DSL
 * @param actionId EM Action ID to associate with the tool
 * @param resourceName Resource name
 * @param resourceUrl Resource URL
 * @returns Updated EM DSL
 */
export function processToolResource(
  em: EmDsl,
  actionId: string,
  resourceName: string,
  resourceUrl: string
): EmDsl {
  const existingTool = em.tools?.find(t => t.name === resourceName && t.action_id === actionId);
  if (existingTool) {
    const updatedTool = {
      ...existingTool,
      url: resourceUrl,
    };
    return {
      ...em,
      tools: em.tools?.map(t => t.id === existingTool.id ? updatedTool : t),
    };
  }

  const newTool = {
    id: generateId('em', 'tool'),
    name: resourceName,
    action_id: actionId,
    url: resourceUrl,
  };
  return {
    ...em,
    tools: [...(em.tools || []), newTool],
  };
}
