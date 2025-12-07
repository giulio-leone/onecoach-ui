/**
 * Conversation Component
 *
 * Container per la lista messaggi con scroll automatico.
 * Ispirato ad AI Elements Conversation.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export const Conversation = forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('relative flex h-full flex-col overflow-hidden', className), ...props, children: children })));
Conversation.displayName = 'Conversation';
export const ConversationContent = forwardRef(({ className, children, ...props }, ref) => {
    const innerRef = useRef(null);
    const endRef = useRef(null);
    // Auto-scroll to bottom on new content
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [children]);
    return (_jsx("div", { ref: ref || innerRef, className: cn('scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200', 'dark:scrollbar-thumb-white/10', 'flex-1 overflow-y-auto px-4 py-6 lg:px-8', className), ...props, children: _jsxs("div", { className: "mx-auto flex max-w-3xl flex-col gap-6", children: [_jsx(AnimatePresence, { mode: "popLayout", children: children }), _jsx("div", { ref: endRef, className: "h-4", "aria-hidden": true })] }) }));
});
ConversationContent.displayName = 'ConversationContent';
export function ConversationEmptyState({ icon, title = 'Come posso aiutarti oggi?', description = 'Sono il tuo AI Coach personale. Chiedimi piani di allenamento, consigli nutrizionali o analizza i tuoi progressi.', className, }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: cn('flex flex-col items-center justify-center py-20 text-center', className), children: [_jsx("div", { className: "mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20", children: icon || _jsx(MessageSquare, { className: "h-10 w-10 text-white" }) }), _jsx("h2", { className: "mb-2 text-2xl font-bold text-neutral-900 dark:text-white", children: title }), _jsx("p", { className: "max-w-md text-neutral-500 dark:text-neutral-400", children: description })] }));
}
export function ConversationScrollButton({ onClick, show = false, className, }) {
    if (!show)
        return null;
    return (_jsxs(motion.button, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, onClick: onClick, className: cn('absolute bottom-20 left-1/2 -translate-x-1/2', 'flex items-center gap-2 rounded-full', 'bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm', 'dark:bg-neutral-800/90', 'text-sm font-medium text-neutral-700 dark:text-neutral-200', 'hover:bg-white dark:hover:bg-neutral-700', 'transition-colors', className), children: [_jsx(ChevronDown, { className: "h-4 w-4" }), "Nuovi messaggi"] }));
}
