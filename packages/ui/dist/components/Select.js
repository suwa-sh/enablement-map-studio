import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const Select = React.forwardRef(({ label, error, helperText, options, onChange, className = '', ...props }, ref) => {
    const handleChange = (e) => {
        onChange?.(e.target.value);
    };
    return (_jsxs("div", { className: "w-full", children: [label && (_jsxs("label", { htmlFor: props.id, className: "label-base", children: [label, props.required && _jsx("span", { className: "text-danger-500 ml-1", children: "*" })] })), _jsx("select", { ref: ref, onChange: handleChange, className: `input-base cursor-pointer ${error ? 'border-danger-500 focus:ring-danger-500' : ''} ${className}`, ...props, children: options.map((option) => (_jsx("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value))) }), error && _jsx("p", { className: "mt-1 text-sm text-danger-600", children: error }), helperText && !error && (_jsx("p", { className: "mt-1 text-sm text-secondary-500", children: helperText }))] }));
});
Select.displayName = 'Select';
