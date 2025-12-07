import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * CollapsibleSection Component
 *
 * Generic collapsible/expandable section component
 * Used for weeks, days, meals, exercises, etc.
 * Fully optimized for dark mode
 */
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { darkModeClasses, cn } from '@OneCoach/lib-design-system';
export function CollapsibleSection({ title, isExpanded, onToggle, children, headerActions, className = '', headerClassName = '', contentClassName = '', variant = 'default', }) {
    const containerClass = variant === 'card'
        ? cn('rounded-2xl border shadow-sm', darkModeClasses.card.base)
        : variant === 'subtle'
            ? cn('rounded-xl border', darkModeClasses.border.base, darkModeClasses.bg.subtle)
            : '';
    const headerClass = cn('flex items-center justify-between gap-3 border-b p-4 transition-all duration-200 sm:p-5', darkModeClasses.divider.base, variant === 'card' &&
        'bg-gradient-to-r from-neutral-50/40 to-white/80 dark:from-neutral-800/40 dark:to-neutral-800/80 backdrop-blur-sm', darkModeClasses.interactive.hover, headerClassName);
    return (_jsxs("div", { className: cn(containerClass, className), children: [_jsxs("div", { className: headerClass, children: [_jsxs("button", { onClick: onToggle, className: cn('-mx-2 flex min-h-[44px] flex-1 touch-manipulation items-center gap-3 rounded-lg px-2 text-left', darkModeClasses.text.primary, darkModeClasses.interactive.hover, darkModeClasses.interactive.button), children: [isExpanded ? (_jsx(ChevronDown, { className: "h-5 w-5 flex-shrink-0 text-blue-600 transition-transform duration-200 dark:text-blue-400" })) : (_jsx(ChevronRight, { className: "h-5 w-5 flex-shrink-0 text-blue-600 transition-transform duration-200 dark:text-blue-400" })), _jsx("span", { className: "text-base font-semibold sm:text-lg", children: title })] }), headerActions && _jsx("div", { className: "flex items-center gap-2", children: headerActions })] }), isExpanded && (_jsx("div", { className: cn('animate-in fade-in slide-in-from-top-2 space-y-3 p-4 duration-200 sm:p-5', contentClassName), children: children }))] }));
}
