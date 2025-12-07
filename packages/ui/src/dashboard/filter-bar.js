'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { cn } from '@onecoach/lib-design-system';
import { Input } from '../input';
import { Search } from 'lucide-react';
export function FilterBar({ searchPlaceholder, onSearchChange, initialSearch = '', children, className, }) {
    const [search, setSearch] = useState(initialSearch);
    useMemo(() => {
        onSearchChange?.(search);
    }, [search, onSearchChange]);
    return (_jsxs("div", { className: cn('flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white/70 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900/60', className), children: [searchPlaceholder && (_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" }), _jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: searchPlaceholder, className: "pl-10" })] })), children && _jsx("div", { className: "flex flex-wrap gap-3", children: children })] }));
}
