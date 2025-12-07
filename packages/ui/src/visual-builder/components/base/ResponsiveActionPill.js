import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@OneCoach/lib-design-system';
const variantClasses = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30',
    emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30',
    red: 'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20', // Red is usually ghost/icon-only in this context
    neutral: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
};
export function ResponsiveActionPill({ label, icon, onClick, variant = 'blue', className, showLabelOnMobile = false, title, isIconOnly = false, }) {
    // Special handling for red/icon-only variant to match existing design
    if (isIconOnly) {
        return (_jsx("button", { onClick: onClick, className: cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors', variantClasses[variant], className), title: title || label, children: _jsx("span", { className: "flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4", children: icon }) }));
    }
    return (_jsxs("button", { onClick: onClick, className: cn('flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm', variantClasses[variant], className), title: title || label, children: [_jsx("span", { className: "flex items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4", children: icon }), _jsx("span", { className: cn('truncate', !showLabelOnMobile && 'hidden md:inline'), children: label })] }));
}
