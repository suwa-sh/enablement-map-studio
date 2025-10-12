import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import { EmCanvasCard } from './components/EmCanvasCard';
import { EmTable } from './components/EmTable';
import { PropertyPanel } from './components/PropertyPanel';
export function EmEditor() {
    const em = useAppStore((state) => state.state.em);
    const outcome = useAppStore((state) => state.state.outcome);
    const sbp = useAppStore((state) => state.state.sbp);
    const cjm = useAppStore((state) => state.state.cjm);
    const updateEm = useAppStore((state) => state.updateEm);
    const [selectedAction, setSelectedAction] = useState(null);
    const [visibleTaskIds, setVisibleTaskIds] = useState(null);
    // Auto-initialize EM if empty but other data exists
    useEffect(() => {
        if (!em && outcome && sbp && cjm) {
            const initialEm = {
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
    return (_jsxs(Box, { sx: { display: 'flex', height: '100%' }, children: [_jsx(Box, { sx: { flex: 1, overflow: 'hidden' }, onClick: () => {
                    if (selectedAction) {
                        setSelectedAction(null);
                    }
                }, children: _jsxs(PanelGroup, { direction: "vertical", children: [_jsx(Panel, { defaultSize: 70, minSize: 30, children: _jsx(EmCanvasCard, { em: em, outcome: outcome, sbp: sbp, cjm: cjm, onEmUpdate: updateEm, onActionSelect: setSelectedAction, onFilterChange: setVisibleTaskIds }) }), _jsx(PanelResizeHandle, { style: {
                                height: '8px',
                                background: '#e0e0e0',
                                cursor: 'row-resize',
                                position: 'relative',
                            }, children: _jsx(Box, { sx: {
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: 40,
                                    height: 4,
                                    bgcolor: 'grey.400',
                                    borderRadius: 2,
                                } }) }), _jsx(Panel, { defaultSize: 30, minSize: 10, children: _jsx(Box, { sx: { height: '100%', bgcolor: 'grey.50', p: 3, overflow: 'auto' }, children: _jsx(EmTable, { em: em, outcome: outcome, sbp: sbp, cjm: cjm, visibleTaskIds: visibleTaskIds }) }) })] }) }), _jsx(PropertyPanel, { selectedAction: selectedAction, em: em, onEmUpdate: updateEm, onClose: () => setSelectedAction(null) })] }));
}
