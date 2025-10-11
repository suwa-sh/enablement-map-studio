import type { Node, Edge } from '@xyflow/react';
import type { SbpDsl, SbpLane, CjmDsl } from '@enablement-map-studio/dsl';
export interface FlowData {
    nodes: Node[];
    edges: Edge[];
}
export declare const LANE_HEIGHT = 300;
export declare const LANE_SPACING = 20;
export declare const LANE_WIDTH = 1400;
export declare function getLaneY(laneIndex: number): number;
export declare function dslToFlow(sbp: SbpDsl, cjm: CjmDsl | null): FlowData;
export declare function updateDslFromFlow(sbp: SbpDsl, nodes: Node[], edges: Edge[]): SbpDsl;
export interface LaneBackground {
    id: string;
    name: string;
    y: number;
    height: number;
    kind: 'cjm' | 'human' | 'team' | 'system';
}
export declare function getLaneBackgrounds(lanes: SbpLane[]): LaneBackground[];
export declare function constrainToLane(nodePosition: {
    x: number;
    y: number;
}, laneId: string, lanes: SbpLane[]): {
    x: number;
    y: number;
};
