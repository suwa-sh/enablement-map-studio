import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function TaskCard({ task, allTasks, cjm, isSelected, isConnectingTarget, onTaskClick, onConnectStart, onConnect, onDisconnect, }) {
    // Get CJM action name if this is a reference
    const cjmAction = task.source_id && cjm
        ? cjm.actions.find((a) => a.id === task.source_id)
        : null;
    const isReadonly = task.readonly || !!cjmAction;
    const handleCardClick = () => {
        if (isConnectingTarget) {
            onConnect(task.id);
        }
        else {
            onTaskClick();
        }
    };
    const connectedTasks = task.link_to || [];
    return (_jsxs("div", { className: "min-w-[250px] flex-shrink-0", children: [_jsxs("button", { onClick: handleCardClick, className: `w-full rounded-lg border-2 p-4 text-left shadow transition-all ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : isReadonly
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-300 bg-white hover:border-blue-300'} ${isConnectingTarget ? 'ring-2 ring-green-400' : ''}`, children: [_jsxs("div", { className: "mb-2", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: task.name }), cjmAction && (_jsxs("p", { className: "mt-1 text-xs text-gray-500", children: ["From CJM: ", cjmAction.name] }))] }), isReadonly && (_jsx("div", { className: "mb-2", children: _jsx("span", { className: "inline-block rounded bg-gray-200 px-2 py-1 text-xs text-gray-600", children: "Read-only" }) })), connectedTasks.length > 0 && (_jsx("div", { className: "mt-2 border-t border-gray-200 pt-2", children: _jsxs("span", { className: "text-xs text-gray-500", children: ["\u2192 ", connectedTasks.length, " connection(s)"] }) })), connectedTasks.length > 0 && (_jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: connectedTasks.map((connectedId) => {
                            const connectedTask = allTasks.find((t) => t.id === connectedId);
                            return (_jsxs("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    onDisconnect(task.id, connectedId);
                                }, className: "inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200", title: "Click to disconnect", children: [connectedTask?.name || connectedId, _jsx("span", { className: "ml-1", children: "\u00D7" })] }, connectedId));
                        }) }))] }), !isReadonly && (_jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    onConnectStart();
                }, className: "mt-2 w-full rounded border border-dashed border-gray-300 bg-gray-50 py-1 text-xs text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600", children: "Connect to..." }))] }));
}
