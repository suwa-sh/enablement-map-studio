import { Box, Typography } from '@mui/material';
import { CjmEditor } from '@enablement-map-studio/editor-cjm';

export function CjmEditorPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', px: 3, py: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Customer Journey Map Editor
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <CjmEditor />
      </Box>
    </Box>
  );
}
