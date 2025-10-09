import yaml from 'js-yaml';
import { validateDsl } from './validator';
/**
 * Parse a YAML file containing multiple DSL documents separated by ---
 */
export function parseYaml(content) {
    const result = {
        cjm: null,
        sbp: null,
        outcome: null,
        em: null,
    };
    try {
        // Load all documents from the YAML file
        const documents = yaml.loadAll(content);
        // Categorize each document by its kind
        for (const doc of documents) {
            if (!doc || typeof doc !== 'object' || !('kind' in doc)) {
                continue;
            }
            // Validate the document
            const validation = validateDsl(doc);
            if (!validation.valid) {
                console.error(`Validation failed for ${doc.kind} DSL:`, validation.errors);
                throw new Error(`Validation failed for ${doc.kind} DSL: ${validation.errors?.join(', ')}`);
            }
            switch (doc.kind) {
                case 'cjm':
                    result.cjm = doc;
                    break;
                case 'sbp':
                    result.sbp = doc;
                    break;
                case 'outcome':
                    result.outcome = doc;
                    break;
                case 'em':
                    result.em = doc;
                    break;
            }
        }
    }
    catch (error) {
        console.error('Failed to parse YAML:', error);
        throw new Error(`YAML parse error: ${error}`);
    }
    return result;
}
/**
 * Export DSLs to a single YAML string
 */
export function exportYaml(data) {
    const documents = [];
    if (data.cjm)
        documents.push(data.cjm);
    if (data.sbp)
        documents.push(data.sbp);
    if (data.outcome)
        documents.push(data.outcome);
    if (data.em)
        documents.push(data.em);
    if (documents.length === 0) {
        return '';
    }
    // Dump all documents separated by ---
    return documents.map((doc) => yaml.dump(doc)).join('---\n');
}
