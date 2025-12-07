'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import Link from 'next/link';
import { cn } from '@OneCoach/lib-design-system';
import { ArrowUpRight } from 'lucide-react';
export function QuickActionsGrid({ actions, className }) {
    return (_jsx("div", { className: cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className), children: actions.map((action) => {
            const Icon = typeof action.icon !== 'string' ? action.icon : null;
            // Default gradient if none provided
            const colorClass = action.color || 'from-indigo-500 to-purple-500';
            return (_jsx(Link, { href: action.href, className: "group block h-full outline-none", children: _jsxs("div", { className: cn('relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-300', 
                    // Glassmorphism Base
                    'bg-white/40 backdrop-blur-md dark:bg-neutral-900/40', 'border-white/40 dark:border-white/5', 
                    // Hover State
                    'hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20', 'group-focus-visible:ring-2 group-focus-visible:ring-indigo-500'), children: [_jsx("div", { className: cn('absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-20', `bg-gradient-to-br ${colorClass}`) }), _jsxs("div", { className: "relative z-10 flex items-start justify-between gap-4", children: [_jsx("div", { className: cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110', `bg-gradient-to-br ${colorClass} text-white shadow-lg shadow-indigo-500/20`), children: Icon ? (_jsx(Icon, { className: "h-6 w-6" })) : (_jsx("span", { className: "text-xl", children: action.icon })) }), _jsx("div", { className: cn('flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100', 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'), children: _jsx(ArrowUpRight, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "relative z-10 mt-4", children: [_jsx("h3", { className: "font-bold text-neutral-900 dark:text-white", children: action.label }), _jsx("p", { className: "mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400", children: action.description })] })] }) }, action.id));
        }) }));
}
