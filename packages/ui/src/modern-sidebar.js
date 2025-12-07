'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@onecoach/lib-design-system';
import { SidebarItem } from './sidebar-item';
import { ThemeToggle } from './theme-toggle';
import { Button } from './button';
import { Drawer } from './drawer';
import { ChevronLeft, ChevronRight, ChevronDown, LogOut, MoreVertical, Shield, GraduationCap, Sparkles, MessageSquare, } from 'lucide-react';
import Link from 'next/link';
export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 80;
const isRouteActive = (currentPath, href) => href
    ? currentPath === href ||
        (href !== '/dashboard' && href !== '/admin' && currentPath.startsWith(href))
    : false;
const getItemKey = (item) => item.href ?? item.name;
const collectOpenState = (items, currentPath, prevState) => {
    const nextState = { ...prevState };
    const visit = (item) => {
        const hasChildren = Boolean(item.children?.length);
        const key = getItemKey(item);
        const childIsActive = hasChildren ? item.children.some(visit) : false;
        const selfIsActive = isRouteActive(currentPath, item.href);
        if (hasChildren) {
            const shouldDefaultOpen = item.defaultOpen && nextState[key] === undefined;
            const shouldForceOpen = childIsActive;
            if (shouldDefaultOpen || shouldForceOpen) {
                nextState[key] = true;
            }
            else if (nextState[key] === undefined) {
                nextState[key] = false;
            }
        }
        return selfIsActive || childIsActive;
    };
    items.forEach(visit);
    return nextState;
};
export function ModernSidebar({ navigation, user, pathname, currentPath, onSignOut, className, isMobile = false, onCloseMobile, isCollapsed: controlledIsCollapsed, onToggleCollapse, extraContent, }) {
    const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
    const isCollapsed = controlledIsCollapsed ?? internalIsCollapsed;
    const handleToggleCollapse = onToggleCollapse ??
        (() => {
            if (!isCollapsed)
                setIsProfileOpen(false);
            setInternalIsCollapsed(!isCollapsed);
        });
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const effectivePath = currentPath ?? pathname;
    const [openGroups, setOpenGroups] = useState(() => collectOpenState(navigation, effectivePath, {}));
    useEffect(() => {
        setOpenGroups((prev) => collectOpenState(navigation, effectivePath, prev));
    }, [navigation, effectivePath]);
    const toggleGroup = (key) => {
        setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };
    const isItemActive = (item) => isRouteActive(effectivePath, item.href) || Boolean(item.children?.some(isItemActive));
    const renderItems = (items, depth = 0) => items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const key = getItemKey(item);
        const isGroupOpen = openGroups[key];
        const isActive = isRouteActive(effectivePath, item.href);
        const hasActiveChild = hasChildren && item.children.some(isItemActive);
        if (hasChildren) {
            return (_jsxs("div", { className: "space-y-1", children: [_jsxs("button", { type: "button", onClick: () => toggleGroup(key), className: cn('group relative flex w-full items-center gap-3 rounded-xl py-2.5 pr-3 text-left transition-all duration-200', 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50', (isActive || hasActiveChild || isGroupOpen) &&
                            'bg-blue-50/80 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400', isCollapsed && 'justify-center px-2'), style: isCollapsed ? undefined : { paddingLeft: 12 + depth * 12 }, children: [_jsxs("div", { className: "relative z-10 flex items-center gap-3", children: [_jsx(item.icon, { className: cn('h-5 w-5 shrink-0 transition-colors', isActive || hasActiveChild || isGroupOpen
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300') }), !isCollapsed && _jsx("span", { className: "font-medium tracking-tight", children: item.name })] }), !isCollapsed && item.badge && (_jsx("span", { className: "ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", children: item.badge })), _jsx(ChevronDown, { className: cn('ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200', isGroupOpen && 'rotate-180', isCollapsed && 'hidden') })] }), _jsx(AnimatePresence, { initial: false, children: !isCollapsed && isGroupOpen && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.2 }, className: "space-y-1", children: renderItems(item.children, depth + 1) })) })] }, key));
        }
        if (!item.href)
            return null;
        return (_jsx(SidebarItem, { name: item.name, href: item.href, icon: item.icon, badge: item.badge, depth: depth, isActive: isActive, isCollapsed: isCollapsed, onClick: isMobile ? onCloseMobile : undefined }, key));
    });
    const sidebarVariants = {
        expanded: { width: SIDEBAR_WIDTH },
        collapsed: { width: SIDEBAR_COLLAPSED_WIDTH },
    };
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isCoach = user?.role === 'COACH' || isAdmin;
    const sidebarContent = (_jsxs("div", { className: "flex h-full flex-col", children: [_jsx("div", { className: "flex h-24 items-center justify-between px-6", children: _jsxs(Link, { href: "/dashboard", className: "group flex items-center gap-3 overflow-hidden", children: [_jsxs("div", { className: "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3", children: [_jsx(Sparkles, { className: "h-6 w-6" }), _jsx("div", { className: "absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" })] }), !isCollapsed && (_jsxs(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 }, className: "flex flex-col justify-center", children: [_jsx("span", { className: "text-xl font-extrabold tracking-tight text-slate-900 dark:text-white", children: "onecoach" }), !isMobile && (_jsx("span", { className: "text-xs font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400", children: "Admin Panel" }))] }))] }) }), _jsx("div", { className: cn('scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 overflow-y-auto px-4 py-2', isMobile ? 'flex-1' : extraContent ? 'max-h-[35vh] flex-none' : 'flex-1'), children: _jsx("nav", { className: "space-y-1.5", children: renderItems(navigation) }) }), !isCollapsed &&
                extraContent &&
                (isMobile ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "border-t border-slate-200/50 px-4 py-3 dark:border-slate-800/50", children: _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Link, { href: "/chat", onClick: onCloseMobile, children: _jsx(Button, { variant: "primary", size: "sm", fullWidth: true, icon: MessageSquare, className: "shadow-lg shadow-blue-500/20", children: "Nuova Chat" }) }), _jsx(Button, { variant: "secondary", size: "sm", fullWidth: true, onClick: () => {
                                            setIsChatModalOpen(true);
                                            onCloseMobile?.();
                                        }, className: "border-transparent bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700", children: "Storico" })] }) }), _jsx(Drawer, { isOpen: isChatModalOpen, onClose: () => setIsChatModalOpen(false), position: "right", mobileFullScreen: true, size: "lg", children: _jsx("div", { className: "flex h-full flex-col", children: extraContent }) })] })) : (_jsx("div", { className: "flex min-h-0 flex-1 flex-col overflow-hidden border-t border-slate-200/50 dark:border-slate-800/50", children: _jsx("div", { className: "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-slate-600 flex-1 overflow-y-auto", children: extraContent }) }))), _jsx("div", { className: "mt-auto border-t border-slate-200 bg-slate-50/50 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50", children: !isCollapsed ? (_jsxs("div", { className: "space-y-4", children: [user?.credits !== undefined && (_jsxs("div", { className: cn('relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl dark:from-blue-600 dark:to-indigo-600', isMobile ? 'p-3' : 'p-5'), children: [_jsx("div", { className: "absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/5 blur-2xl" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: cn('font-medium text-slate-300 dark:text-blue-100', isMobile ? 'text-[10px]' : 'text-xs'), children: "Credits Balance" }), _jsx("span", { className: "rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md", children: "PRO" })] }), _jsxs("div", { className: "mt-1 flex items-baseline gap-1", children: [_jsx("span", { className: cn('font-bold', isMobile ? 'text-xl' : 'text-3xl'), children: user.credits }), _jsx("span", { className: "text-xs text-slate-400 dark:text-blue-200", children: "CR" })] }), !isMobile && (_jsx(Link, { href: "/pricing", className: "mt-4 block w-full rounded-lg bg-white/10 py-2 text-center text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20", children: "Recharge Now" }))] })), _jsxs("div", { className: "relative rounded-xl border border-transparent bg-transparent transition-colors hover:border-slate-200 hover:bg-white hover:shadow-sm dark:hover:border-slate-700 dark:hover:bg-slate-800", children: [_jsxs("button", { onClick: () => setIsProfileOpen(!isProfileOpen), className: "flex w-full items-center gap-3 px-2 py-2", children: [_jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white shadow-md", children: user?.name?.[0]?.toUpperCase() || 'U' }), _jsxs("div", { className: "flex flex-1 flex-col items-start overflow-hidden", children: [_jsx("span", { className: "truncate text-sm font-semibold text-slate-900 dark:text-white", children: user?.name || 'User' }), _jsx("span", { className: "truncate text-xs text-slate-500 dark:text-slate-400", children: user?.email })] }), _jsx(MoreVertical, { className: "h-4 w-4 text-slate-400" })] }), (isAdmin || isCoach) && (_jsxs("div", { className: "flex flex-wrap gap-2 px-2 pb-2", children: [isAdmin && (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", children: [_jsx(Shield, { className: "h-3 w-3" }), " ADMIN"] })), isCoach && (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", children: [_jsx(GraduationCap, { className: "h-3 w-3" }), " COACH"] }))] })), _jsx(AnimatePresence, { children: isProfileOpen && (_jsx(motion.div, { initial: { opacity: 0, y: 10, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 10, scale: 0.95 }, className: "absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800", children: _jsxs("div", { className: "p-1", children: [_jsx("div", { className: "px-3 py-2", children: _jsx(ThemeToggle, {}) }), _jsx("div", { className: "my-1 h-px bg-slate-100 dark:bg-slate-700" }), _jsxs("button", { onClick: onSignOut, className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20", children: [_jsx(LogOut, { className: "h-4 w-4" }), "Log Out"] })] }) })) })] })] })) : (_jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white shadow-md", children: user?.name?.[0]?.toUpperCase() || 'U' }), _jsx("button", { onClick: onSignOut, className: "rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400", children: _jsx(LogOut, { className: "h-5 w-5" }) })] })) })] }));
    if (isMobile) {
        return (_jsx("div", { className: cn('h-full w-full border-r border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80', className), children: sidebarContent }));
    }
    return (_jsx(_Fragment, { children: _jsxs(motion.aside, { initial: isCollapsed ? 'collapsed' : 'expanded', animate: isCollapsed ? 'collapsed' : 'expanded', variants: sidebarVariants, className: cn('relative hidden h-screen overflow-visible border-r border-slate-200 bg-white/90 backdrop-blur-xl transition-all duration-300 lg:block dark:border-slate-800 dark:bg-slate-950/90', className), "aria-expanded": !isCollapsed, style: { minWidth: SIDEBAR_COLLAPSED_WIDTH }, children: [sidebarContent, _jsx("button", { onClick: handleToggleCollapse, className: "absolute top-28 -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:scale-110 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400", children: isCollapsed ? _jsx(ChevronRight, { className: "h-3 w-3" }) : _jsx(ChevronLeft, { className: "h-3 w-3" }) })] }) }));
}
