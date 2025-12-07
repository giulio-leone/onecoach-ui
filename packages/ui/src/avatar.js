import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@OneCoach/lib-design-system';
const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-24 w-24 text-xl',
};
export function Avatar({ src, alt, fallback, size = 'md', bordered = false, className, ...props }) {
    const [imageError, setImageError] = React.useState(false);
    return (_jsx("div", { className: cn('relative inline-flex shrink-0 overflow-hidden rounded-full', sizeClasses[size], bordered &&
            'ring-2 ring-indigo-500 ring-offset-2 dark:ring-indigo-400 dark:ring-offset-neutral-900', className), ...props, children: src && !imageError ? (_jsx("img", { src: src, alt: alt || fallback, className: "h-full w-full object-cover", onError: () => setImageError(true) })) : (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-neutral-100 font-medium text-neutral-600 uppercase dark:bg-neutral-800 dark:text-neutral-300", children: fallback.slice(0, 2) })) }));
}
