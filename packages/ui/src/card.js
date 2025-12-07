import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Card Component
 *
 * Mobile-first, responsive card with design tokens
 * Deep dark mode optimized
 */
import React from 'react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';
const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
};
export const Card = ({ variant = 'default', padding = 'md', children, className = '', ...props }) => {
    const variantStyles = {
        default: cn(darkModeClasses.card.base, 'rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800'),
        elevated: cn(darkModeClasses.card.elevated, 'rounded-2xl shadow-xl shadow-neutral-900/5 dark:shadow-neutral-900/20 border border-neutral-100 dark:border-neutral-700'),
        bordered: cn(darkModeClasses.card.base, 'rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700'),
        interactive: cn(darkModeClasses.card.interactive, 'rounded-2xl border border-transparent hover:border-primary-500/20 dark:hover:border-primary-400/20 transition-all duration-300 cursor-pointer'),
        glass: cn('glass', 'rounded-2xl shadow-lg shadow-neutral-900/5'),
        'glass-strong': cn('glass-strong', 'rounded-2xl shadow-xl shadow-neutral-900/10'),
        hover: cn(darkModeClasses.card.interactive, 'rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300'),
    };
    return (_jsx("div", { className: cn(variantStyles[variant], paddingStyles[padding], className), ...props, children: children }));
};
// Structural subcomponents (shadcn-like API)
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex flex-col space-y-1.5 p-6', className), "data-slot": "card-header", ...props })));
CardHeader.displayName = 'CardHeader';
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (_jsx("h3", { ref: ref, className: cn('text-lg leading-none font-semibold tracking-tight', className), "data-slot": "card-title", ...props })));
CardTitle.displayName = 'CardTitle';
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (_jsx("p", { ref: ref, className: cn('text-sm text-neutral-600 dark:text-neutral-400', className), "data-slot": "card-description", ...props })));
CardDescription.displayName = 'CardDescription';
const CardContent = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('p-6 pt-0', className), "data-slot": "card-content", ...props })));
CardContent.displayName = 'CardContent';
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex items-center p-6 pt-0', className), "data-slot": "card-footer", ...props })));
CardFooter.displayName = 'CardFooter';
// Simple action row aligned to the right, for headers/toolbars
const CardAction = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('ml-auto flex items-center gap-2', className), "data-slot": "card-action", ...props })));
CardAction.displayName = 'CardAction';
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction };
