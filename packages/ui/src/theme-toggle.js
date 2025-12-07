'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@OneCoach/lib-stores/index';
import { useState, useEffect } from 'react';
export function ThemeToggle() {
    const { theme, setTheme, actualTheme } = useTheme();
    const [showMenu, setShowMenu] = useState(false);
    const [mounted, setMounted] = useState(false);
    // Prevent hydration mismatch by only showing correct icon after mount
    useEffect(() => {
        setMounted(true);
    }, []);
    const themes = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];
    return (_jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowMenu(!showMenu), className: "rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800", "aria-label": "Toggle theme", suppressHydrationWarning: true, children: !mounted ? (
                // Render placeholder during SSR to match initial client render
                _jsx(Sun, { className: "h-5 w-5 text-neutral-600 dark:text-neutral-400" })) : actualTheme === 'light' ? (_jsx(Sun, { className: "h-5 w-5 text-neutral-600 dark:text-neutral-400" })) : (_jsx(Moon, { className: "h-5 w-5 text-neutral-600 dark:text-neutral-400" })) }), showMenu && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setShowMenu(false) }), _jsx("div", { className: "animate-slide-down absolute right-0 z-20 mt-2 w-48 rounded-lg border border-neutral-200/50 bg-white/70 py-1 shadow-lg backdrop-blur-2xl dark:border-neutral-800/50 dark:bg-[#020408]/70", children: themes.map(({ value, label, icon: Icon }) => (_jsxs("button", { onClick: () => {
                                setTheme(value);
                                setShowMenu(false);
                            }, className: `flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${theme === value
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700'}`, children: [_jsx(Icon, { className: "h-4 w-4" }), _jsx("span", { children: label }), theme === value && _jsx("span", { className: "ml-auto text-xs", children: "\u2713" })] }, value))) })] }))] }));
}
