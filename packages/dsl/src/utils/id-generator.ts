import { v4 as uuidv4 } from 'uuid';
import type { DslKind } from '../types';

export type EntityType =
  | 'phase'
  | 'action'
  | 'lane'
  | 'task'
  | 'kgi'
  | 'csf'
  | 'kpi'
  | 'outcome'
  | 'skill'
  | 'knowledge'
  | 'tool';

/**
 * Generate a unique ID in the format: {kind}:{type}:{uuid}
 * Example: cjm:action:550e8400-e29b-41d4-a716-446655440000
 */
export function generateId(kind: DslKind, type: EntityType): string {
  const uuid = uuidv4();
  return `${kind}:${type}:${uuid}`;
}

/**
 * Parse an ID and extract its components
 */
export function parseId(id: string): {
  kind: string;
  type: string;
  uuid: string;
} | null {
  const parts = id.split(':');
  if (parts.length !== 3) {
    return null;
  }
  return {
    kind: parts[0],
    type: parts[1],
    uuid: parts[2],
  };
}
