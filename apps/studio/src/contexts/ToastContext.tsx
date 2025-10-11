import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastMessage {
  id: number;
  message: string;
  severity: AlertColor;
}

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, severity: AlertColor = 'info') => {
    const id = Date.now();
    const newToast = { id, message, severity };

    setToasts((prev) => [...prev, newToast]);

    if (!currentToast) {
      setCurrentToast(newToast);
    }
  }, [currentToast]);

  const handleClose = useCallback(() => {
    setToasts((prev) => {
      const [, ...rest] = prev;
      if (rest.length > 0) {
        setCurrentToast(rest[0]);
      } else {
        setCurrentToast(null);
      }
      return rest;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={currentToast !== null}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={currentToast?.severity || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {currentToast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
