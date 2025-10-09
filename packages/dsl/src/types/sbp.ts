export interface SbpDsl {
  kind: 'sbp';
  version: string;
  id: string;
  lanes: SbpLane[];
  tasks: SbpTask[];
}

export interface SbpLane {
  id: string;
  name: string;
  kind: 'cjm' | 'human' | 'team' | 'system';
}

export interface SbpTask {
  id: string;
  lane: string; // lane_id
  name: string;
  source_id?: string; // CJM Action ID or other SBP Task ID
  link_to?: string[]; // Task IDs this task links to
  readonly?: boolean;
}
