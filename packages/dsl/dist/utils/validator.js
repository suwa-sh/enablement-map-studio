import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import cjmSchema from '../schemas/cjm.json';
import sbpSchema from '../schemas/sbp.json';
import outcomeSchema from '../schemas/outcome.json';
import emSchema from '../schemas/em.json';
const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateFormats: false
});
addFormats(ajv);
// Compile validators
const validateCjm = ajv.compile(cjmSchema);
const validateSbp = ajv.compile(sbpSchema);
const validateOutcome = ajv.compile(outcomeSchema);
const validateEm = ajv.compile(emSchema);
export function validateCjmDsl(data) {
    const valid = validateCjm(data);
    if (!valid && validateCjm.errors) {
        return {
            valid: false,
            errors: validateCjm.errors.map((err) => `${err.instancePath} ${err.message}`),
        };
    }
    return { valid: true };
}
export function validateSbpDsl(data) {
    const valid = validateSbp(data);
    if (!valid && validateSbp.errors) {
        return {
            valid: false,
            errors: validateSbp.errors.map((err) => `${err.instancePath} ${err.message}`),
        };
    }
    return { valid: true };
}
export function validateOutcomeDsl(data) {
    const valid = validateOutcome(data);
    if (!valid && validateOutcome.errors) {
        return {
            valid: false,
            errors: validateOutcome.errors.map((err) => `${err.instancePath} ${err.message}`),
        };
    }
    return { valid: true };
}
export function validateEmDsl(data) {
    const valid = validateEm(data);
    if (!valid && validateEm.errors) {
        return {
            valid: false,
            errors: validateEm.errors.map((err) => `${err.instancePath} ${err.message}`),
        };
    }
    return { valid: true };
}
export function validateDsl(data) {
    if (typeof data !== 'object' || data === null) {
        return { valid: false, errors: ['Data must be an object'] };
    }
    const obj = data;
    switch (obj.kind) {
        case 'cjm':
            return { ...validateCjmDsl(data), kind: 'cjm' };
        case 'sbp':
            return { ...validateSbpDsl(data), kind: 'sbp' };
        case 'outcome':
            return { ...validateOutcomeDsl(data), kind: 'outcome' };
        case 'em':
            return { ...validateEmDsl(data), kind: 'em' };
        default:
            return {
                valid: false,
                errors: [`Unknown DSL kind: ${obj.kind}`],
            };
    }
}
