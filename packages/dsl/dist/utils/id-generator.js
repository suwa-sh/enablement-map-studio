import { v4 as uuidv4 } from 'uuid';
/**
 * Generate a unique ID in the format: {kind}:{type}:{uuid}
 * Example: cjm:action:550e8400-e29b-41d4-a716-446655440000
 */
export function generateId(kind, type) {
    const uuid = uuidv4();
    return `${kind}:${type}:${uuid}`;
}
/**
 * Parse an ID and extract its components
 */
export function parseId(id) {
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
