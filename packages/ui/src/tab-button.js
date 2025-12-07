/**
 * TabButton Component - Web
 *
 * Componente atomico per tab navigation
 * Segue SRP
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from './button';
export const TabButton = ({ active, onClick, icon: Icon, label, count }) => {
    return (_jsxs(Button, { variant: active ? 'primary' : 'ghost', size: "md", icon: Icon, onClick: onClick, className: active ? 'scale-105 shadow-lg' : '', children: [_jsx("span", { className: "hidden sm:inline", children: label }), count !== undefined && (_jsx("span", { className: `ml-1 rounded-full px-2 py-0.5 text-xs ${active
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`, children: count }))] }));
};
