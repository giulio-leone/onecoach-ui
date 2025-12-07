/**
 * Message Component
 *
 * Bolla messaggio con supporto completo per AI SDK v6 parts[].
 * Renderizza text, tool-invocation, reasoning, source-url.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Copy, Check, User } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
export const Message = forwardRef(({ from, className, children, ...props }, ref) => {
    const isUser = from === 'user';
    return (_jsxs(motion.div, { ref: ref, initial: { opacity: 0, y: 10, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.3, ease: 'easeOut' }, className: cn('group flex w-full gap-4', isUser ? 'flex-row-reverse' : 'flex-row', isUser ? 'is-user' : 'is-assistant', className), ...props, children: [_jsx("div", { className: "shrink-0 pt-1", children: isUser ? (_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-indigo-600 shadow-sm dark:border-white/10 dark:bg-indigo-900/50 dark:text-indigo-300", children: _jsx(User, { size: 18 }) })) : (_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20", children: _jsx(Bot, { size: 20 }) })) }), _jsx("div", { className: cn('relative max-w-[85%]', isUser ? 'items-end' : 'items-start'), children: children })] }));
});
Message.displayName = 'Message';
export const MessageContent = forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('relative overflow-hidden px-6 py-4 text-sm shadow-sm backdrop-blur-md transition-all', 
    // User styling
    'group-[.is-user]:rounded-2xl group-[.is-user]:rounded-tr-sm', 'group-[.is-user]:bg-indigo-600 group-[.is-user]:text-white', 'group-[.is-user]:shadow-indigo-500/20', 
    // Assistant styling
    'group-[.is-assistant]:rounded-2xl group-[.is-assistant]:rounded-tl-sm', 'group-[.is-assistant]:bg-white/70 group-[.is-assistant]:text-neutral-900', 'group-[.is-assistant]:ring-1 group-[.is-assistant]:ring-neutral-200/50', 'dark:group-[.is-assistant]:bg-neutral-800/60 dark:group-[.is-assistant]:text-neutral-100', 'dark:group-[.is-assistant]:ring-white/10', className), ...props, children: _jsx("div", { className: "flex flex-col gap-3", children: children }) })));
MessageContent.displayName = 'MessageContent';
export const MessageResponse = forwardRef(({ className, children, ...props }, ref) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsxs("div", { ref: ref, className: cn('relative', className), ...props, children: [_jsx("div", { className: cn('prose prose-sm max-w-none leading-relaxed break-words', 'group-[.is-user]:prose-invert', 'group-[.is-assistant]:prose-neutral dark:group-[.is-assistant]:prose-invert'), children: _jsx(ReactMarkdown, { components: {
                        code({ className, children, ...codeProps }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match;
                            if (isInline) {
                                return (_jsx("code", { className: cn('rounded px-1.5 py-0.5 font-mono text-xs font-medium', 'group-[.is-user]:bg-white/20 group-[.is-user]:text-white', 'group-[.is-assistant]:bg-neutral-100 group-[.is-assistant]:text-indigo-600', 'dark:group-[.is-assistant]:bg-white/10 dark:group-[.is-assistant]:text-indigo-300'), ...codeProps, children: children }));
                            }
                            return (_jsxs("div", { className: "relative my-3 overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10", children: [_jsxs("div", { className: "flex items-center justify-between bg-neutral-100 px-3 py-2 text-[10px] text-neutral-500 dark:bg-[#121418] dark:text-neutral-400", children: [_jsx("span", { className: "font-mono font-medium uppercase", children: match[1] }), _jsxs("div", { className: "flex gap-1.5", children: [_jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-red-500/20" }), _jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-yellow-500/20" }), _jsx("div", { className: "h-2.5 w-2.5 rounded-full bg-green-500/20" })] })] }), _jsx(SyntaxHighlighter, { style: vscDarkPlus, language: match[1], PreTag: "div", customStyle: { margin: 0, borderRadius: 0, fontSize: '13px' }, children: String(children).replace(/\n$/, '') })] }));
                        },
                        a: ({ ...linkProps }) => (_jsx("a", { ...linkProps, target: "_blank", rel: "noopener noreferrer", className: cn('font-medium underline underline-offset-2 transition-colors', 'group-[.is-user]:text-white group-[.is-user]:hover:text-white/80', 'group-[.is-assistant]:text-indigo-600 group-[.is-assistant]:hover:text-indigo-500', 'dark:group-[.is-assistant]:text-indigo-400 dark:group-[.is-assistant]:hover:text-indigo-300') })),
                        ul: ({ ...ulProps }) => _jsx("ul", { className: "my-2 list-disc space-y-1 pl-4", ...ulProps }),
                        ol: ({ ...olProps }) => (_jsx("ol", { className: "my-2 list-decimal space-y-1 pl-4", ...olProps })),
                    }, children: children }) }), _jsx("div", { className: "mt-2 flex items-center gap-2 px-1 opacity-0 transition-opacity group-hover:opacity-100", children: _jsxs("button", { onClick: handleCopy, className: cn('flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors', 'group-[.is-user]:bg-white/20 group-[.is-user]:text-white group-[.is-user]:hover:bg-white/30', 'group-[.is-assistant]:bg-neutral-100 group-[.is-assistant]:text-neutral-500', 'group-[.is-assistant]:hover:bg-neutral-200 group-[.is-assistant]:hover:text-neutral-900', 'dark:group-[.is-assistant]:bg-white/5 dark:group-[.is-assistant]:text-neutral-400', 'dark:group-[.is-assistant]:hover:bg-white/10 dark:group-[.is-assistant]:hover:text-white'), children: [copied ? (_jsx(Check, { size: 12, className: "group-[.is-assistant]:text-emerald-500 group-[.is-user]:text-white" })) : (_jsx(Copy, { size: 12 })), copied ? 'Copiato' : 'Copia'] }) })] }));
});
MessageResponse.displayName = 'MessageResponse';
export const MessageActions = forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100', className), ...props, children: children })));
MessageActions.displayName = 'MessageActions';
export const MessageAction = forwardRef(({ label, className, children, ...props }, ref) => (_jsxs("button", { ref: ref, className: cn('flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors', 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900', 'dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white', className), title: label, ...props, children: [children, label && _jsx("span", { className: "sr-only", children: label })] })));
MessageAction.displayName = 'MessageAction';
