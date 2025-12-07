import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@OneCoach/lib-design-system';
import { Container, Stack } from '../layout';
/**
 * AdminPage - wrapper con background e contenitore coerente tra pagine admin.
 */
export function AdminPage({ children, className, gradient = true, maxWidth = '7xl', padding = 'md', }) {
    return (_jsxs("div", { className: cn('min-h-screen bg-neutral-50/50 dark:bg-neutral-950', className), children: [gradient && (_jsxs("div", { className: "pointer-events-none fixed inset-0 z-0 overflow-hidden", children: [_jsx("div", { className: "absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" }), _jsx("div", { className: "absolute top-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-[100px] dark:bg-purple-500/5" })] })), _jsx("div", { className: "relative z-10", children: _jsx(Container, { maxWidth: maxWidth, padding: padding, children: _jsx(Stack, { spacing: "xl", children: children }) }) })] }));
}
/**
 * AdminSection - sezione con titolo/azioni opzionali e spaziatura standard.
 */
export function AdminSection({ title, description, actions, children, className, }) {
    return (_jsxs("section", { className: cn('space-y-4', className), children: [(title || description || actions) && (_jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [title && (_jsx("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-white", children: title })), description && (_jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: description }))] }), actions && _jsx("div", { className: "flex flex-wrap items-center gap-2", children: actions })] })), children] }));
}
/**
 * AdminPageContent - wrapper per blocchi principali (e.g., card/griglie).
 */
export function AdminPageContent({ className, children, }) {
    return _jsx("div", { className: cn('space-y-8', className), children: children });
}
