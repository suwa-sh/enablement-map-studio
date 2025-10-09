import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { Button } from './Button';
export function Dialog({ open, onClose, title, children, onConfirm, confirmText = 'OK', cancelText = 'キャンセル', }) {
    if (!open)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black/50", onClick: onClose, "aria-hidden": "true" }), _jsxs("div", { className: clsx('relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl', 'transform transition-all'), role: "dialog", "aria-modal": "true", "aria-labelledby": "dialog-title", children: [_jsx("h2", { id: "dialog-title", className: "text-lg font-semibold text-gray-900 mb-4", children: title }), _jsx("div", { className: "mb-6 text-gray-700", children: children }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: onClose, children: cancelText }), onConfirm && (_jsx(Button, { variant: "primary", onClick: onConfirm, children: confirmText }))] })] })] }));
}
