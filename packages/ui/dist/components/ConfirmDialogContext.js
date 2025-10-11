import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, } from '@mui/material';
const ConfirmDialogContext = createContext(undefined);
export function useConfirm() {
    const context = useContext(ConfirmDialogContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmDialogProvider');
    }
    return context;
}
export function ConfirmDialogProvider({ children }) {
    const [dialogState, setDialogState] = useState({
        open: false,
        title: '確認',
        message: '',
        confirmText: 'OK',
        cancelText: 'キャンセル',
    });
    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setDialogState({
                open: true,
                title: options.title || '確認',
                message: options.message,
                confirmText: options.confirmText || 'OK',
                cancelText: options.cancelText || 'キャンセル',
                resolve,
            });
        });
    }, []);
    const handleConfirm = useCallback(() => {
        if (dialogState.resolve) {
            dialogState.resolve(true);
        }
        setDialogState((prev) => ({ ...prev, open: false, resolve: undefined }));
    }, [dialogState.resolve]);
    const handleCancel = useCallback(() => {
        if (dialogState.resolve) {
            dialogState.resolve(false);
        }
        setDialogState((prev) => ({ ...prev, open: false, resolve: undefined }));
    }, [dialogState.resolve]);
    return (_jsxs(ConfirmDialogContext.Provider, { value: { confirm }, children: [children, _jsxs(Dialog, { open: dialogState.open, onClose: handleCancel, "aria-labelledby": "confirm-dialog-title", "aria-describedby": "confirm-dialog-description", children: [_jsx(DialogTitle, { id: "confirm-dialog-title", children: dialogState.title }), _jsx(DialogContent, { children: _jsx(DialogContentText, { id: "confirm-dialog-description", children: dialogState.message }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCancel, children: dialogState.cancelText }), _jsx(Button, { onClick: handleConfirm, autoFocus: true, variant: "contained", children: dialogState.confirmText })] })] })] }));
}
