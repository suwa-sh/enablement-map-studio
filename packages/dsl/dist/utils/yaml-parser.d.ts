import type { CjmDsl, SbpDsl, OutcomeDsl, EmDsl } from '../types';
export interface ParsedYaml {
    cjm: CjmDsl | null;
    sbp: SbpDsl | null;
    outcome: OutcomeDsl | null;
    em: EmDsl | null;
}
/**
 * Parse a YAML file containing multiple DSL documents separated by ---
 */
export declare function parseYaml(content: string): ParsedYaml;
/**
 * Export DSLs to a single YAML string
 */
export declare function exportYaml(data: ParsedYaml): string;
//# sourceMappingURL=yaml-parser.d.ts.map