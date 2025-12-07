'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@onecoach/lib-design-system';
export const CatalogGrid = ({ children, className, isLoading, emptyState, viewMode = 'grid', }) => {
    if (isLoading) {
        if (viewMode === 'list') {
            return (_jsx("div", { className: cn('flex flex-col gap-4', className), children: [...Array(8)].map((_, i) => (_jsx("div", { className: "h-24 w-full animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" }, i))) }));
        }
        return (_jsx("div", { className: cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className), children: [...Array(8)].map((_, i) => (_jsx("div", { className: "aspect-[4/5] w-full animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" }, i))) }));
    }
    if (React.Children.count(children) === 0 && emptyState) {
        return _jsx("div", { className: "flex h-[60vh] w-full items-center justify-center", children: emptyState });
    }
    if (viewMode === 'list') {
        return _jsx("div", { className: cn('flex flex-col gap-4', className), children: children });
    }
    return (_jsx("div", { className: cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className), children: children }));
};
