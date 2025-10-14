import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { FolderOpen, Save, SaveAs, MenuBook, DeleteSweep } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@enablement-map-studio/store';
import { useConfirm } from '@enablement-map-studio/ui';
import { useToast } from '../contexts/ToastContext';
import { useError } from '../contexts/ErrorDialogContext';

export interface FileOperationsRef {
  openFileDialog: () => void;
}

// Constants
const ABORT_ERROR = 'AbortError';
const UNKNOWN_ERROR = 'Unknown error';

export const FileOperations = forwardRef<FileOperationsRef>((_props, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);

  const {
    loadYaml,
    exportYaml,
    reset,
    state,
    fileMetadata,
    setFileMetadata,
    markAsSaved,
  } = useAppStore();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { showError } = useError();

  const hasData = state.cjm || state.sbp || state.outcome || state.em;
  const hasUnsavedChanges = fileMetadata?.hasUnsavedChanges ?? false;

  // Helper: ユーザーキャンセルかどうかを判定
  const isUserCancelled = (error: unknown): boolean => {
    return error instanceof Error && error.name === ABORT_ERROR;
  };

  // Helper: エラーメッセージを取得
  const getErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : UNKNOWN_ERROR;
  };

  // File System Access API による Open File
  const handleOpenFile = async () => {
    try {
      if (!('showOpenFilePicker' in window)) {
        // フォールバック: 従来の input type="file"
        fileInputRef.current?.click();
        return;
      }

      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'YAML Files',
            accept: { 'text/yaml': ['.yaml', '.yml'] },
          },
        ],
      });

      const file = await handle.getFile();
      const content = await file.text();

      loadYaml(content);
      setFileHandle(handle);
      setFileMetadata({
        fileName: file.name,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
      });

      showToast(`${file.name} を読み込みました`, 'success');
      navigate('/cjm');
    } catch (error) {
      if (isUserCancelled(error)) return;

      console.error('Failed to open file:', error);
      showError({
        message: 'ファイルを開けませんでした',
        details: getErrorMessage(error),
      });
    }
  };

  // 外部からファイルダイアログを開けるようにする
  useImperativeHandle(ref, () => ({
    openFileDialog: handleOpenFile,
  }));

  // Save As: 名前を付けて保存
  const handleSaveAs = async () => {
    if (!hasData) return;

    try {
      if (!('showSaveFilePicker' in window)) {
        // フォールバック: 従来のダウンロード方式
        handleLegacyExport();
        return;
      }

      const yamlContent = exportYaml();
      if (!yamlContent) {
        showError({
          message: 'エクスポートするデータがありません',
        });
        return;
      }

      const handle = await window.showSaveFilePicker({
        types: [
          {
            description: 'YAML Files',
            accept: { 'text/yaml': ['.yaml', '.yml'] },
          },
        ],
        suggestedName: fileMetadata?.fileName || 'enablement-map.yaml',
      });

      const writable = await handle.createWritable();
      await writable.write(yamlContent);
      await writable.close();

      setFileHandle(handle);
      setFileMetadata({
        fileName: handle.name,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
      });

      showToast(`${handle.name} として保存しました`, 'success');
    } catch (error) {
      if (isUserCancelled(error)) return;

      console.error('Failed to save file as:', error);
      showError({
        message: 'ファイルの保存に失敗しました',
        details: getErrorMessage(error),
      });
    }
  };

  // Save: 上書き保存
  const handleSave = async () => {
    if (!hasData) return;

    // ファイルハンドルがない場合は Save As
    if (!fileHandle) {
      await handleSaveAs();
      return;
    }

    try {
      const yamlContent = exportYaml();
      if (!yamlContent) {
        showError({
          message: 'エクスポートするデータがありません',
        });
        return;
      }

      const writable = await fileHandle.createWritable();
      await writable.write(yamlContent);
      await writable.close();

      markAsSaved();
      showToast('保存しました', 'success');
    } catch (error) {
      console.error('Failed to save file:', error);
      showError({
        message: 'ファイルの保存に失敗しました',
        details: getErrorMessage(error),
      });
    }
  };

  // Ctrl+O / Cmd+O でopen, Ctrl+S / Cmd+S でsave, Ctrl+Shift+S / Cmd+Shift+S でsaveAs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+O / Cmd+O: Open File
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleOpenFile();
        return;
      }

      // Ctrl+S / Cmd+S: Save
      // Ctrl+Shift+S / Cmd+Shift+S: Save As
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAs();
        } else {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fileHandle, hasData, handleSave, handleSaveAs, handleOpenFile]);

  // ブラウザ終了時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 従来の input type="file" によるフォールバック
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        loadYaml(content);
        setFileMetadata({
          fileName: file.name,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
        });
        showToast(`${file.name} を読み込みました`, 'success');
        navigate('/cjm');
      } catch (error) {
        console.error('Failed to load YAML:', error);
        showError({
          message: 'YAMLの読み込みに失敗しました',
          details: getErrorMessage(error),
        });
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be loaded again
    event.target.value = '';
  };

  // 従来のダウンロード方式 (フォールバック)
  const handleLegacyExport = () => {
    try {
      const yamlContent = exportYaml();
      if (!yamlContent) {
        showError({
          message: 'エクスポートするデータがありません',
        });
        return;
      }

      const blob = new Blob([yamlContent], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileMetadata?.fileName || 'enablement-map.yaml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('YAMLファイルをエクスポートしました', 'success');
    } catch (error) {
      console.error('Failed to export YAML:', error);
      showError({
        message: 'YAMLのエクスポートに失敗しました',
        details: getErrorMessage(error),
      });
    }
  };

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/sample.yaml');
      if (!response.ok) {
        throw new Error('Failed to fetch sample file');
      }
      const content = await response.text();
      loadYaml(content);

      // サンプルロード時はファイルハンドルをクリア
      setFileHandle(null);
      setFileMetadata(null);

      showToast('サンプルファイルを読み込みました', 'success');
      navigate('/cjm');
    } catch (error) {
      console.error('Failed to load sample:', error);
      showError({
        message: 'サンプルファイルの読み込みに失敗しました',
        details: getErrorMessage(error),
      });
    }
  };

  const handleClearCanvas = async () => {
    const confirmed = await confirm({
      title: '確認',
      message: 'すべてのデータをクリアしてもよろしいですか？この操作は元に戻せません。',
      confirmText: 'クリア',
      cancelText: 'キャンセル',
    });

    if (confirmed) {
      reset();
      setFileHandle(null);
      showToast('すべてのデータをクリアしました', 'info');
      navigate('/');
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <Box
        component="input"
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        onChange={handleFileChange}
        sx={{ display: 'none' }}
        aria-label="File input"
      />
      <Button variant="outlined" size="small" onClick={handleOpenFile} startIcon={<FolderOpen />}>
        Open File
      </Button>
      <Button
        variant={hasUnsavedChanges ? 'contained' : 'outlined'}
        size="small"
        onClick={handleSave}
        disabled={!fileHandle && !hasData}
        startIcon={<Save />}
      >
        {hasUnsavedChanges ? 'Save *' : 'Save'}
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={handleSaveAs}
        disabled={!hasData}
        startIcon={<SaveAs />}
      >
        Save As...
      </Button>
      <Button variant="outlined" size="small" onClick={handleLoadSample} startIcon={<MenuBook />}>
        Load Sample
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={handleClearCanvas}
        disabled={!hasData}
        startIcon={<DeleteSweep />}
        color="error"
      >
        Clear Canvas
      </Button>
    </Stack>
  );
});
