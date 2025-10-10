import { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Stack } from '@mui/material';
import { Undo, Redo } from '@mui/icons-material';
import { Navigation } from './Navigation';
import { FileOperations } from './FileOperations';

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Undo/Redo機能は一時的に無効化
  // TODO: zundoのtemporal APIの正しい使い方を調査して再実装
  const undo = () => console.log('Undo (未実装)');
  const redo = () => console.log('Redo (未実装)');
  const canUndo = false;
  const canRedo = false;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Header Bar */}
      <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h1" fontWeight="semibold">
            Enablement Map Studio
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Undo/Redo ボタン */}
            <IconButton onClick={undo} disabled={!canUndo} size="small" title="Undo (元に戻す)">
              <Undo />
            </IconButton>
            <IconButton onClick={redo} disabled={!canRedo} size="small" title="Redo (やり直し)">
              <Redo />
            </IconButton>
            <FileOperations />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Navigation Bar */}
        <Navigation />

        {/* Main Content Area */}
        <Box component="main" sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.50' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
