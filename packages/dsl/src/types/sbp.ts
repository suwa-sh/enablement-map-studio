export interface SbpDsl {
  kind: 'sbp';
  version: string;
  id: string;
  lanes: SbpLane[];
  tasks: SbpTask[];
  connections: SbpConnection[];
}

export interface SbpLane {
  id: string;
  name: string;
  kind: 'cjm' | 'human' | 'team' | 'system';
  description?: string;
  position?: { x: number; y: number }; // Lane position in canvas
  size?: { width: number; height: number }; // Lane size in canvas
}

export interface SbpTask {
  id: string;
  lane: string; // lane_id
  name: string;
  description?: string;
  source_id?: string; // CJM Action ID
  position?: { x: number; y: number }; // Task position in canvas
  readonly?: boolean;
}

export interface SbpConnection {
  source: string; // source task ID
  target: string; // target task ID
  sourceHandle: 'top' | 'right' | 'bottom' | 'left'; // handle position
  targetHandle: 'top' | 'right' | 'bottom' | 'left'; // handle position
}
