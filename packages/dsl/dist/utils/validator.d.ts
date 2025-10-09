export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}
export declare function validateCjmDsl(data: unknown): ValidationResult;
export declare function validateSbpDsl(data: unknown): ValidationResult;
export declare function validateOutcomeDsl(data: unknown): ValidationResult;
export declare function validateEmDsl(data: unknown): ValidationResult;
export declare function validateDsl(data: unknown): ValidationResult & {
    kind?: string;
};
//# sourceMappingURL=validator.d.ts.map