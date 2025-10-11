import { Box, Typography } from '@mui/material';
import { SbpEditor } from '@enablement-map-studio/editor-sbp';

export function SbpEditorPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', px: 3, py: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Service Blueprint Editor
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <SbpEditor />
      </Box>
    </Box>
  );
}
