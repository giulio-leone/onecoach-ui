'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Play } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export function ProgramDayCard({ dayNumber, name, notes, children, onTrack, trackLabel = 'Inizia Allenamento', variant = 'workout', className = '', }) {
    const isWorkout = variant === 'workout';
    const trackColor = isWorkout
        ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
        : 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800';
    return (_jsxs("div", { className: cn('rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/50', className), children: [_jsx("div", { className: "mb-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-neutral-100", children: name || `Giorno ${dayNumber}` }), notes && (_jsx("p", { className: "mt-2 text-sm text-neutral-600 dark:text-neutral-400", children: notes }))] }), onTrack && (_jsxs("button", { onClick: onTrack, className: cn('ml-4 flex min-h-[44px] touch-manipulation items-center gap-2 rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]', trackColor), "aria-label": trackLabel, children: [_jsx(Play, { className: "h-4 w-4" }), trackLabel] }))] }) }), children] }));
}
