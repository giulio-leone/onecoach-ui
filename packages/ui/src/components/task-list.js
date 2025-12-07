'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@onecoach/lib-design-system';
import { CheckCircle2, Circle, Calendar, Flag } from 'lucide-react';
export function TaskItem({ id, title, status, priority, dueDate, onToggle, className, }) {
    const priorityColors = {
        LOW: 'text-slate-400 dark:text-slate-500',
        MEDIUM: 'text-amber-500',
        HIGH: 'text-red-500',
    };
    return (_jsxs("div", { className: cn('group flex items-center gap-3 rounded-xl border border-transparent bg-white p-3 shadow-sm transition-all hover:border-slate-200 hover:shadow-md dark:bg-slate-900 dark:hover:border-slate-700', status === 'DONE' && 'opacity-60', className), children: [_jsx("button", { onClick: () => onToggle?.(id), className: cn('flex h-6 w-6 items-center justify-center rounded-full transition-colors', status === 'DONE'
                    ? 'text-green-500'
                    : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500'), children: status === 'DONE' ? _jsx(CheckCircle2, { className: "h-6 w-6" }) : _jsx(Circle, { className: "h-6 w-6" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: cn('truncate text-sm font-medium text-slate-900 dark:text-white', status === 'DONE' && 'text-slate-500 line-through dark:text-slate-500'), children: title }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400", children: [dueDate && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-3 w-3" }), _jsx("span", { children: dueDate.toLocaleDateString() })] })), _jsxs("div", { className: cn('flex items-center gap-1', priorityColors[priority]), children: [_jsx(Flag, { className: "h-3 w-3" }), _jsx("span", { className: "capitalize", children: priority.toLowerCase() })] })] })] })] }));
}
export function TaskList({ tasks, onToggleTask, className }) {
    return (_jsx("div", { className: cn('space-y-2', className), children: tasks.map((task) => (_jsx(TaskItem, { ...task, onToggle: onToggleTask }, task.id))) }));
}
