import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const Textarea = React.forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsxs("label", { htmlFor: props.id, className: "label-base", children: [label, props.required && _jsx("span", { className: "text-danger-500 ml-1", children: "*" })] })), _jsx("textarea", { ref: ref, className: `input-base ${error ? 'border-danger-500 focus:ring-danger-500' : ''} ${className}`, rows: props.rows || 3, ...props }), error && _jsx("p", { className: "mt-1 text-sm text-danger-600", children: error }), helperText && !error && (_jsx("p", { className: "mt-1 text-sm text-secondary-500", children: helperText }))] }));
});
Textarea.displayName = 'Textarea';
