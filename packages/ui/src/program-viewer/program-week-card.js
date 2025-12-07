'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@onecoach/lib-design-system';
export function ProgramWeekCard({ weekNumber, focus, notes, children, className = '', }) {
    return (_jsxs("div", { className: cn('overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900', className), children: [_jsxs("div", { className: "mb-6", children: [_jsxs("h2", { className: "text-xl font-bold text-neutral-900 dark:text-neutral-100", children: ["Settimana ", weekNumber] }), focus && _jsxs("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: ["Focus: ", focus] }), notes && _jsx("p", { className: "mt-2 text-sm text-neutral-500 dark:text-neutral-500", children: notes })] }), children] }));
}
