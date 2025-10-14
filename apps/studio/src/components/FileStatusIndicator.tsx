import { Typography } from '@mui/material';
import { useAppStore } from '@enablement-map-studio/store';

export const FileStatusIndicator = () => {
  const fileMetadata = useAppStore((state) => state.fileMetadata);

  if (!fileMetadata) return null;

  return (
    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
      {fileMetadata.fileName}
      {fileMetadata.hasUnsavedChanges && ' *'}
    </Typography>
  );
};
