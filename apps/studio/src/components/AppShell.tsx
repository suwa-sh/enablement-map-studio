import { ReactNode, useEffect, useRef } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Stack } from '@mui/material';
import { Undo, Redo } from '@mui/icons-material';
import { Navigation } from './Navigation';
import { FileOperations, FileOperationsRef } from './FileOperations';
import { FileStatusIndicator } from './FileStatusIndicator';
import { useUndoableStore } from '@enablement-map-studio/store';
import { ConfirmDialogProvider } from '@enablement-map-studio/ui';
import { ToastProvider } from '../contexts/ToastContext';
import { ErrorDialogProvider } from '../contexts/ErrorDialogContext';

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Undo/Redo機能をuse-undoから取得
  const { undo, redo, canUndo, canRedo } = useUndoableStore();

  // FileOperationsのrefを取得
  const fileOperationsRef = useRef<FileOperationsRef>(null);

  // キーボードショートカット: Ctrl+Z/Cmd+Z (Undo), Ctrl+Shift+Z/Cmd+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フィールド内での操作は除外（通常のundo/redoを優先）
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl (Windows/Linux) または Cmd (macOS) が押されているかチェック
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCtrlOrCmd && e.shiftKey && key === 'z') {
        // Ctrl+Shift+Z または Cmd+Shift+Z → Redo
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      } else if (isCtrlOrCmd && !e.shiftKey && key === 'z') {
        // Ctrl+Z または Cmd+Z → Undo
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      } else if (isCtrlOrCmd && key === 'o') {
        // Ctrl+O または Cmd+O → Load YAML
        e.preventDefault();
        fileOperationsRef.current?.openFileDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);

  return (
    <ToastProvider>
      <ConfirmDialogProvider>
        <ErrorDialogProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Top Header Bar */}
            <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 1 }}>
              <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src="/logo.png"
                    alt="Enablement Map Studio"
                    sx={{ height: 52, width: 'auto' }}
                  />
                  <FileStatusIndicator />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  {/* Undo/Redo ボタン */}
                  <IconButton onClick={undo} disabled={!canUndo} size="small" title="Undo (元に戻す)">
                    <Undo />
                  </IconButton>
                  <IconButton onClick={redo} disabled={!canRedo} size="small" title="Redo (やり直し)">
                    <Redo />
                  </IconButton>
                  <FileOperations ref={fileOperationsRef} />
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
        </ErrorDialogProvider>
      </ConfirmDialogProvider>
    </ToastProvider>
  );
}
