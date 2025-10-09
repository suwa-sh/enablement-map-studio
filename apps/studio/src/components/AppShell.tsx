import { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import { Navigation } from './Navigation';
import { FileOperations } from './FileOperations';

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Header Bar */}
      <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h1" fontWeight="semibold">
            Enablement Map Studio
          </Typography>
          <FileOperations />
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
