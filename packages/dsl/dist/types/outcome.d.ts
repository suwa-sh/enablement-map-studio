export interface OutcomeDsl {
    kind: 'outcome';
    version: string;
    id: string;
    kgi: OutcomeKgi;
    primary_csf: OutcomeCsf;
    primary_kpi: OutcomeKpi;
}
export interface OutcomeKgi {
    id: string;
    name: string;
}
export interface OutcomeCsf {
    id: string;
    kgi_id: string;
    source_id: string;
    rationale: string;
}
export interface OutcomeKpi {
    id: string;
    csf_id: string;
    name: string;
    definition?: string;
    unit?: string;
    target: number;
}
//# sourceMappingURL=outcome.d.ts.map