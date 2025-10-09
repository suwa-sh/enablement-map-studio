export interface SbpDsl {
    kind: 'sbp';
    version: string;
    id: string;
    lanes: SbpLane[];
    tasks: SbpTask[];
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
    link_to?: string[];
    readonly?: boolean;
}
//# sourceMappingURL=sbp.d.ts.map