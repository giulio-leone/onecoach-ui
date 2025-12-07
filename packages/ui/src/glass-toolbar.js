'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Search, LayoutGrid, List as ListIcon } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
export const GlassToolbar = ({ searchQuery, onSearchChange, viewMode, onViewModeChange, children, className, startContent, endContent, }) => {
    return (_jsxs("div", { className: cn('sticky top-0 z-10 mb-8 flex flex-col gap-4 rounded-2xl bg-white/80 p-2 backdrop-blur-xl sm:flex-row sm:items-center dark:bg-neutral-900/80', className), children: [startContent, onSearchChange && (_jsxs("div", { className: "relative min-w-[200px] flex-1", children: [_jsx(Search, { className: "absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400" }), _jsx("input", { type: "text", placeholder: "Search...", value: searchQuery, onChange: (e) => onSearchChange(e.target.value), className: "h-10 w-full rounded-xl border-none bg-transparent pr-4 pl-10 text-base outline-none placeholder:text-neutral-400 focus:ring-0" })] })), _jsx("div", { className: "flex flex-1 flex-wrap items-center gap-2 px-2 pb-2 sm:pb-0", children: children }), endContent, viewMode && onViewModeChange && (_jsxs(_Fragment, { children: [_jsx("div", { className: "hidden h-8 w-px bg-neutral-200 sm:block dark:bg-neutral-800" }), _jsxs("div", { className: "flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800", children: [_jsx("button", { type: "button", onClick: () => onViewModeChange('grid'), className: cn('rounded-md p-2 transition-all', viewMode === 'grid'
                                    ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                                    : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500'), children: _jsx(LayoutGrid, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => onViewModeChange('list'), className: cn('rounded-md p-2 transition-all', viewMode === 'list'
                                    ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                                    : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500'), children: _jsx(ListIcon, { size: 18 }) })] })] }))] }));
};
