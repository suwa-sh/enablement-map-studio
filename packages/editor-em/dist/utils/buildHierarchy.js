/**
 * Build hierarchy: Outcome → CJM Phase → CJM Action → SBP Task → EM Actions
 */
export function buildHierarchy(em, outcome, sbp, cjm) {
    if (!outcome || !sbp || !cjm) {
        return [];
    }
    const roots = [];
    // For each EM outcome
    em.outcomes.forEach((emOutcome) => {
        // Get the KPI
        const kpi = outcome.primary_kpi;
        if (kpi.id !== emOutcome.source_id)
            return;
        // Get CSF
        const csf = outcome.primary_csf;
        // Get SBP task from CSF
        const sbpTask = sbp.tasks.find((t) => t.id === csf.source_id);
        if (!sbpTask)
            return;
        // Get CJM action from SBP task
        const cjmAction = sbpTask.source_id
            ? cjm.actions.find((a) => a.id === sbpTask.source_id)
            : null;
        if (!cjmAction)
            return;
        // Get CJM phase
        const cjmPhase = cjm.phases.find((p) => p.id === cjmAction.phase);
        if (!cjmPhase)
            return;
        // Get EM actions for this SBP task
        const emActions = em.actions.filter((a) => a.source_id === sbpTask.id);
        // Build hierarchy
        const outcomeNode = {
            id: emOutcome.id,
            type: 'outcome',
            name: `${kpi.name} (${kpi.target}${kpi.unit || ''})`,
            data: { kpi, csf },
            children: [
                {
                    id: cjmPhase.id,
                    type: 'phase',
                    name: cjmPhase.name,
                    data: cjmPhase,
                    children: [
                        {
                            id: cjmAction.id,
                            type: 'action',
                            name: cjmAction.name,
                            data: cjmAction,
                            children: [
                                {
                                    id: sbpTask.id,
                                    type: 'task',
                                    name: sbpTask.name,
                                    data: sbpTask,
                                    children: emActions.map((emAction) => ({
                                        id: emAction.id,
                                        type: 'em-action',
                                        name: emAction.name,
                                        data: emAction,
                                        children: [],
                                    })),
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        roots.push(outcomeNode);
    });
    return roots;
}
