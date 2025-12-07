/**
 * IconBadge Component
 *
 * Reusable icon badge with optimized dark mode styling.
 * Used for transaction icons, status indicators, etc.
 */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@OneCoach/lib-design-system';
const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
};
const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
};
const variantClasses = {
    success: 'bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    error: 'bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
    warning: 'bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
    info: 'bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    neutral: 'bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400',
    purple: 'bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
};
export function IconBadge({ icon: Icon, variant = 'neutral', size = 'md', className, }) {
    return (_jsx("div", { className: cn('flex flex-shrink-0 items-center justify-center rounded-full', sizeClasses[size], variantClasses[variant], className), children: _jsx(Icon, { className: iconSizeClasses[size] }) }));
}
