'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '../../glass-card';
import { Badge } from '../../badge';
import { Button } from '../../button';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
import { Image } from '../../image';
export const ResourceCard = ({ title, subtitle, imageSrc, status, badges = [], stats = [], actions = [], onClick, href, className, children, isSelected, onSelect, }) => {
    const handleClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };
    const handleSelectChange = (e) => {
        e.stopPropagation();
        onSelect?.();
    };
    const CardContent = (_jsxs(GlassCard, { className: cn('group hover:shadow-primary/5 relative h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl', isSelected && 'ring-2 ring-blue-500 dark:ring-blue-400', className), onClick: href ? undefined : handleClick, children: [onSelect && (_jsx("div", { className: "absolute top-3 right-3 z-10", onClick: (e) => e.stopPropagation(), children: _jsx("input", { type: "checkbox", checked: isSelected || false, onChange: handleSelectChange, className: "h-5 w-5 cursor-pointer rounded border-2 border-neutral-300 bg-white text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:checked:border-blue-500 dark:checked:bg-blue-500" }) })), _jsxs("div", { className: "relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800", children: [imageSrc ? (_jsx(Image, { src: imageSrc, alt: title, className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110", width: 400, height: 225 })) : (_jsx("div", { className: "flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-600", children: _jsx("div", { className: "h-12 w-12 rounded-full bg-neutral-200/50 dark:bg-neutral-700/50" }) })), status && (_jsx("div", { className: "absolute top-3 left-3", children: _jsx(Badge, { variant: status === 'active' ? 'success' : status === 'draft' ? 'warning' : 'default', className: "backdrop-blur-md", children: status }) })), _jsx("div", { className: "absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100", children: actions.slice(0, 3).map((action, idx) => (_jsx(Button, { size: "sm", variant: "secondary", className: "h-9 w-9 rounded-full p-0", onClick: (e) => {
                                e.stopPropagation();
                                action.onClick();
                            }, title: action.label, children: action.icon || _jsx(MoreHorizontal, { size: 16 }) }, idx))) })] }), _jsxs("div", { className: "flex flex-col gap-3 p-5", children: [_jsxs("div", { children: [_jsx("h3", { className: "group-hover:text-primary line-clamp-1 text-lg font-bold text-neutral-900 dark:text-white", children: title }), subtitle && (_jsx("p", { className: "line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400", children: subtitle }))] }), badges.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1.5", children: [badges.slice(0, 3).map((badge) => (_jsx("span", { className: "inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300", children: badge }, badge))), badges.length > 3 && (_jsxs("span", { className: "inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800", children: ["+", badges.length - 3] }))] })), stats.length > 0 && (_jsx("div", { className: "mt-auto grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800", children: stats.map((stat) => (_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] tracking-wider text-neutral-400 uppercase", children: stat.label }), _jsx("span", { className: "font-semibold text-neutral-700 dark:text-neutral-200", children: stat.value })] }, stat.label))) })), children] })] }));
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, whileHover: { y: -5 }, transition: { duration: 0.3 }, className: "h-full", children: href ? (_jsx(Link, { href: href, className: "block h-full", onClick: handleClick, children: CardContent })) : (CardContent) }));
};
