import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import cjmSchema from '../schemas/cjm.json';
import sbpSchema from '../schemas/sbp.json';
import outcomeSchema from '../schemas/outcome.json';
import emSchema from '../schemas/em.json';
import type { CjmDsl } from '../types/cjm';
import type { SbpDsl } from '../types/sbp';
import type { OutcomeDsl } from '../types/outcome';
import type { EmDsl } from '../types/em';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: false
});
addFormats(ajv);

// Compile validators
const validateCjm: ValidateFunction<CjmDsl> = ajv.compile(cjmSchema);
const validateSbp: ValidateFunction<SbpDsl> = ajv.compile(sbpSchema);
const validateOutcome: ValidateFunction<OutcomeDsl> = ajv.compile(outcomeSchema);
const validateEm: ValidateFunction<EmDsl> = ajv.compile(emSchema);

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export function validateCjmDsl(data: unknown): ValidationResult {
  const valid = validateCjm(data);
  if (!valid && validateCjm.errors) {
    return {
      valid: false,
      errors: validateCjm.errors.map(
        (err) => `${err.instancePath} ${err.message}`
      ),
    };
  }
  return { valid: true };
}

export function validateSbpDsl(data: unknown): ValidationResult {
  const valid = validateSbp(data);
  if (!valid && validateSbp.errors) {
    return {
      valid: false,
      errors: validateSbp.errors.map(
        (err) => `${err.instancePath} ${err.message}`
      ),
    };
  }
  return { valid: true };
}

export function validateOutcomeDsl(data: unknown): ValidationResult {
  const valid = validateOutcome(data);
  if (!valid && validateOutcome.errors) {
    return {
      valid: false,
      errors: validateOutcome.errors.map(
        (err) => `${err.instancePath} ${err.message}`
      ),
    };
  }
  return { valid: true };
}

export function validateEmDsl(data: unknown): ValidationResult {
  const valid = validateEm(data);
  if (!valid && validateEm.errors) {
    return {
      valid: false,
      errors: validateEm.errors.map(
        (err) => `${err.instancePath} ${err.message}`
      ),
    };
  }
  return { valid: true };
}

export function validateDsl(
  data: unknown
): ValidationResult & { kind?: string } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Data must be an object'] };
  }

  const obj = data as { kind?: string };

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
