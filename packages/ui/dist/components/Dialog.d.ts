import { ReactNode } from 'react';
export interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}
export declare function Dialog({ open, onClose, title, children, onConfirm, confirmText, cancelText, }: DialogProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=Dialog.d.ts.map