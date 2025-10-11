import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';

interface ErrorOptions {
  title?: string;
  message: string;
  details?: string;
}

interface ErrorDialogContextType {
  showError: (options: ErrorOptions) => void;
}

const ErrorDialogContext = createContext<ErrorDialogContextType | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorDialogContext);
  if (!context) {
    throw new Error('useError must be used within ErrorDialogProvider');
  }
  return context;
}

interface ErrorDialogProviderProps {
  children: ReactNode;
}

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  details?: string;
}

export function ErrorDialogProvider({ children }: ErrorDialogProviderProps) {
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    title: 'エラー',
    message: '',
  });

  const showError = useCallback((options: ErrorOptions) => {
    setDialogState({
      open: true,
      title: options.title || 'エラー',
      message: options.message,
      details: options.details,
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <ErrorDialogContext.Provider value={{ showError }}>
      {children}
      <Dialog
        open={dialogState.open}
        onClose={handleClose}
        aria-labelledby="error-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="error-dialog-title">{dialogState.title}</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            <AlertTitle>{dialogState.message}</AlertTitle>
            {dialogState.details && (
              <DialogContentText component="div" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                {dialogState.details}
              </DialogContentText>
            )}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorDialogContext.Provider>
  );
}
