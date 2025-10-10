export interface SbpDsl {
    kind: 'sbp';
    version: string;
    id: string;
    lanes: SbpLane[];
    tasks: SbpTask[];
    connections: SbpConnection[];
}
export interface SbpLane {
    id: string;
    name: string;
    kind: 'cjm' | 'human' | 'team' | 'system';
}
export interface SbpTask {
    id: string;
    lane: string;
    name: string;
    source_id?: string;
    position?: {
        x: number;
        y: number;
    };
    readonly?: boolean;
}
export interface SbpConnection {
    source: string;
    target: string;
    sourceHandle: 'top' | 'right' | 'bottom' | 'left';
    targetHandle: 'top' | 'right' | 'bottom' | 'left';
}
//# sourceMappingURL=sbp.d.ts.map