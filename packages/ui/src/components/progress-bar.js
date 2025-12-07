'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@OneCoach/lib-design-system';
export function ProgressBar({ value, max = 100, className, color = 'bg-blue-500', showLabel = false, size = 'md', }) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const heights = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };
    return (_jsxs("div", { className: cn('w-full', className), children: [showLabel && (_jsxs("div", { className: "mb-1 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [Math.round(percentage), "%"] })] })), _jsx("div", { className: cn('w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800', heights[size]), children: _jsx("div", { className: cn('h-full transition-all duration-500 ease-out', color), style: { width: `${percentage}%` } }) })] }));
}
