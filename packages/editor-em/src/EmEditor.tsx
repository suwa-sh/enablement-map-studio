import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useAppStore } from '@enablement-map-studio/store';
import type { EmAction, EmDsl } from '@enablement-map-studio/dsl';
import { generateId } from '@enablement-map-studio/dsl';
import { EmCanvasCard } from './components/EmCanvasCard';
import { EmTable } from './components/EmTable';
import { PropertyPanel } from './components/PropertyPanel';

// Legacy type for backward compatibility with unused components
export type SelectedItem =
  | { type: 'action'; item: EmAction }
  | { type: 'skill'; item: { id: string; name: string } }
  | { type: 'knowledge'; item: { id: string; name: string } }
  | { type: 'tool'; item: { id: string; name: string } }
  | null;

export function EmEditor() {
  const em = useAppStore((state) => state.state.em);
  const outcome = useAppStore((state) => state.state.outcome);
  const sbp = useAppStore((state) => state.state.sbp);
  const cjm = useAppStore((state) => state.state.cjm);
  const updateEm = useAppStore((state) => state.updateEm);

  const [selectedAction, setSelectedAction] = useState<EmAction | null>(null);

  // Auto-initialize EM if empty but other data exists
  useEffect(() => {
    if (!em && outcome && sbp && cjm) {
      const initialEm: EmDsl = {
        kind: 'em',
        version: '1.0',
        id: `em:${Date.now()}`,
        outcomes: [
          {
            id: generateId('em', 'outcome'),
            source_id: outcome.primary_kpi.id,
          },
        ],
        actions: [],
        skills: [],
        knowledge: [],
        tools: [],
      };

      updateEm(initialEm);
    }
  }, [em, outcome, sbp, cjm, updateEm]);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box
        sx={{ flex: 1, overflow: 'hidden' }}
        onClick={() => {
          if (selectedAction) {
            setSelectedAction(null);
          }
        }}
      >
        <PanelGroup direction="vertical">
          {/* Editor Pane (top) */}
          <Panel defaultSize={70} minSize={30}>
            <EmCanvasCard
              em={em}
              outcome={outcome}
              sbp={sbp}
              cjm={cjm}
              onEmUpdate={updateEm}
              onActionSelect={setSelectedAction}
            />
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle style={{
            height: '8px',
            background: '#e0e0e0',
            cursor: 'row-resize',
            position: 'relative',
          }}>
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 40,
                height: 4,
                bgcolor: 'grey.400',
                borderRadius: 2,
              }}
            />
          </PanelResizeHandle>

          {/* Table Panel (bottom) */}
          <Panel defaultSize={30} minSize={10}>
            <Box sx={{ height: '100%', bgcolor: 'grey.50', p: 3, overflow: 'auto' }}>
              <EmTable em={em} outcome={outcome} sbp={sbp} cjm={cjm} />
            </Box>
          </Panel>
        </PanelGroup>
      </Box>

      {/* Property Panel (right) */}
      <PropertyPanel
        selectedAction={selectedAction}
        em={em}
        onEmUpdate={updateEm}
        onClose={() => setSelectedAction(null)}
      />
    </Box>
  );
}
