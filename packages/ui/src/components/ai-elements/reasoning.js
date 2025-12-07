/**
 * Reasoning Component
 *
 * Collapsible per chain-of-thought / reasoning AI.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, forwardRef } from 'react';
import { Brain, ChevronDown } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export const Reasoning = forwardRef(({ isStreaming = false, duration, className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('w-full rounded-lg border border-neutral-200 bg-neutral-50', 'dark:border-neutral-700 dark:bg-neutral-800/30', className), "data-streaming": isStreaming, ...props, children: children })));
Reasoning.displayName = 'Reasoning';
export const ReasoningTrigger = forwardRef(({ duration, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    return (_jsxs("button", { ref: ref, type: "button", onClick: () => setIsOpen(!isOpen), className: cn('flex w-full items-center justify-between px-3 py-2', 'text-left transition-colors', 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50', className), "data-state": isOpen ? 'open' : 'closed', ...props, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "h-4 w-4 text-purple-500" }), _jsx("span", { className: "text-xs font-medium text-neutral-600 dark:text-neutral-300", children: "\uD83D\uDCAD Ragionamento AI" }), duration && (_jsxs("span", { className: "text-xs text-neutral-400", children: ["(", Math.round(duration / 1000), "s)"] }))] }), _jsx(ChevronDown, { className: cn('h-4 w-4 text-neutral-400 transition-transform', isOpen && 'rotate-180') })] }));
});
ReasoningTrigger.displayName = 'ReasoningTrigger';
export const ReasoningContent = forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('grid transition-all duration-200 ease-out', 'grid-rows-[1fr] opacity-100', 'data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0', className), ...props, children: _jsx("div", { className: "overflow-hidden", children: _jsx("div", { className: "border-t border-neutral-200 px-3 py-2 dark:border-neutral-700", children: _jsx("p", { className: "text-xs leading-relaxed text-neutral-600 italic dark:text-neutral-300", children: children }) }) }) })));
ReasoningContent.displayName = 'ReasoningContent';
export function ReasoningBubble({ text, isStreaming }) {
    const [isOpen, setIsOpen] = useState(false);
    return (_jsxs("div", { className: "mb-3 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/30", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700/50", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Brain, { className: cn('h-4 w-4 text-purple-500', isStreaming && 'animate-pulse') }), _jsx("span", { className: "text-xs font-medium text-neutral-600 dark:text-neutral-300", children: "\uD83D\uDCAD Ragionamento AI" }), isStreaming && (_jsx("span", { className: "animate-pulse text-xs text-purple-500", children: "in corso..." }))] }), _jsx(ChevronDown, { className: cn('h-4 w-4 text-neutral-400 transition-transform', isOpen && 'rotate-180') })] }), _jsx("div", { className: cn('grid transition-all duration-200 ease-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'), children: _jsx("div", { className: "overflow-hidden", children: _jsx("div", { className: "border-t border-neutral-200 dark:border-neutral-700", children: _jsx("p", { className: "px-3 py-2 text-xs leading-relaxed text-neutral-600 italic dark:text-neutral-300", children: text }) }) }) })] }));
}
