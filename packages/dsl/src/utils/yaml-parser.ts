import yaml from 'js-yaml';
import type { CjmDsl, SbpDsl, OutcomeDsl, EmDsl } from '../types';
import { validateDsl } from './validator';

export interface ParsedYaml {
  cjm: CjmDsl | null;
  sbp: SbpDsl | null;
  outcome: OutcomeDsl | null;
  em: EmDsl | null;
}

/**
 * Parse a YAML file containing multiple DSL documents separated by ---
 */
export function parseYaml(content: string): ParsedYaml {
  const result: ParsedYaml = {
    cjm: null,
    sbp: null,
    outcome: null,
    em: null,
  };

  try {
    // Load all documents from the YAML file
    const documents = yaml.loadAll(content) as Array<
      CjmDsl | SbpDsl | OutcomeDsl | EmDsl
    >;

    // Categorize each document by its kind
    for (const doc of documents) {
      if (!doc || typeof doc !== 'object' || !('kind' in doc)) {
        continue;
      }

      // Validate the document
      const validation = validateDsl(doc);
      if (!validation.valid) {
        console.error(`Validation failed for ${doc.kind} DSL:`, validation.errors);
        throw new Error(
          `Validation failed for ${doc.kind} DSL: ${validation.errors?.join(', ')}`
        );
      }

      switch (doc.kind) {
        case 'cjm':
          result.cjm = doc as CjmDsl;
          break;
        case 'sbp':
          result.sbp = doc as SbpDsl;
          break;
        case 'outcome':
          result.outcome = doc as OutcomeDsl;
          break;
        case 'em':
          result.em = doc as EmDsl;
          break;
      }
    }
  } catch (error) {
    console.error('Failed to parse YAML:', error);
    throw new Error(`YAML parse error: ${error}`);
  }

  return result;
}

/**
 * Export DSLs to a single YAML string
 */
export function exportYaml(data: ParsedYaml): string {
  const documents: Array<CjmDsl | SbpDsl | OutcomeDsl | EmDsl> = [];

  if (data.cjm) documents.push(data.cjm);
  if (data.sbp) documents.push(data.sbp);
  if (data.outcome) documents.push(data.outcome);
  if (data.em) documents.push(data.em);

  if (documents.length === 0) {
    return '';
  }

  // Dump all documents separated by ---
  return documents.map((doc) => yaml.dump(doc)).join('---\n');
}
