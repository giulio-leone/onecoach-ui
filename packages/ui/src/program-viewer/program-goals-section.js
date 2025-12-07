'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Target } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export function ProgramGoalsSection({ goals, variant = 'workout', className = '', }) {
    if (goals.length === 0)
        return null;
    const isWorkout = variant === 'workout';
    const badgeColor = isWorkout
        ? 'border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60'
        : 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60';
    return (_jsxs("div", { className: cn('mb-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900', className), children: [_jsxs("div", { className: "mb-3 flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5 text-neutral-700 dark:text-neutral-300" }), _jsx("h2", { className: "text-lg font-semibold text-neutral-900 dark:text-neutral-100", children: "Obiettivi" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: goals.map((goal, idx) => (_jsx("span", { className: cn('hover:bg-opacity-80 rounded-full border px-3 py-1 text-sm font-medium shadow-sm transition-all duration-200', badgeColor), children: goal }, idx))) })] }));
}
