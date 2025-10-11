import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { UploadFile, Download, MenuBook, DeleteSweep } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@enablement-map-studio/store';
import { useConfirm } from '@enablement-map-studio/ui';
import { useToast } from '../contexts/ToastContext';
import { useError } from '../contexts/ErrorDialogContext';

export interface FileOperationsRef {
  openFileDialog: () => void;
}

export const FileOperations = forwardRef<FileOperationsRef>((_props, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { loadYaml, exportYaml, reset, state } = useAppStore();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { showError } = useError();

  // 外部からファイルダイアログを開けるようにする
  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      fileInputRef.current?.click();
    },
  }));

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        loadYaml(content);
        showToast('YAMLファイルを読み込みました', 'success');
        // CJMエディタに遷移
        navigate('/cjm');
      } catch (error) {
        console.error('Failed to load YAML:', error);
        showError({
          message: 'YAMLの読み込みに失敗しました',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be loaded again
    event.target.value = '';
  };

  const handleExport = () => {
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
      a.download = 'enablement-map.yaml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('YAMLファイルをエクスポートしました', 'success');
    } catch (error) {
      console.error('Failed to export YAML:', error);
      showError({
        message: 'YAMLのエクスポートに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
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
      showToast('サンプルファイルを読み込みました', 'success');
      // CJMエディタに遷移
      navigate('/cjm');
    } catch (error) {
      console.error('Failed to load sample:', error);
      showError({
        message: 'サンプルファイルの読み込みに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
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
      showToast('すべてのデータをクリアしました', 'info');
      navigate('/');
    }
  };

  const hasData = state.cjm || state.sbp || state.outcome || state.em;

  return (
    <Stack direction="row" spacing={1}>
      <Box component="input" ref={fileInputRef} type="file" accept=".yaml,.yml" onChange={handleFileChange} sx={{ display: 'none' }} aria-label="File input" />
      <Button variant="outlined" size="small" onClick={handleFileSelect} startIcon={<UploadFile />}>
        Load YAML
      </Button>
      <Button variant="outlined" size="small" onClick={handleExport} disabled={!hasData} startIcon={<Download />}>
        Export YAML
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
