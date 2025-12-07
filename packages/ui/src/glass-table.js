'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@onecoach/lib-design-system';
export function GlassTable({ data, columns, onRowClick, keyExtractor, isLoading, emptyState, className, selectedIds, onSelectRow, onSelectAll, isAllSelected, }) {
    if (isLoading) {
        return (_jsx("div", { className: "w-full space-y-4 p-4", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "h-16 w-full animate-pulse rounded-xl bg-white/20 dark:bg-white/5" }, i))) }));
    }
    if (data.length === 0) {
        return emptyState || _jsx("div", { className: "p-8 text-center text-neutral-500", children: "No data available" });
    }
    const isSelectionEnabled = onSelectRow && selectedIds;
    const selectedSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);
    return (_jsx("div", { className: cn('w-full overflow-hidden rounded-2xl border border-white/20 bg-white/30 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/20', className), children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[800px] border-collapse text-left text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-white/10 bg-white/40 dark:bg-white/5", children: [isSelectionEnabled && (_jsx("th", { className: "w-12 px-6 py-4", children: _jsx("input", { type: "checkbox", checked: isAllSelected, onChange: onSelectAll, className: "h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700" }) })), columns.map((column, index) => (_jsx("th", { className: cn('px-6 py-4 font-semibold text-neutral-900 dark:text-white', column.headerClassName), children: column.header }, index)))] }) }), _jsx("tbody", { className: "divide-y divide-white/10", children: data.map((item) => {
                            const id = keyExtractor(item);
                            const isSelected = selectedSet.has(id);
                            return (_jsxs("tr", { onClick: () => onRowClick?.(item), className: cn('group transition-colors hover:bg-white/40 dark:hover:bg-white/5', onRowClick && 'cursor-pointer', isSelected &&
                                    'bg-blue-50/50 hover:bg-blue-50/70 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'), children: [isSelectionEnabled && (_jsx("td", { className: "w-12 px-6 py-4", children: _jsx("input", { type: "checkbox", checked: isSelected, onChange: (e) => {
                                                e.stopPropagation();
                                                onSelectRow(id);
                                            }, className: "h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700" }) })), columns.map((column, index) => (_jsx("td", { className: cn('px-6 py-4 text-neutral-700 dark:text-neutral-300', column.className), children: column.cell
                                            ? column.cell(item)
                                            : column.accessorKey
                                                ? item[column.accessorKey]
                                                : null }, index)))] }, id));
                        }) })] }) }) }));
}
