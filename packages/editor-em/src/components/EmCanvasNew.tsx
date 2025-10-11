import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl, EmAction } from '@enablement-map-studio/dsl';
import { generateId } from '@enablement-map-studio/dsl';
import { buildHierarchyFlow } from '../utils/buildHierarchyFlow';

interface EmCanvasNewProps {
  em: EmDsl;
  outcome: OutcomeDsl | null;
  sbp: SbpDsl | null;
  cjm: CjmDsl | null;
  onEmUpdate: (em: EmDsl) => void;
  onActionSelect: (action: EmAction) => void;
}

// Custom node types
const nodeTypes: NodeTypes = {
  // We'll define custom nodes later
};

export function EmCanvasNew({
  em,
  outcome,
  sbp,
  cjm,
  onEmUpdate,
  onActionSelect,
}: EmCanvasNewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Build hierarchy visualization
  useEffect(() => {
    if (!outcome || !sbp || !cjm) return;

    const { nodes: hierarchyNodes, edges: hierarchyEdges } = buildHierarchyFlow(
      em,
      outcome,
      sbp,
      cjm
    );

    setNodes(hierarchyNodes);
    setEdges(hierarchyEdges);
  }, [em, outcome, sbp, cjm, setNodes, setEdges]);

  // Add new EM Action
  const handleAddAction = useCallback(() => {
    if (!sbp) return;

    // Find first available SBP task
    const firstTask = sbp.tasks.find((t) => !t.readonly);
    if (!firstTask) return;

    const newAction: EmAction = {
      id: generateId('em', 'action'),
      name: '新しい行動',
      source_id: firstTask.id,
    };

    const updatedEm: EmDsl = {
      ...em,
      actions: [...em.actions, newAction],
    };

    onEmUpdate(updatedEm);
    onActionSelect(newAction);
  }, [em, sbp, onEmUpdate, onActionSelect]);

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type === 'emAction') {
        const action = em.actions.find((a) => a.id === node.id);
        if (action) {
          onActionSelect(action);
        }
      }
    },
    [em.actions, onActionSelect]
  );

  if (!outcome || !sbp || !cjm) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <p>階層を表示するには、CJM、SBP、Outcomeデータが必要です。</p>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {/* Add Action Button */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddAction}>
          行動を追加
        </Button>
      </Box>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </Box>
  );
}
