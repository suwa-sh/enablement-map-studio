import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HierarchyTree } from './HierarchyTree';
import { buildHierarchy } from '../utils/buildHierarchy';
export function EmCanvas({ em, outcome, sbp, cjm, selectedItem, onSelectItem, }) {
    const hierarchy = buildHierarchy(em, outcome, sbp, cjm);
    if (hierarchy.length === 0) {
        return (_jsx("div", { className: "flex h-full items-center justify-center bg-gray-50 p-6", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx("p", { children: "No hierarchy to display." }), _jsx("p", { className: "mt-2 text-sm", children: "Make sure CJM, SBP, and Outcome data are properly linked." })] }) }));
    }
    return (_jsxs("div", { className: "h-full bg-gray-50 p-6", children: [_jsx("h2", { className: "mb-4 text-lg font-semibold text-gray-900", children: "Enablement Map Hierarchy" }), _jsx("div", { className: "rounded-lg bg-white p-6 shadow", children: _jsx(HierarchyTree, { nodes: hierarchy, em: em, selectedItem: selectedItem, onSelectItem: onSelectItem }) })] }));
}
