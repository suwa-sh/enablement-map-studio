import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function HierarchyTree({ nodes, em, selectedItem, onSelectItem, depth = 0, }) {
    return (_jsx("div", { className: "space-y-2", children: nodes.map((node) => (_jsx(HierarchyNode, { node: node, em: em, selectedItem: selectedItem, onSelectItem: onSelectItem, depth: depth }, node.id))) }));
}
function HierarchyNode({ node, em, selectedItem, onSelectItem, depth, }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children.length > 0;
    const indent = depth * 24;
    // Determine colors based on type
    const getNodeColor = () => {
        switch (node.type) {
            case 'outcome':
                return 'bg-purple-50 border-purple-300 text-purple-900';
            case 'phase':
                return 'bg-blue-50 border-blue-300 text-blue-900';
            case 'action':
                return 'bg-green-50 border-green-300 text-green-900';
            case 'task':
                return 'bg-yellow-50 border-yellow-300 text-yellow-900';
            case 'em-action':
                return 'bg-orange-50 border-orange-300 text-orange-900';
            default:
                return 'bg-gray-50 border-gray-300 text-gray-900';
        }
    };
    const isSelected = selectedItem?.type === 'action' && node.type === 'em-action'
        ? selectedItem.item.id === node.id
        : false;
    const handleClick = () => {
        if (node.type === 'em-action') {
            onSelectItem({ type: 'action', item: node.data });
        }
    };
    // Get resources for em-action
    const skills = node.type === 'em-action'
        ? (em.skills || []).filter((s) => s.action_id === node.id)
        : [];
    const knowledge = node.type === 'em-action'
        ? (em.knowledge || []).filter((k) => k.action_id === node.id)
        : [];
    const tools = node.type === 'em-action'
        ? (em.tools || []).filter((t) => t.action_id === node.id)
        : [];
    return (_jsxs("div", { style: { marginLeft: `${indent}px` }, children: [_jsxs("div", { className: `flex items-center gap-2 rounded border-2 p-3 ${isSelected ? 'border-blue-500 bg-blue-50' : getNodeColor()} ${node.type === 'em-action' ? 'cursor-pointer hover:shadow' : ''}`, onClick: handleClick, children: [hasChildren && (_jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }, className: "text-gray-600 hover:text-gray-900", children: isExpanded ? '▼' : '▶' })), !hasChildren && _jsx("span", { className: "w-4" }), _jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs font-semibold uppercase text-gray-500", children: node.type }), _jsx("span", { className: "font-medium", children: node.name })] }) })] }), node.type === 'em-action' && (skills.length > 0 || knowledge.length > 0 || tools.length > 0) && (_jsxs("div", { className: "ml-8 mt-2 space-y-2", children: [skills.map((skill) => (_jsxs("button", { onClick: () => onSelectItem({ type: 'skill', item: skill }), className: `block w-full rounded border p-2 text-left text-sm ${selectedItem?.type === 'skill' && selectedItem.item.id === skill.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-green-200 bg-green-50 hover:bg-green-100'}`, children: [_jsx("span", { className: "font-medium", children: "\uD83D\uDCDA Skill:" }), " ", skill.name] }, skill.id))), knowledge.map((k) => (_jsxs("button", { onClick: () => onSelectItem({ type: 'knowledge', item: k }), className: `block w-full rounded border p-2 text-left text-sm ${selectedItem?.type === 'knowledge' && selectedItem.item.id === k.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100'}`, children: [_jsx("span", { className: "font-medium", children: "\uD83D\uDCD6 Knowledge:" }), " ", k.name] }, k.id))), tools.map((tool) => (_jsxs("button", { onClick: () => onSelectItem({ type: 'tool', item: tool }), className: `block w-full rounded border p-2 text-left text-sm ${selectedItem?.type === 'tool' && selectedItem.item.id === tool.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`, children: [_jsx("span", { className: "font-medium", children: "\uD83D\uDD27 Tool:" }), " ", tool.name] }, tool.id)))] })), isExpanded && hasChildren && (_jsx("div", { className: "mt-2", children: _jsx(HierarchyTree, { nodes: node.children, em: em, selectedItem: selectedItem, onSelectItem: onSelectItem, depth: depth + 1 }) }))] }));
}
