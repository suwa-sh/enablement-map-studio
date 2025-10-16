import { useMemo, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Link,
  TableSortLabel,
  TextField,
  InputAdornment,
  Checkbox,
  Button,
} from '@mui/material';
import { Search, Download, Upload } from '@mui/icons-material';
import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';
import {
  findOrCreateCjmPhase,
  findOrCreateCjmAction,
  findOrCreateSbpLane,
  findOrCreateSbpTask,
  findOrCreateEmAction,
  processSkillResource,
  processKnowledgeResource,
  processToolResource,
} from '../utils/csv-import-helpers';

interface EmTableProps {
  em: EmDsl | null;
  outcome: OutcomeDsl | null;
  sbp: SbpDsl | null;
  cjm: CjmDsl | null;
  visibleTaskIds: Set<string> | null;
  onCjmUpdate: (cjm: CjmDsl) => void;
  onSbpUpdate: (sbp: SbpDsl) => void;
  onEmUpdate: (em: EmDsl) => void;
  onShowToast: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface ResourceRow {
  isCSF: boolean;
  cjmPhase: string;
  cjmAction: string;
  sbpLane: string;
  sbpTask: string;
  sbpTaskId: string;
  requiredAction: string;
  linkType: string;
  name: string;
  url?: string;
}

type SortColumn = keyof ResourceRow;
type SortOrder = 'asc' | 'desc';

export function EmTable({ em, outcome, sbp, cjm, visibleTaskIds, onCjmUpdate, onSbpUpdate, onEmUpdate, onShowToast }: EmTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('isCSF');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterText, setFilterText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build flat resource list
  const rows = useMemo((): ResourceRow[] => {
    if (!em || !outcome || !sbp || !cjm) return [];

    const result: ResourceRow[] = [];

    em.actions.forEach((action) => {
      const sbpTask = sbp.tasks.find((t) => t.id === action.source_id);
      if (!sbpTask) return;

      // Apply filter: only show resources for visible tasks
      if (visibleTaskIds !== null && !visibleTaskIds.has(sbpTask.id)) return;

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
        } else {
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
      filtered = rows.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(lowerFilter)
        )
      );
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      const aValue = String(a[sortColumn] || '');
      const bValue = String(b[sortColumn] || '');

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue, 'ja');
      } else {
        return bValue.localeCompare(aValue, 'ja');
      }
    });

    return sorted;
  }, [rows, filterText, sortColumn, sortOrder]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const generateCSV = (rows: ResourceRow[]): string => {
    // CSV escape function
    const escapeCSV = (value: string | boolean | undefined): string => {
      if (value === undefined || value === '') return '';
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

  const parseCSV = (csvText: string): string[][] => {
    // Remove BOM if present
    const text = csvText.replace(/^\uFEFF/, '');

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (insideQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            // Escaped quote
            currentField += '"';
            i++; // Skip next quote
          } else {
            // End of quoted field
            insideQuotes = false;
          }
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          // Start of quoted field
          insideQuotes = true;
        } else if (char === ',') {
          // Field separator
          currentRow.push(currentField);
          currentField = '';
        } else if (char === '\n') {
          // Row separator
          currentRow.push(currentField);
          if (currentRow.some(f => f.trim() !== '')) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        } else if (char === '\r') {
          // Skip CR (will handle LF next)
          continue;
        } else {
          currentField += char;
        }
      }
    }

    // Handle last field and row
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim() !== '')) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  const handleUploadCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const rows = parseCSV(csvText);

        if (rows.length === 0) {
          onShowToast('CSVファイルが空です', 'error');
          return;
        }

        // Validate header
        const expectedHeaders = [
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
        const header = rows[0];
        if (header.length !== expectedHeaders.length) {
          onShowToast(`CSVのカラム数が不正です。${expectedHeaders.length}列必要です。`, 'error');
          return;
        }

        // Process data rows
        processCSVRows(rows.slice(1));
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        const errorMessage = `CSVの解析に失敗しました: ${error instanceof Error ? error.message : String(error)}`;
        onShowToast(errorMessage, 'error');
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be uploaded again
    event.target.value = '';
  };

  const processCSVRows = (dataRows: string[][]) => {
    if (!em || !sbp || !cjm) {
      onShowToast('データが初期化されていません', 'error');
      return;
    }

    let newCjm = { ...cjm };
    let newSbp = { ...sbp };
    let newEm = { ...em };

    for (const row of dataRows) {
      if (row.length < 9) continue; // Skip incomplete rows

      const [_csf, cjmPhaseName, cjmActionName, sbpLaneName, sbpTaskName, emActionName, resourceType, resourceName, resourceUrl] = row;

      // Skip if essential fields are empty
      if (!resourceName.trim()) continue;

      // Find or create CJM entities
      const cjmPhaseResult = findOrCreateCjmPhase(newCjm, cjmPhaseName);
      newCjm = cjmPhaseResult.cjm;
      const cjmPhase = cjmPhaseResult.phase;

      const cjmActionResult = findOrCreateCjmAction(newCjm, cjmActionName, cjmPhase?.id || null);
      newCjm = cjmActionResult.cjm;

      // Find or create SBP entities
      const sbpLaneResult = findOrCreateSbpLane(newSbp, sbpLaneName);
      newSbp = sbpLaneResult.sbp;
      const sbpLane = sbpLaneResult.lane;

      const sbpTaskResult = findOrCreateSbpTask(newSbp, sbpTaskName, sbpLane?.id || null);
      newSbp = sbpTaskResult.sbp;
      const sbpTask = sbpTaskResult.task;

      // Find or create EM Action
      const emActionResult = findOrCreateEmAction(newEm, emActionName, sbpTask?.id || null);
      newEm = emActionResult.em;
      const emAction = emActionResult.action;

      if (!emAction) continue;

      // Process resource based on type
      const trimmedType = resourceType.trim();

      if (trimmedType === 'スキル' || trimmedType === 'スキル/学習コンテンツ') {
        newEm = processSkillResource(newEm, emAction.id, resourceName, resourceUrl);
      } else if (trimmedType === 'ナレッジ') {
        newEm = processKnowledgeResource(newEm, emAction.id, resourceName, resourceUrl);
      } else if (trimmedType === 'ツール') {
        newEm = processToolResource(newEm, emAction.id, resourceName, resourceUrl);
      }
    }

    // Update all DSLs
    onCjmUpdate(newCjm);
    onSbpUpdate(newSbp);
    onEmUpdate(newEm);

    onShowToast('CSVファイルからリソースを一括登録しました', 'success');
  };

  if (!em || !outcome || !sbp || !cjm) {
    return (
      <Paper elevation={2} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }}>
        <Typography color="text.secondary">データがありません</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">リソース一覧</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="input"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleUploadCSV}
              sx={{ display: 'none' }}
              aria-label="CSV file input"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
            >
              CSVアップロード
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={handleDownloadCSV}
            >
              CSVダウンロード
            </Button>
            <TextField
              size="small"
              placeholder="検索..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Box>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 500px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-head': { bgcolor: 'grey.300', color: 'black', fontWeight: 'bold' } }}>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'isCSF'}
                  direction={sortColumn === 'isCSF' ? sortOrder : 'asc'}
                  onClick={() => handleSort('isCSF')}
                >
                  <br />CSF
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'cjmPhase'}
                  direction={sortColumn === 'cjmPhase' ? sortOrder : 'asc'}
                  onClick={() => handleSort('cjmPhase')}
                >
                  CJM<br />フェーズ
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'cjmAction'}
                  direction={sortColumn === 'cjmAction' ? sortOrder : 'asc'}
                  onClick={() => handleSort('cjmAction')}
                >
                  CJM<br />アクション
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'sbpLane'}
                  direction={sortColumn === 'sbpLane' ? sortOrder : 'asc'}
                  onClick={() => handleSort('sbpLane')}
                >
                  SBP<br />レーン
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'sbpTask'}
                  direction={sortColumn === 'sbpTask' ? sortOrder : 'asc'}
                  onClick={() => handleSort('sbpTask')}
                >
                  SBP<br />タスク
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'requiredAction'}
                  direction={sortColumn === 'requiredAction' ? sortOrder : 'asc'}
                  onClick={() => handleSort('requiredAction')}
                >
                  <br />必要な行動
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'linkType'}
                  direction={sortColumn === 'linkType' ? sortOrder : 'asc'}
                  onClick={() => handleSort('linkType')}
                >
                  リソース<br />タイプ
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'name'}
                  direction={sortColumn === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  <br />リソース
                </TableSortLabel>
              </TableCell>
              <TableCell><br />URL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    {filterText ? '検索結果がありません' : 'リソースがありません'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedRows.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    '& .MuiTableCell-root': {
                      bgcolor: index % 2 === 0 ? 'white' : 'grey.50'
                    }
                  }}
                >
                  <TableCell sx={{ bgcolor: row.isCSF ? '#c8e6c9' : undefined, textAlign: 'center' }}>
                    <Checkbox checked={row.isCSF} disabled size="small" />
                  </TableCell>
                  <TableCell>{row.cjmPhase}</TableCell>
                  <TableCell>{row.cjmAction}</TableCell>
                  <TableCell>{row.sbpLane}</TableCell>
                  <TableCell>{row.sbpTask}</TableCell>
                  <TableCell>{row.requiredAction}</TableCell>
                  <TableCell>{row.linkType}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.url ? (
                      <Link href={row.url} target="_blank" rel="noopener noreferrer">
                        {row.url}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
