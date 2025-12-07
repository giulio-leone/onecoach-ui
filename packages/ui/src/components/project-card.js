'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GlassCard } from '../glass-card';
import { ProgressBar } from './progress-bar';
import { cn } from '@onecoach/lib-design-system';
import { Calendar, MoreVertical, ArrowRight } from 'lucide-react';
import Link from 'next/link';
export function ProjectCard({ id, title, description, status, progress, dueDate, taskCount, completedTaskCount, color = '#3B82F6', className, }) {
    const statusColors = {
        ACTIVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        ARCHIVED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        ON_HOLD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    };
    return (_jsxs(GlassCard, { className: cn('group relative flex flex-col p-5 transition-all', className), children: [_jsxs("div", { className: "mb-4 flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm", style: { backgroundColor: color }, children: title.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-neutral-900 dark:text-white", children: title }), _jsx("span", { className: cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold', statusColors[status]), children: status.replace('_', ' ') })] })] }), _jsx("button", { className: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200", children: _jsx(MoreVertical, { className: "h-5 w-5" }) })] }), description && (_jsx("p", { className: "mb-4 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400", children: description })), _jsxs("div", { className: "mt-auto space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs text-neutral-500 dark:text-neutral-400", children: [_jsxs("span", { children: [completedTaskCount, "/", taskCount, " Tasks"] }), _jsxs("span", { children: [Math.round(progress), "%"] })] }), _jsx(ProgressBar, { value: progress, size: "sm", color: `bg-[${color}]` })] }), _jsxs("div", { className: "flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800", children: [dueDate && (_jsxs("div", { className: "flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400", children: [_jsx(Calendar, { className: "h-3.5 w-3.5" }), _jsx("span", { children: dueDate.toLocaleDateString() })] })), _jsxs(Link, { href: `/projects/${id}`, className: "flex items-center gap-1 text-xs font-bold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400", children: ["View Details ", _jsx(ArrowRight, { className: "h-3.5 w-3.5" })] })] })] })] }));
}
