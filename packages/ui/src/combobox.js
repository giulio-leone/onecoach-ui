'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export const Combobox = ({ options, value, onChange, placeholder = 'Select...', searchPlaceholder = 'Search...', multiple = false, className, disabled = false, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Filter options based on search
    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));
    const handleSelect = (optionValue) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValue = currentValues.includes(optionValue)
                ? currentValues.filter((v) => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValue);
        }
        else {
            onChange(optionValue);
            setIsOpen(false);
        }
    };
    const isSelected = (optionValue) => {
        if (multiple) {
            return Array.isArray(value) && value.includes(optionValue);
        }
        return value === optionValue;
    };
    // Get display label for selected value(s)
    const getDisplayLabel = () => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return _jsx("span", { className: "text-neutral-400", children: placeholder });
        }
        if (multiple) {
            const count = Array.isArray(value) ? value.length : 0;
            return _jsxs("span", { className: "text-neutral-900 dark:text-white", children: [count, " selected"] });
        }
        const selectedOption = options.find((opt) => opt.value === value);
        return (_jsx("span", { className: "text-neutral-900 dark:text-white", children: selectedOption?.label || value }));
    };
    return (_jsxs("div", { className: cn('relative w-full min-w-[200px]', className), ref: containerRef, children: [_jsxs("div", { onClick: () => !disabled && setIsOpen(!isOpen), className: cn('flex h-10 w-full items-center justify-between rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm backdrop-blur-md transition-all hover:bg-white/60 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/30', disabled && 'cursor-not-allowed opacity-50', isOpen && 'border-blue-500/30 ring-2 ring-blue-500/20'), children: [_jsx("div", { className: "flex items-center gap-2 truncate", children: getDisplayLabel() }), _jsx(ChevronDown, { className: cn('h-4 w-4 text-neutral-500 transition-transform dark:text-neutral-400', isOpen && 'rotate-180') })] }), isOpen && (_jsxs("div", { className: "animate-in fade-in zoom-in-95 absolute top-full left-0 z-[9999] mt-2 w-full overflow-hidden rounded-xl border border-white/20 bg-white/95 p-1 shadow-xl backdrop-blur-xl duration-200 dark:border-white/10 dark:bg-neutral-900/95", children: [_jsxs("div", { className: "relative mb-2 px-2 pt-2", children: [_jsx(Search, { className: "absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" }), _jsx("input", { ref: inputRef, type: "text", className: "w-full rounded-lg border border-neutral-200 bg-white/50 px-8 py-1.5 text-sm transition-colors outline-none focus:border-blue-500/50 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-blue-500/50", placeholder: searchPlaceholder, value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onClick: (e) => e.stopPropagation(), autoFocus: true })] }), _jsx("div", { className: "custom-scrollbar max-h-[240px] overflow-y-auto px-1 py-1", children: filteredOptions.length === 0 ? (_jsx("div", { className: "px-2 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400", children: "No results found." })) : (filteredOptions.map((option) => (_jsxs("div", { onClick: () => handleSelect(option.value), className: cn('flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10', isSelected(option.value) &&
                                'bg-blue-50 font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'), children: [_jsx("div", { className: cn('flex h-4 w-4 items-center justify-center rounded border', isSelected(option.value)
                                        ? 'border-blue-500 bg-blue-500 text-white'
                                        : 'border-neutral-300 dark:border-neutral-600'), children: isSelected(option.value) && _jsx(Check, { size: 12 }) }), option.icon && _jsx("span", { className: "text-neutral-500", children: option.icon }), _jsx("span", { className: "flex-1 text-neutral-700 dark:text-neutral-200", children: option.label })] }, option.value)))) })] }))] }));
};
