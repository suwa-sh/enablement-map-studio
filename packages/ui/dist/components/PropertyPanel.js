import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const PropertyPanel = ({ title, children, className = '', onClose, }) => {
    return (_jsxs("div", { className: `w-full h-full bg-white border-l border-secondary-200 overflow-y-auto scrollbar-thin ${className}`, children: [title && (_jsxs("div", { className: "sticky top-0 z-10 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-secondary-900", children: title }), onClose && (_jsx("button", { onClick: onClose, className: "text-secondary-400 hover:text-secondary-600 transition-colors", "aria-label": "Close panel", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] })), _jsx("div", { className: "p-6 space-y-6", children: children })] }));
};
export const PropertySection = ({ title, children, collapsible = false, defaultExpanded = true, }) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    const toggleExpanded = () => {
        if (collapsible) {
            setIsExpanded(!isExpanded);
        }
    };
    return (_jsxs("div", { className: "space-y-3", children: [title && (_jsxs("div", { className: `flex items-center justify-between ${collapsible ? 'cursor-pointer' : ''}`, onClick: toggleExpanded, children: [_jsx("h4", { className: "text-sm font-semibold text-secondary-700 uppercase tracking-wide", children: title }), collapsible && (_jsx("svg", { className: `w-4 h-4 text-secondary-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) }))] })), isExpanded && _jsx("div", { className: "space-y-4", children: children })] }));
};
export const PropertyField = ({ label, value, labelWidth = 'md', }) => {
    const widthClasses = {
        sm: 'w-20',
        md: 'w-32',
        lg: 'w-40',
    };
    return (_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("span", { className: `${widthClasses[labelWidth]} flex-shrink-0 text-sm font-medium text-secondary-600`, children: label }), _jsx("div", { className: "flex-1 text-sm text-secondary-900", children: value })] }));
};
