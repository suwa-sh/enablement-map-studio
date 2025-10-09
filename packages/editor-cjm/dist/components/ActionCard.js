import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Emotion score to color mapping
const getEmotionColor = (score) => {
    if (score >= 2)
        return 'bg-green-100 border-green-400';
    if (score >= 1)
        return 'bg-green-50 border-green-300';
    if (score === 0)
        return 'bg-gray-100 border-gray-300';
    if (score >= -1)
        return 'bg-orange-50 border-orange-300';
    return 'bg-red-100 border-red-400';
};
export function ActionCard({ action, isSelected, onClick }) {
    const colorClass = getEmotionColor(action.emotion_score);
    return (_jsxs("button", { onClick: onClick, className: `w-full rounded-lg border-2 bg-white p-4 text-left shadow transition-all ${isSelected ? 'border-blue-500 shadow-lg' : colorClass}`, children: [_jsx("div", { className: "mb-3", children: _jsx("h3", { className: "font-semibold text-gray-900", children: action.name }) }), action.touchpoints && action.touchpoints.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("h4", { className: "text-xs font-medium uppercase text-gray-500", children: "Touchpoints" }), _jsx("ul", { className: "mt-1 space-y-1 text-sm text-gray-700", children: action.touchpoints.map((tp, idx) => (_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-1", children: "\u2022" }), _jsx("span", { children: tp })] }, idx))) })] })), action.thoughts_feelings && action.thoughts_feelings.length > 0 && (_jsxs("div", { className: "mb-2", children: [_jsx("h4", { className: "text-xs font-medium uppercase text-gray-500", children: "Thoughts & Feelings" }), _jsx("ul", { className: "mt-1 space-y-1 text-sm italic text-gray-600", children: action.thoughts_feelings.map((tf, idx) => (_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-1", children: "\uD83D\uDCAD" }), _jsx("span", { children: tf })] }, idx))) })] })), _jsxs("div", { className: "mt-3 flex items-center justify-between border-t border-gray-200 pt-2", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Emotion Score" }), _jsx("span", { className: "font-semibold text-gray-900", children: action.emotion_score })] })] }));
}
