'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@onecoach/lib-design-system';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { TaskList } from './task-list';
import { ProgressBar } from './progress-bar';
export function MilestoneItem({ title, progress, tasks, className }) {
    const [isExpanded, setIsExpanded] = useState(true);
    return (_jsxs("div", { className: cn('overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50', className), children: [_jsxs("div", { className: "flex cursor-pointer items-center gap-3 p-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/50", onClick: () => setIsExpanded(!isExpanded), children: [_jsx("button", { className: "text-slate-400 transition-transform duration-200", children: isExpanded ? _jsx(ChevronDown, { className: "h-5 w-5" }) : _jsx(ChevronRight, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "font-semibold text-slate-900 dark:text-white", children: title }), _jsxs("span", { className: "text-xs font-medium text-slate-500 dark:text-slate-400", children: [Math.round(progress), "%"] })] }), _jsx(ProgressBar, { value: progress, size: "sm", className: "mt-2" })] })] }), isExpanded && (_jsx("div", { className: "border-t border-slate-200 px-4 py-3 dark:border-slate-800", children: _jsx(TaskList, { tasks: tasks }) }))] }));
}
export function MilestoneList({ milestones, className }) {
    return (_jsx("div", { className: cn('space-y-4', className), children: milestones.map((milestone) => (_jsx(MilestoneItem, { ...milestone }, milestone.id))) }));
}
