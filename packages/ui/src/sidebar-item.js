'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@onecoach/lib-design-system';
import { motion } from 'framer-motion';
import Link from 'next/link';
export function SidebarItem({ name, href, icon: Icon, isActive, isCollapsed, badge, onClick, depth = 0, }) {
    const indentation = isCollapsed ? undefined : 12 + depth * 12;
    return (_jsxs(Link, { href: href, onClick: onClick, "aria-label": name, className: cn('group relative flex items-center gap-3 overflow-visible rounded-xl py-2.5 pr-3 transition-all duration-200', 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50', isActive
            ? 'bg-blue-50/80 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
            : 'text-slate-600 dark:text-slate-400', isCollapsed && 'justify-center px-2'), style: indentation ? { paddingLeft: indentation } : undefined, children: [isActive && (_jsx(motion.div, { layoutId: "activeSidebarItem", className: "absolute inset-0 rounded-xl bg-blue-50/80 dark:bg-blue-500/10", initial: false, transition: {
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                } })), _jsxs("div", { className: "relative z-10 flex items-center gap-3", children: [_jsx(Icon, { className: cn('h-5 w-5 shrink-0 transition-colors', isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300') }), !isCollapsed && _jsx("span", { className: "font-medium tracking-tight", children: name })] }), !isCollapsed && badge && (_jsx("span", { className: "ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", children: badge })), isCollapsed && (_jsx("div", { className: "pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden translate-x-1 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg shadow-slate-900/40 transition-all duration-150 group-hover:block group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:block group-focus-visible:translate-x-0 group-focus-visible:opacity-100 dark:bg-slate-800", children: name }))] }));
}
