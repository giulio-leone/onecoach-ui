'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@onecoach/lib-design-system';
const TabsContext = React.createContext(null);
export function Tabs({ defaultValue, children, className, value, onValueChange }) {
    const [internalValue, setInternalValue] = React.useState(value ?? defaultValue);
    React.useEffect(() => {
        setInternalValue(value ?? defaultValue);
    }, [value, defaultValue]);
    const handleSetValue = React.useCallback((next) => {
        if (value === undefined) {
            setInternalValue(next);
        }
        onValueChange?.(next);
    }, [onValueChange, value]);
    return (_jsx(TabsContext.Provider, { value: { value: value ?? internalValue, setValue: handleSetValue }, children: _jsx("div", { className: cn('w-full', className), children: children }) }));
}
export function TabsList({ children, className }) {
    return (_jsx("div", { className: cn('inline-flex h-10 items-center justify-center rounded-lg bg-neutral-100 p-1 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400', className), children: children }));
}
export function TabsTrigger({ value, children, className }) {
    const context = React.useContext(TabsContext);
    if (!context)
        throw new Error('TabsTrigger must be used within Tabs');
    const isActive = context.value === value;
    return (_jsx("button", { type: "button", onClick: () => context.setValue(value), className: cn('inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap ring-offset-white transition-all focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300', isActive
            ? 'bg-white text-neutral-950 shadow-sm dark:bg-neutral-950 dark:text-neutral-50'
            : 'hover:bg-neutral-200/50 hover:text-neutral-900 dark:hover:bg-neutral-700/50 dark:hover:text-neutral-100', className), children: children }));
}
export function TabsContent({ value, children, className }) {
    const context = React.useContext(TabsContext);
    if (!context)
        throw new Error('TabsContent must be used within Tabs');
    if (context.value !== value)
        return null;
    return (_jsx("div", { className: cn('mt-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300', className), children: children }));
}
