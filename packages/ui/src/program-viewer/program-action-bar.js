'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowLeft, Play, Trash2 } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
export function ProgramActionBar({ onBack, onTrack, onDelete, trackLabel = 'Track Today', deleteLabel = 'Elimina Programma', variant = 'workout', className = '', }) {
    const isWorkout = variant === 'workout';
    const trackColor = isWorkout
        ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
        : 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800';
    return (_jsxs("div", { className: cn('mb-6 flex items-center justify-between', className), children: [_jsxs("button", { onClick: onBack, className: "flex min-h-[44px] touch-manipulation items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 hover:shadow-sm active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800/50 dark:bg-neutral-900 dark:text-neutral-300", "aria-label": "Torna indietro", children: [_jsx(ArrowLeft, { className: "h-5 w-5" }), "Indietro"] }), _jsxs("div", { className: "flex items-center gap-3", children: [onTrack && (_jsxs("button", { onClick: onTrack, className: cn('flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl bg-gradient-to-r px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98]', trackColor), "aria-label": trackLabel, children: [_jsx(Play, { className: "h-4 w-4" }), trackLabel] })), onDelete && (_jsxs("button", { onClick: onDelete, className: "flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-all duration-200 hover:bg-red-100 hover:shadow-sm active:scale-[0.98] dark:border-red-700/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50", "aria-label": deleteLabel, children: [_jsx(Trash2, { className: "h-4 w-4" }), deleteLabel] }))] })] }));
}
