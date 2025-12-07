import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Admin Card Component
 *
 * Componente riutilizzabile per card nelle pagine admin
 * Supporta varianti glass e default con padding configurabile
 * Principi: KISS, SOLID, DRY
 */
import {} from 'react';
import { cn, darkModeClasses } from '@OneCoach/lib-design-system';
const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
};
const variantClasses = {
    glass: cn('rounded-xl border backdrop-blur-sm', 'bg-white/80 dark:bg-neutral-900/80', 'border-neutral-200/50 dark:border-neutral-800/50', 'shadow-sm'),
    default: cn('rounded-xl border', darkModeClasses.card.base, darkModeClasses.border.base, 'shadow-sm'),
};
export function AdminCard({ title, description, variant = 'default', padding = 'md', className, children, }) {
    return (_jsxs("div", { className: cn(variantClasses[variant], paddingClasses[padding], className), children: [(title || description) && (_jsxs("div", { className: "mb-4 last:mb-0", children: [title && (_jsx("h3", { className: cn('text-lg font-semibold', darkModeClasses.text.primary), children: title })), description && (_jsx("p", { className: cn('mt-1 text-sm', darkModeClasses.text.secondary), children: description }))] })), _jsx("div", { children: children })] }));
}
