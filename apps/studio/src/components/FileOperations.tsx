import React, { useRef } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { UploadFile, Download, MenuBook } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@enablement-map-studio/store';

export const FileOperations: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { loadYaml, exportYaml, cjm, sbp, outcome, em } = useAppStore();

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
        alert('YAML file loaded successfully!');
        // CJMエディタに遷移
        navigate('/cjm');
      } catch (error) {
        console.error('Failed to load YAML:', error);
        alert(`Failed to load YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        alert('No data to export');
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
    } catch (error) {
      console.error('Failed to export YAML:', error);
      alert(`Failed to export YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      alert('Sample data loaded successfully!');
      // CJMエディタに遷移
      navigate('/cjm');
    } catch (error) {
      console.error('Failed to load sample:', error);
      alert(`Failed to load sample: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const hasData = cjm || sbp || outcome || em;

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
    </Stack>
  );
};
