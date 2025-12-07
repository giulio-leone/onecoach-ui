/**
 * GlassCard Component - Web Optimized
 *
 * Modern glassmorphism card with advanced effects for web platform.
 * Matches the design system of the native counterpart but using native DOM elements.
 */
'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { forwardRef } from 'react';
import { cn } from '@OneCoach/lib-design-system';
const GlassCardComponent = forwardRef(({ className, intensity = 'medium', variant = 'default', gradient = false, children, ...props }, ref) => {
    const intensityClasses = {
        light: 'bg-gradient-to-br from-white/40 to-white/10 dark:from-neutral-900/40 dark:to-neutral-900/10 backdrop-blur-md ring-1 ring-white/20 dark:ring-white/10',
        medium: 'bg-gradient-to-br from-white/50 to-white/20 dark:from-neutral-900/50 dark:to-neutral-900/20 backdrop-blur-xl ring-1 ring-white/20 dark:ring-white/10',
        heavy: 'bg-gradient-to-br from-white/70 to-white/40 dark:from-neutral-900/70 dark:to-neutral-900/40 backdrop-blur-2xl ring-1 ring-white/20 dark:ring-white/10',
    };
    const variantClasses = {
        default: 'border-neutral-200 dark:border-neutral-800',
        active: 'border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-900/20 dark:border-indigo-400/50',
        error: 'border-rose-500/50 bg-rose-50/30 dark:bg-rose-900/20 dark:border-rose-400/50',
        success: 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-900/20 dark:border-emerald-400/50',
    };
    return (_jsxs("div", { ref: ref, className: cn('group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300', intensityClasses[intensity], 
        // Use variant border unless gradient is active (gradient overrides border style usually)
        !gradient && variantClasses[variant], 
        // Gradient border/bg logic
        gradient && 'border-transparent', 
        // Hover effects matching StatCard/QuickActionsGrid
        'hover:-translate-y-1 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:border-neutral-700 dark:hover:shadow-neutral-900/50', className), ...props, children: [gradient && (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10" }), _jsx("div", { className: "absolute inset-0 -z-20 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100", "aria-hidden": "true" })] })), children] }));
});
GlassCardComponent.displayName = 'GlassCard';
export { GlassCardComponent as GlassCard };
