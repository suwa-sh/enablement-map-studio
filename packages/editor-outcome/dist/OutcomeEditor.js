import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';
import { generateId } from '@enablement-map-studio/dsl';
import { OutcomeCanvas } from './components/OutcomeCanvas';
import { PropertyPanel } from './components/PropertyPanel';
export function OutcomeEditor() {
    const outcome = useAppStore((state) => state.state.outcome);
    const sbp = useAppStore((state) => state.state.sbp);
    const cjm = useAppStore((state) => state.state.cjm);
    const updateOutcome = useAppStore((state) => state.updateOutcome);
    const [selectedPhaseId, setSelectedPhaseId] = useState(null);
    const [showPropertyPanel, setShowPropertyPanel] = useState(false);
    // SBPが存在し、Outcomeがnullの場合は自動初期化
    useEffect(() => {
        if (!outcome && sbp) {
            const firstTask = sbp.tasks[0];
            const kgiId = generateId('outcome', 'kgi');
            const csfId = generateId('outcome', 'csf');
            const kpiId = generateId('outcome', 'kpi');
            const initialOutcome = {
                kind: 'outcome',
                version: '1.0',
                id: generateId('outcome', 'outcome'),
                kgi: {
                    id: kgiId,
                    name: '新しいKGI',
                },
                primary_csf: {
                    id: csfId,
                    kgi_id: kgiId,
                    source_id: firstTask?.id || '',
                    rationale: '',
                },
                primary_kpi: {
                    id: kpiId,
                    csf_id: csfId,
                    name: '新しいKPI',
                    target: 0,
                },
            };
            updateOutcome(initialOutcome);
            setShowPropertyPanel(true);
        }
    }, [outcome, sbp, updateOutcome]);
    // 空状態の表示（SBPが存在しない場合）
    if (!sbp) {
        return (_jsx(Box, { sx: { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Typography, { color: "text.secondary", children: "CJM\u3068SBP\u3092\u4F5C\u6210\u3059\u308B \u304B YAML \u3092\u30ED\u30FC\u30C9\u3057\u3066\u304F\u3060\u3055\u3044" }) }));
    }
    // Outcomeの初期化中
    if (!outcome) {
        return null;
    }
    const handleTaskClick = (taskId) => {
        const updatedOutcome = {
            ...outcome,
            primary_csf: {
                ...outcome.primary_csf,
                source_id: taskId,
            },
        };
        updateOutcome(updatedOutcome);
        setShowPropertyPanel(true);
    };
    const handleOutcomeUpdate = (updatedOutcome) => {
        updateOutcome(updatedOutcome);
    };
    const handleClosePropertyPanel = () => {
        setShowPropertyPanel(false);
    };
    return (_jsxs(Box, { sx: { display: 'flex', height: '100%' }, onClick: () => {
            // Click outside property panel to close it
            if (showPropertyPanel) {
                setShowPropertyPanel(false);
            }
        }, children: [_jsx(Box, { sx: { flex: 1, overflow: 'auto' }, children: _jsx(OutcomeCanvas, { outcome: outcome, sbp: sbp, cjm: cjm, selectedPhaseId: selectedPhaseId, onPhaseSelect: setSelectedPhaseId, onTaskClick: handleTaskClick }) }), _jsx(PropertyPanel, { outcome: showPropertyPanel ? outcome : null, sbp: sbp, onOutcomeUpdate: handleOutcomeUpdate, onClose: handleClosePropertyPanel })] }));
}
