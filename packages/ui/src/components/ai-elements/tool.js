/**
 * Tool Component
 *
 * Visualizzazione di tool invocations (AI SDK v6).
 * Mostra stato, input, output con collapsible.
 * Uses CSS grid animation (no framer-motion for React 19 compatibility)
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, forwardRef } from 'react';
import { Wrench, ChevronDown, CheckCircle, XCircle, Clock, Circle } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export const Tool = forwardRef(({ defaultOpen = false, className, children, ...props }, ref) => {
    return (_jsx("div", { ref: ref, className: cn('rounded-lg border border-neutral-200 bg-neutral-50', 'dark:border-neutral-700 dark:bg-neutral-800/50', 'overflow-hidden', className), "data-state": defaultOpen ? 'open' : 'closed', ...props, children: children }));
});
Tool.displayName = 'Tool';
const stateConfig = {
    'input-streaming': {
        label: 'In attesa',
        icon: _jsx(Circle, { className: "h-4 w-4" }),
        color: 'text-neutral-500',
    },
    'input-available': {
        label: 'In esecuzione',
        icon: _jsx(Clock, { className: "h-4 w-4 animate-pulse" }),
        color: 'text-amber-500',
    },
    'approval-requested': {
        label: 'Richiede approvazione',
        icon: _jsx(Clock, { className: "h-4 w-4" }),
        color: 'text-yellow-600',
    },
    'approval-responded': {
        label: 'Risposto',
        icon: _jsx(CheckCircle, { className: "h-4 w-4" }),
        color: 'text-blue-600',
    },
    'output-available': {
        label: 'Completato',
        icon: _jsx(CheckCircle, { className: "h-4 w-4" }),
        color: 'text-emerald-500',
    },
    'output-error': {
        label: 'Errore',
        icon: _jsx(XCircle, { className: "h-4 w-4" }),
        color: 'text-red-500',
    },
    'output-denied': {
        label: 'Negato',
        icon: _jsx(XCircle, { className: "h-4 w-4" }),
        color: 'text-orange-600',
    },
};
export const ToolHeader = forwardRef(({ title, toolType, state, className, onClick, ...props }, ref) => {
    const config = stateConfig[state] || stateConfig['input-streaming'];
    const displayName = title || toolType?.replace('tool-', '').replace(/_/g, ' ') || 'Tool';
    // Format tool name for display
    const formattedName = displayName
        .replace(/^food_/, '🍎 ')
        .replace(/^exercise_/, '💪 ')
        .replace(/^workout_/, '🏋️ ')
        .replace(/^nutrition_/, '🥗 ')
        .replace(/^oneagenda_/, '📅 ');
    return (_jsxs("button", { ref: ref, type: "button", onClick: onClick, className: cn('flex w-full items-center justify-between px-3 py-2', 'text-left transition-colors', 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50', className), ...props, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Wrench, { className: "h-4 w-4 text-indigo-500" }), _jsx("span", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-200", children: formattedName })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: cn('flex items-center gap-1.5 text-xs', config.color), children: [config.icon, config.label] }), _jsx(ChevronDown, { className: "h-4 w-4 text-neutral-400 transition-transform group-data-[state=open]:rotate-180" })] })] }));
});
ToolHeader.displayName = 'ToolHeader';
export const ToolContent = forwardRef(({ isOpen = true, className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('grid transition-all duration-200', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0', className), ...props, children: _jsx("div", { className: "overflow-hidden", children: _jsx("div", { className: "border-t border-neutral-200 px-3 py-2 dark:border-neutral-700", children: children }) }) })));
ToolContent.displayName = 'ToolContent';
export const ToolInputDisplay = forwardRef(({ input, className, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn('mb-2', className), ...props, children: [_jsx("span", { className: "text-xs font-medium text-neutral-500 dark:text-neutral-400", children: "Input:" }), _jsx("pre", { className: "mt-1 overflow-x-auto rounded bg-neutral-100 p-2 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300", children: JSON.stringify(input, null, 2) })] })));
ToolInputDisplay.displayName = 'ToolInputDisplay';
export const ToolOutputDisplay = forwardRef(({ output, errorText, className, ...props }, ref) => {
    if (!output && !errorText)
        return null;
    const formatOutput = (data) => {
        if (data === undefined || data === null)
            return '';
        if (typeof data === 'string')
            return data;
        try {
            return JSON.stringify(data, null, 2);
        }
        catch {
            return String(data);
        }
    };
    return (_jsxs("div", { ref: ref, className: cn('', className), ...props, children: [_jsx("span", { className: "text-xs font-medium text-neutral-500 dark:text-neutral-400", children: errorText ? 'Errore:' : 'Output:' }), _jsx("pre", { className: cn('mt-1 overflow-x-auto rounded p-2 text-xs', errorText
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'), children: errorText || formatOutput(output) })] }));
});
ToolOutputDisplay.displayName = 'ToolOutputDisplay';
export function ToolBubble({ toolName, state, args, result }) {
    const [isExpanded, setIsExpanded] = useState(false);
    // Map legacy states to new format
    const mappedState = state === 'pending'
        ? 'input-available'
        : state === 'result'
            ? 'output-available'
            : state === 'error'
                ? 'output-error'
                : state;
    const config = stateConfig[mappedState] || stateConfig['input-streaming'];
    // Format tool name
    const displayName = toolName
        .replace(/_/g, ' ')
        .replace(/^food /, '🍎 ')
        .replace(/^exercise /, '💪 ')
        .replace(/^workout /, '🏋️ ')
        .replace(/^nutrition /, '🥗 ')
        .replace(/^oneagenda /, '📅 ');
    return (_jsxs("div", { className: "rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50", children: [_jsxs("button", { onClick: () => setIsExpanded(!isExpanded), className: "flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700/50", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Wrench, { className: "h-4 w-4 text-indigo-500" }), _jsx("span", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-200", children: displayName })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: cn('flex items-center gap-1.5 text-xs', config.color), children: [config.icon, config.label] }), _jsx(ChevronDown, { className: cn('h-4 w-4 text-neutral-400 transition-transform', isExpanded && 'rotate-180') })] })] }), _jsx("div", { className: cn('grid transition-all duration-200', isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'), children: _jsx("div", { className: "overflow-hidden", children: _jsxs("div", { className: "border-t border-neutral-200 px-3 py-2 dark:border-neutral-700", children: [args && Object.keys(args).length > 0 && _jsx(ToolInputDisplay, { input: args }), (mappedState === 'output-available' || mappedState === 'output-error') && (_jsx(ToolOutputDisplay, { output: result, errorText: mappedState === 'output-error' ? String(result) : undefined }))] }) }) })] }));
}
