export * from './cjm';
export * from './sbp';
export * from './outcome';
export * from './em';

export type DslKind = 'cjm' | 'sbp' | 'outcome' | 'em';

export interface BaseDsl {
  kind: DslKind;
  version: string;
  id: string;
}
