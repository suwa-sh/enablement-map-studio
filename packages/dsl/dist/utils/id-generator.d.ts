import type { DslKind } from '../types';
export type EntityType = 'phase' | 'action' | 'lane' | 'task' | 'kgi' | 'csf' | 'kpi' | 'outcome' | 'skill' | 'knowledge' | 'tool';
/**
 * Generate a unique ID in the format: {kind}:{type}:{uuid}
 * Example: cjm:action:550e8400-e29b-41d4-a716-446655440000
 */
export declare function generateId(kind: DslKind, type: EntityType): string;
/**
 * Parse an ID and extract its components
 */
export declare function parseId(id: string): {
    kind: string;
    type: string;
    uuid: string;
} | null;
//# sourceMappingURL=id-generator.d.ts.map