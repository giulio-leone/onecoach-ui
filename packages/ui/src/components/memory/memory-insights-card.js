/**
 * Memory Insights Card
 *
 * Displays AI-generated insights and patterns.
 * KISS: Simple card component
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '../../card';
import { cn } from '@OneCoach/lib-design-system';
export function MemoryInsightsCard({ patterns = [], insights = [], className, }) {
    if (patterns.length === 0 && insights.length === 0) {
        return null;
    }
    return (_jsxs(Card, { variant: "glass", padding: "md", className: cn('space-y-6', className), children: [patterns.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "mb-4 text-lg font-semibold text-neutral-900 dark:text-white", children: "Pattern Identificati" }), _jsx("div", { className: "space-y-3", children: patterns.slice(0, 5).map((pattern, index) => (_jsx("div", { className: "rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: pattern.type }), _jsx("p", { className: "mt-1 text-sm text-neutral-600 dark:text-neutral-400", children: pattern.description }), pattern.suggestions && pattern.suggestions.length > 0 && (_jsx("ul", { className: "mt-2 list-disc space-y-1 pl-5 text-xs text-neutral-500 dark:text-neutral-500", children: pattern.suggestions.slice(0, 2).map((suggestion, i) => (_jsx("li", { children: suggestion }, i))) }))] }), _jsxs("div", { className: "ml-4 text-xs text-neutral-500 dark:text-neutral-400", children: [Math.round(pattern.confidence * 100), "%"] })] }) }, index))) })] })), insights.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "mb-4 text-lg font-semibold text-neutral-900 dark:text-white", children: "Insights" }), _jsx("div", { className: "space-y-3", children: insights.slice(0, 3).map((insight, index) => (_jsxs("div", { className: "border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20 rounded-lg border p-4", children: [_jsx("p", { className: "text-primary-600 dark:text-primary-400 text-xs font-medium", children: insight.category }), _jsx("p", { className: "mt-1 text-sm text-neutral-900 dark:text-white", children: insight.insight }), _jsxs("p", { className: "mt-1 text-xs text-neutral-500 dark:text-neutral-400", children: ["Basato su: ", insight.basedOn] })] }, index))) })] }))] }));
}
