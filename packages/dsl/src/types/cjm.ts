export interface CjmDsl {
  kind: 'cjm';
  version: string;
  id: string;
  persona?: CjmPersona;
  phases: CjmPhase[];
  actions: CjmAction[];
}

export interface CjmPersona {
  name: string;
}

export interface CjmPhase {
  id: string;
  name: string;
}

export interface CjmAction {
  id: string;
  name: string;
  phase: string; // phase_id
  touchpoints?: string[];
  thoughts_feelings?: string[];
  emotion_score: number; // -2 to 2
}
