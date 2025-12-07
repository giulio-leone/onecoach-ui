'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Search, LayoutGrid, List as ListIcon, Plus } from 'lucide-react';
import { GradientButton } from '../../gradient-button';
import { cn } from '@OneCoach/lib-design-system';
export const CatalogHeader = ({ title, description, stats = [], onAdd, addLabel = 'Aggiungi Nuovo', }) => {
    return (_jsxs("div", { className: "mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white", children: title }), description && (_jsx("p", { className: "text-lg text-neutral-500 dark:text-neutral-400", children: description })), stats.length > 0 && (_jsx("div", { className: "flex gap-6 pt-2", children: stats.map((stat) => (_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: "text-2xl font-bold text-neutral-900 dark:text-white", children: stat.value }), _jsx("span", { className: "text-sm font-medium text-neutral-500 dark:text-neutral-400", children: stat.label })] }, stat.label))) }))] }), onAdd && (_jsx(GradientButton, { onClick: onAdd, className: "shrink-0", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Plus, { size: 20 }), _jsx("span", { children: addLabel })] }) }))] }));
};
export const CatalogToolbar = ({ searchQuery, onSearchChange, activeFilters = [], filterOptions = [], onFilterChange, viewMode = 'grid', onViewModeChange, className, }) => {
    return (_jsxs("div", { className: cn('sticky top-0 z-10 mb-8 flex flex-col gap-4 rounded-2xl bg-white/80 p-2 backdrop-blur-xl sm:flex-row sm:items-center dark:bg-neutral-900/80', className), children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400" }), _jsx("input", { type: "text", placeholder: "Cerca nel catalogo...", value: searchQuery, onChange: (e) => onSearchChange(e.target.value), className: "h-12 w-full rounded-xl border-none bg-transparent pr-4 pl-10 text-base outline-none placeholder:text-neutral-400 focus:ring-0" })] }), _jsxs("div", { className: "flex items-center gap-2 px-2 pb-2 sm:pb-0", children: [_jsx("div", { className: "no-scrollbar flex flex-1 gap-2 overflow-x-auto sm:flex-none", children: filterOptions.map((option) => {
                            const isActive = activeFilters.includes(option.value);
                            return (_jsx("button", { type: "button", onClick: () => onFilterChange?.(option.value), className: cn('rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all', isActive
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'), children: option.label }, option.value));
                        }) }), _jsx("div", { className: "h-8 w-px bg-neutral-200 dark:bg-neutral-800" }), _jsxs("div", { className: "flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800", children: [_jsx("button", { type: "button", onClick: () => onViewModeChange?.('grid'), className: cn('rounded-md p-2 transition-all', viewMode === 'grid'
                                    ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                                    : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500'), children: _jsx(LayoutGrid, { size: 18 }) }), _jsx("button", { type: "button", onClick: () => onViewModeChange?.('list'), className: cn('rounded-md p-2 transition-all', viewMode === 'list'
                                    ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                                    : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500'), children: _jsx(ListIcon, { size: 18 }) })] })] })] }));
};
