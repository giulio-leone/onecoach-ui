import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import clsx from 'clsx';
/**
 * Scheletro leggero riutilizzabile per placeholder di caricamento.
 */
export function Skeleton({ className, style }) {
    return (_jsx("div", { className: clsx('animate-pulse rounded-md bg-neutral-200/80 dark:bg-neutral-800/80', className), style: style }));
}
