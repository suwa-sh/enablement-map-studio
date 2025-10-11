import type { Node, Edge } from '@xyflow/react';
import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';
export declare function buildHierarchyFlow(em: EmDsl, outcome: OutcomeDsl, sbp: SbpDsl, cjm: CjmDsl): {
    nodes: Node[];
    edges: Edge[];
};
