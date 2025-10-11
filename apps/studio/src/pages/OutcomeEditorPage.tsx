import { Box, Typography } from '@mui/material';
import { OutcomeEditor } from '@enablement-map-studio/editor-outcome';

export function OutcomeEditorPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', px: 3, py: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Outcome Editor
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <OutcomeEditor />
      </Box>
    </Box>
  );
}
