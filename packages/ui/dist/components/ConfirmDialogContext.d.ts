import { ReactNode } from 'react';
interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}
interface ConfirmDialogContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}
export declare function useConfirm(): ConfirmDialogContextType;
interface ConfirmDialogProviderProps {
    children: ReactNode;
}
export declare function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ConfirmDialogContext.d.ts.map