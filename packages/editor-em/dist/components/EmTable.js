import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Link, TableSortLabel, TextField, InputAdornment, Checkbox, Button, } from '@mui/material';
import { Search, Download } from '@mui/icons-material';
export function EmTable({ em, outcome, sbp, cjm, visibleTaskIds }) {
    const [sortColumn, setSortColumn] = useState('isCSF');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterText, setFilterText] = useState('');
    // Build flat resource list
    const rows = useMemo(() => {
        if (!em || !outcome || !sbp || !cjm)
            return [];
        const result = [];
        em.actions.forEach((action) => {
            const sbpTask = sbp.tasks.find((t) => t.id === action.source_id);
            if (!sbpTask)
                return;
            // Apply filter: only show resources for visible tasks
            if (visibleTaskIds !== null && !visibleTaskIds.has(sbpTask.id))
                return;
            const sbpLane = sbp.lanes.find((l) => l.id === sbpTask.lane);
            // Get CJM action linked to this SBP task
            const cjmAction = sbpTask.readonly
                ? cjm.actions.find((a) => a.id === sbpTask.id)
                : cjm.actions.find((a) => a.id === sbpTask.source_id);
            const cjmPhase = cjmAction
                ? cjm.phases.find((p) => p.id === cjmAction.phase)
                : undefined;
            const baseRow = {
                isCSF: sbpTask.id === outcome.primary_csf.source_id,
                cjmPhase: cjmPhase?.name || '',
                cjmAction: cjmAction?.name || '',
                sbpLane: sbpLane?.name || '',
                sbpTask: sbpTask.name,
                sbpTaskId: sbpTask.id,
                requiredAction: action.name,
            };
            // Add skills with learnings
            const actionSkills = em.skills?.filter((s) => s.action_id === action.id) || [];
            actionSkills.forEach((skill) => {
                if (skill.learnings && skill.learnings.length > 0) {
                    skill.learnings.forEach((learning) => {
                        result.push({
                            ...baseRow,
                            linkType: 'スキル/学習コンテンツ',
                            name: `${skill.name} / ${learning.title}`,
                            url: learning.url,
                        });
                    });
                }
                else {
                    result.push({
                        ...baseRow,
                        linkType: 'スキル',
                        name: skill.name,
                    });
                }
            });
            // Add knowledge
            const actionKnowledge = em.knowledge?.filter((k) => k.action_id === action.id) || [];
            actionKnowledge.forEach((knowledge) => {
                result.push({
                    ...baseRow,
                    linkType: 'ナレッジ',
                    name: knowledge.name,
                    url: knowledge.url,
                });
            });
            // Add tools
            const actionTools = em.tools?.filter((t) => t.action_id === action.id) || [];
            actionTools.forEach((tool) => {
                result.push({
                    ...baseRow,
                    linkType: 'ツール',
                    name: tool.name,
                    url: tool.url,
                });
            });
        });
        return result;
    }, [em, outcome, sbp, cjm, visibleTaskIds]);
    // Filter and sort rows
    const filteredAndSortedRows = useMemo(() => {
        let filtered = rows;
        // Apply filter
        if (filterText) {
            const lowerFilter = filterText.toLowerCase();
            filtered = rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(lowerFilter)));
        }
        // Apply sort
        const sorted = [...filtered].sort((a, b) => {
            const aValue = String(a[sortColumn] || '');
            const bValue = String(b[sortColumn] || '');
            if (sortOrder === 'asc') {
                return aValue.localeCompare(bValue, 'ja');
            }
            else {
                return bValue.localeCompare(aValue, 'ja');
            }
        });
        return sorted;
    }, [rows, filterText, sortColumn, sortOrder]);
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortColumn(column);
            setSortOrder('asc');
        }
    };
    const generateCSV = (rows) => {
        // CSV escape function
        const escapeCSV = (value) => {
            if (value === undefined || value === '')
                return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        // Header row
        const headers = [
            'CSF',
            'CJMフェーズ',
            'CJMアクション',
            'SBPレーン',
            'SBPタスク',
            '必要な行動',
            'リソースタイプ',
            'リソース',
            'URL',
        ];
        const headerRow = headers.map(escapeCSV).join(',');
        // Data rows
        const dataRows = rows.map((row) => {
            return [
                row.isCSF ? '○' : '',
                row.cjmPhase,
                row.cjmAction,
                row.sbpLane,
                row.sbpTask,
                row.requiredAction,
                row.linkType,
                row.name,
                row.url || '',
            ].map(escapeCSV).join(',');
        });
        return [headerRow, ...dataRows].join('\n');
    };
    const handleDownloadCSV = () => {
        const csv = generateCSV(filteredAndSortedRows);
        // Add BOM for Excel UTF-8 support
        const bom = '\uFEFF';
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Generate filename with timestamp
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
        link.download = `リソース一覧_${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    if (!em || !outcome || !sbp || !cjm) {
        return (_jsx(Paper, { elevation: 2, sx: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }, children: _jsx(Typography, { color: "text.secondary", children: "\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093" }) }));
    }
    return (_jsxs(Paper, { elevation: 2, sx: { overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'white' }, children: [_jsx(Box, { sx: { p: 2, borderBottom: 1, borderColor: 'divider' }, children: _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }, children: [_jsx(Typography, { variant: "h6", children: "\u30EA\u30BD\u30FC\u30B9\u4E00\u89A7" }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Button, { variant: "outlined", size: "small", startIcon: _jsx(Download, {}), onClick: handleDownloadCSV, children: "CSV\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9" }), _jsx(TextField, { size: "small", placeholder: "\u691C\u7D22...", value: filterText, onChange: (e) => setFilterText(e.target.value), sx: { width: 300 }, InputProps: {
                                        startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Search, { fontSize: "small" }) })),
                                    } })] })] }) }), _jsx(TableContainer, { sx: { maxHeight: 'calc(100vh - 500px)' }, children: _jsxs(Table, { stickyHeader: true, size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { '& .MuiTableCell-head': { bgcolor: 'grey.300', color: 'black', fontWeight: 'bold' } }, children: [_jsx(TableCell, { children: _jsxs(TableSortLabel, { active: sortColumn === 'isCSF', direction: sortColumn === 'isCSF' ? sortOrder : 'asc', onClick: () => handleSort('isCSF'), children: [_jsx("br", {}), "CSF"] }) }), _jsx(TableCell, { children: _jsxs(TableSortLabel, { active: sortColumn === 'cjmPhase', direction: sortColumn === 'cjmPhase' ? sortOrder : 'asc', onClick: () => handleSort('cjmPhase'), children: ["CJM", _jsx("br", {}), "\u30D5\u30A7\u30FC\u30BA"] }) }), _jsx(TableCell, { children: _jsxs(TableSortLabel, { active: sortColumn === 'cjmAction', direction: sortColumn === 'cjmAction' ? sortOrder : 'asc', onClick: () => handleSort('cjmAction'), children: ["CJM", _jsx("br", {}), "\u30A2\u30AF\u30B7\u30E7\u30F3"] }) }), _jsx(TableCell, { children: _jsxs(TableSortLabel, { active: sortColumn === 'sbpLane', direction: sortColumn === 'sbpLane' ? sortOrder : 'asc', onClick: () => handleSort('sbpLane'), children: ["SBP", _jsx("br", {}), "\u30EC\u30FC\u30F3"] }) }), _jsx(TableCell, { children: _jsxs(TableSortLabel, { active: sortColumn === 'sbpTask', direction: sortColumn === 'sbpTask' ? sortOrder : 'asc', onClick: () => handleSort('sbpTask'), children: ["SBP", _jsx("br", {}), "\u30BF\u30B9\u30AF"] }) }), _jsx(TableCell, { children: _jsxs(TableSortLabel, { active: sortColumn === 'requiredAction', direction: sortColumn === 'requiredAction' ? sortOrder : 'asc', onClick: () => handleSort('requiredAction'), children: [_jsx("br", {}), "\u5FC5\u8981\u306A\u884C\u52D5"] }) }), _jsx(TableCell, { children: _jsxs(TableSortLabel, { active: sortColumn === 'linkType', direction: sortColumn === 'linkType' ? sortOrder : 'asc', onClick: () => handleSort('linkType'), children: ["\u30EA\u30BD\u30FC\u30B9", _jsx("br", {}), "\u30BF\u30A4\u30D7"] }) }), _jsx(TableCell, { children: _jsxs(TableSortLabel, { active: sortColumn === 'name', direction: sortColumn === 'name' ? sortOrder : 'asc', onClick: () => handleSort('name'), children: [_jsx("br", {}), "\u30EA\u30BD\u30FC\u30B9"] }) }), _jsxs(TableCell, { children: [_jsx("br", {}), "URL"] })] }) }), _jsx(TableBody, { children: filteredAndSortedRows.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, align: "center", children: _jsx(Typography, { color: "text.secondary", sx: { py: 3 }, children: filterText ? '検索結果がありません' : 'リソースがありません' }) }) })) : (filteredAndSortedRows.map((row, index) => (_jsxs(TableRow, { hover: true, sx: {
                                    '& .MuiTableCell-root': {
                                        bgcolor: index % 2 === 0 ? 'white' : 'grey.50'
                                    }
                                }, children: [_jsx(TableCell, { sx: { bgcolor: row.isCSF ? '#c8e6c9' : undefined, textAlign: 'center' }, children: _jsx(Checkbox, { checked: row.isCSF, disabled: true, size: "small" }) }), _jsx(TableCell, { children: row.cjmPhase }), _jsx(TableCell, { children: row.cjmAction }), _jsx(TableCell, { children: row.sbpLane }), _jsx(TableCell, { children: row.sbpTask }), _jsx(TableCell, { children: row.requiredAction }), _jsx(TableCell, { children: row.linkType }), _jsx(TableCell, { children: row.name }), _jsx(TableCell, { children: row.url ? (_jsx(Link, { href: row.url, target: "_blank", rel: "noopener noreferrer", children: row.url })) : ('-') })] }, index)))) })] }) })] }));
}
