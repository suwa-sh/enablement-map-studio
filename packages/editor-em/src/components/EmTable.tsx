import { useMemo, useState } from 'react';
import {
  Box,
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
} from '@mui/material';
import { Search } from '@mui/icons-material';
import type { EmDsl, OutcomeDsl, SbpDsl, CjmDsl } from '@enablement-map-studio/dsl';

interface EmTableProps {
  em: EmDsl | null;
  outcome: OutcomeDsl | null;
  sbp: SbpDsl | null;
  cjm: CjmDsl | null;
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

export function EmTable({ em, outcome, sbp, cjm }: EmTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('isCSF');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterText, setFilterText] = useState('');

  const csfTaskId = outcome?.primary_csf.source_id;

  // Build flat resource list
  const rows = useMemo((): ResourceRow[] => {
    if (!em || !outcome || !sbp || !cjm) return [];

    const result: ResourceRow[] = [];
    const csfTask = sbp.tasks.find((t) => t.id === outcome.primary_csf.source_id);

    em.actions.forEach((action) => {
      const sbpTask = sbp.tasks.find((t) => t.id === action.source_id);
      if (!sbpTask) return;

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
  }, [em, outcome, sbp, cjm]);

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

  if (!em || !outcome || !sbp || !cjm) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white' }}>
        <Typography color="text.secondary">データがありません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', bgcolor: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">リソース一覧</Typography>
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
      <TableContainer sx={{ flex: 1 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-head': { bgcolor: 'grey.300', color: 'black', fontWeight: 'bold' } }}>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'isCSF'}
                  direction={sortColumn === 'isCSF' ? sortOrder : 'asc'}
                  onClick={() => handleSort('isCSF')}
                >
                  CSF
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'cjmPhase'}
                  direction={sortColumn === 'cjmPhase' ? sortOrder : 'asc'}
                  onClick={() => handleSort('cjmPhase')}
                >
                  CJMフェーズ
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'cjmAction'}
                  direction={sortColumn === 'cjmAction' ? sortOrder : 'asc'}
                  onClick={() => handleSort('cjmAction')}
                >
                  CJMアクション
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'sbpLane'}
                  direction={sortColumn === 'sbpLane' ? sortOrder : 'asc'}
                  onClick={() => handleSort('sbpLane')}
                >
                  SBPレーン
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'sbpTask'}
                  direction={sortColumn === 'sbpTask' ? sortOrder : 'asc'}
                  onClick={() => handleSort('sbpTask')}
                >
                  SBPタスク
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'requiredAction'}
                  direction={sortColumn === 'requiredAction' ? sortOrder : 'asc'}
                  onClick={() => handleSort('requiredAction')}
                >
                  必要な行動
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'linkType'}
                  direction={sortColumn === 'linkType' ? sortOrder : 'asc'}
                  onClick={() => handleSort('linkType')}
                >
                  リンクタイプ
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'name'}
                  direction={sortColumn === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  名前
                </TableSortLabel>
              </TableCell>
              <TableCell>URL</TableCell>
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
    </Box>
  );
}
