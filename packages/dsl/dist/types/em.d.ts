export interface EmDsl {
    kind: 'em';
    version: string;
    id: string;
    outcomes: EmOutcome[];
    actions: EmAction[];
    skills?: EmSkill[];
    knowledge?: EmKnowledge[];
    tools?: EmTool[];
}
export interface EmOutcome {
    id: string;
    source_id: string;
}
export interface EmAction {
    id: string;
    name: string;
    source_id: string;
}
export interface EmLearning {
    title: string;
    url: string;
}
export interface EmSkill {
    id: string;
    name: string;
    action_id: string;
    learnings?: EmLearning[];
}
export interface EmKnowledge {
    id: string;
    name: string;
    action_id: string;
    url: string;
}
export interface EmTool {
    id: string;
    name: string;
    action_id: string;
    url: string;
}
//# sourceMappingURL=em.d.ts.map