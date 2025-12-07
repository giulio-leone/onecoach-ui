import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const EmptyState = ({ icon: Icon, title, description }) => {
    return (_jsxs("div", { className: "animate-fadeIn mt-20 text-center text-slate-500", children: [_jsx("div", { className: "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50", children: _jsx(Icon, { size: 40, className: "text-slate-400" }) }), _jsx("p", { className: "mb-2 text-xl font-semibold text-slate-700", children: title }), _jsx("p", { className: "text-sm", children: description })] }));
};
