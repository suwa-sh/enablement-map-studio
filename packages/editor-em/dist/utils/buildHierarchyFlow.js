import { MarkerType } from '@xyflow/react';
// Node spacing constants
const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;
const VERTICAL_SPACING = 150;
const HORIZONTAL_SPACING = 300;
export function buildHierarchyFlow(em, outcome, sbp, cjm) {
    const nodes = [];
    const edges = [];
    let yOffset = 0;
    // 1. Outcome KPI Node (top level)
    const kpiNode = {
        id: outcome.primary_kpi.id,
        type: 'default',
        position: { x: 400, y: yOffset },
        data: {
            label: `KPI: ${outcome.primary_kpi.name}`,
        },
        style: {
            width: NODE_WIDTH,
            backgroundColor: '#e3f2fd',
            border: '2px solid #1976d2',
            padding: 16,
            borderRadius: 8,
        },
    };
    nodes.push(kpiNode);
    yOffset += NODE_HEIGHT + VERTICAL_SPACING;
    // 2. Find CSF source SBP Task
    const csfSourceId = outcome.primary_csf.source_id;
    const sbpTask = sbp.tasks.find((t) => t.id === csfSourceId);
    if (!sbpTask) {
        return { nodes, edges };
    }
    // 3. Find CJM Action linked to SBP Task
    const cjmAction = cjm.actions.find((a) => a.id === sbpTask.source_id);
    if (!cjmAction) {
        return { nodes, edges };
    }
    // 4. Find CJM Phase
    const cjmPhase = cjm.phases.find((p) => p.id === cjmAction.phase);
    if (!cjmPhase) {
        return { nodes, edges };
    }
    // 5. CJM Phase Node
    const phaseNode = {
        id: cjmPhase.id,
        type: 'default',
        position: { x: 400, y: yOffset },
        data: {
            label: `Phase: ${cjmPhase.name}`,
        },
        style: {
            width: NODE_WIDTH,
            backgroundColor: '#fff3e0',
            border: '2px solid #f57c00',
            padding: 16,
            borderRadius: 8,
        },
    };
    nodes.push(phaseNode);
    // Edge: KPI → Phase
    edges.push({
        id: `${outcome.primary_kpi.id}-${cjmPhase.id}`,
        source: outcome.primary_kpi.id,
        target: cjmPhase.id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
    });
    yOffset += NODE_HEIGHT + VERTICAL_SPACING;
    // 6. CJM Action Node
    const actionNode = {
        id: cjmAction.id,
        type: 'default',
        position: { x: 400, y: yOffset },
        data: {
            label: `Action: ${cjmAction.name}`,
        },
        style: {
            width: NODE_WIDTH,
            backgroundColor: '#ffe0b2',
            border: '2px solid #ef6c00',
            padding: 16,
            borderRadius: 8,
        },
    };
    nodes.push(actionNode);
    // Edge: Phase → Action
    edges.push({
        id: `${cjmPhase.id}-${cjmAction.id}`,
        source: cjmPhase.id,
        target: cjmAction.id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
    });
    yOffset += NODE_HEIGHT + VERTICAL_SPACING;
    // 7. SBP Task Node
    const taskNode = {
        id: sbpTask.id,
        type: 'default',
        position: { x: 400, y: yOffset },
        data: {
            label: `Task: ${sbpTask.name}`,
        },
        style: {
            width: NODE_WIDTH,
            backgroundColor: '#f3e5f5',
            border: '2px solid #7b1fa2',
            padding: 16,
            borderRadius: 8,
        },
    };
    nodes.push(taskNode);
    // Edge: Action → Task
    edges.push({
        id: `${cjmAction.id}-${sbpTask.id}`,
        source: cjmAction.id,
        target: sbpTask.id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
    });
    yOffset += NODE_HEIGHT + VERTICAL_SPACING;
    // 8. ALL EM Actions (not just for CSF task)
    const emActions = em.actions;
    emActions.forEach((action, index) => {
        const xOffset = (index - (emActions.length - 1) / 2) * HORIZONTAL_SPACING;
        const emActionNode = {
            id: action.id,
            type: 'emAction',
            position: { x: 400 + xOffset, y: yOffset },
            data: {
                label: action.name,
                action,
            },
            style: {
                width: NODE_WIDTH,
                backgroundColor: '#e8f5e9',
                border: '2px solid #388e3c',
                padding: 16,
                borderRadius: 8,
            },
        };
        nodes.push(emActionNode);
        // Edge: SBP Task (from action.source_id) → EM Action
        // Find the SBP task this action links to
        const linkedTask = sbp.tasks.find((t) => t.id === action.source_id);
        if (linkedTask) {
            // Add task node if not already added
            const taskExists = nodes.find((n) => n.id === linkedTask.id);
            if (!taskExists) {
                const taskNode = {
                    id: linkedTask.id,
                    type: 'default',
                    position: { x: 400 + xOffset, y: yOffset - NODE_HEIGHT - VERTICAL_SPACING },
                    data: {
                        label: `Task: ${linkedTask.name}`,
                    },
                    style: {
                        width: NODE_WIDTH,
                        backgroundColor: '#f3e5f5',
                        border: '2px solid #7b1fa2',
                        padding: 16,
                        borderRadius: 8,
                    },
                };
                nodes.push(taskNode);
            }
            edges.push({
                id: `${linkedTask.id}-${action.id}`,
                source: linkedTask.id,
                target: action.id,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
            });
        }
        // 9. Skills/Knowledge/Tools for this action
        const skills = (em.skills || []).filter((s) => s.action_id === action.id);
        const knowledge = (em.knowledge || []).filter((k) => k.action_id === action.id);
        const tools = (em.tools || []).filter((t) => t.action_id === action.id);
        const resources = [
            ...skills.map((s) => ({ id: s.id, label: `スキル: ${s.name}`, type: 'skill' })),
            ...knowledge.map((k) => ({ id: k.id, label: `ナレッジ: ${k.name}`, type: 'knowledge' })),
            ...tools.map((t) => ({ id: t.id, label: `ツール: ${t.name}`, type: 'tool' })),
        ];
        resources.forEach((resource, resIndex) => {
            const resYOffset = yOffset + NODE_HEIGHT + VERTICAL_SPACING;
            const resXOffset = xOffset + (resIndex - (resources.length - 1) / 2) * 200;
            const resourceNode = {
                id: resource.id,
                type: 'default',
                position: { x: 400 + resXOffset, y: resYOffset },
                data: {
                    label: resource.label,
                },
                style: {
                    width: 200,
                    backgroundColor: '#fff9c4',
                    border: '1px solid #f9a825',
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 12,
                },
            };
            nodes.push(resourceNode);
            // Edge: EM Action → Resource
            edges.push({
                id: `${action.id}-${resource.id}`,
                source: action.id,
                target: resource.id,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
            });
        });
    });
    return { nodes, edges };
}
