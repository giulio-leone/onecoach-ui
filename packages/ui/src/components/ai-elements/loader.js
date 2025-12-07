/**
 * Loader Component
 *
 * Streaming indicators for AI response loading states.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@onecoach/lib-design-system';
export const StreamingDots = forwardRef(({ size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
        sm: 'h-1 w-1',
        md: 'h-1.5 w-1.5',
        lg: 'h-2 w-2',
    };
    return (_jsx("div", { ref: ref, className: cn('flex items-center gap-1', className), role: "status", "aria-label": "Caricamento...", ...props, children: [0, 1, 2].map((i) => (_jsx("span", { className: cn(sizeClasses[size], 'animate-bounce rounded-full bg-current'), style: { animationDelay: `${i * 150}ms` } }, i))) }));
});
StreamingDots.displayName = 'StreamingDots';
export const TypingIndicator = forwardRef(({ label = 'Sta scrivendo...', className, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn('flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400', className), role: "status", ...props, children: [_jsx(StreamingDots, { size: "sm" }), _jsx("span", { children: label })] })));
TypingIndicator.displayName = 'TypingIndicator';
export const MessageLoader = forwardRef(({ lines = 3, className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('animate-pulse space-y-2', className), role: "status", "aria-label": "Caricamento messaggio...", ...props, children: Array.from({ length: lines }).map((_, i) => (_jsx("div", { className: cn('h-4 rounded bg-neutral-200 dark:bg-neutral-700', i === lines - 1 && 'w-3/4') }, i))) })));
MessageLoader.displayName = 'MessageLoader';
export const AIElementSpinner = forwardRef(({ size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };
    return (_jsxs("svg", { ref: ref, className: cn('animate-spin', sizeClasses[size], className), xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", role: "status", "aria-label": "Caricamento...", ...props, children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }));
});
AIElementSpinner.displayName = 'AIElementSpinner';
export function AIThinking({ message = 'Sto elaborando...', className, ...props }) {
    return (_jsxs("div", { className: cn('flex items-center gap-3 rounded-xl px-4 py-3', 'bg-neutral-100 dark:bg-neutral-800', 'text-neutral-600 dark:text-neutral-300', className), role: "status", ...props, children: [_jsxs("div", { className: "relative", children: [_jsx("span", { className: "text-xl", children: "\uD83E\uDDE0" }), _jsx("span", { className: "absolute inset-0 animate-ping text-xl opacity-50", children: "\uD83E\uDDE0" })] }), _jsx("span", { className: "text-sm", children: message }), _jsx(StreamingDots, { size: "sm", className: "ml-auto text-neutral-400" })] }));
}
export function ToolExecuting({ toolName, className, ...props }) {
    return (_jsxs("div", { className: cn('flex items-center gap-2 rounded-lg px-3 py-2', 'border border-blue-200 bg-blue-50', 'dark:border-blue-800 dark:bg-blue-900/30', className), role: "status", ...props, children: [_jsx(AIElementSpinner, { size: "sm", className: "text-blue-500" }), _jsx("span", { className: "text-xs text-blue-700 dark:text-blue-300", children: toolName ? `Eseguendo ${toolName}...` : 'Eseguendo strumento...' })] }));
}
