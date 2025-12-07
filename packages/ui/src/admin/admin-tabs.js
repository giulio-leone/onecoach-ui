'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Admin Tabs Component
 *
 * Componente riutilizzabile per gestione tabs nelle pagine admin
 * Supporta URL hash-based routing per navigazione tra tabs
 * Principi: KISS, SOLID, DRY
 */
import { useEffect, useState } from 'react';
import { cn } from '@OneCoach/lib-design-system';
export function AdminTabs({ tabs, defaultTab, onTabChange, className }) {
    const [activeTab, setActiveTab] = useState(() => {
        // Preferisci hash dall'URL, poi default
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.slice(1);
            if (hash && tabs.some((t) => t.id === hash && !t.disabled)) {
                return hash;
            }
        }
        return defaultTab || tabs.find((t) => !t.disabled)?.id || tabs[0]?.id || '';
    });
    useEffect(() => {
        // Imposta l'hash URL al mount se non c'è già uno valido
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.slice(1);
            const initialTab = defaultTab || tabs.find((t) => !t.disabled)?.id || tabs[0]?.id || '';
            if (!hash || !tabs.some((t) => t.id === hash && !t.disabled)) {
                // Imposta l'hash con il tab iniziale
                const currentPath = window.location.pathname;
                window.history.replaceState(null, '', `${currentPath}#${initialTab}`);
            }
        }
    }, [defaultTab, tabs]);
    useEffect(() => {
        // Sincronizza con hash URL
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            if (hash && tabs.some((t) => t.id === hash && !t.disabled)) {
                setActiveTab(hash);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [tabs]);
    const handleTabClick = (tabId) => {
        if (tabs.find((t) => t.id === tabId)?.disabled)
            return;
        setActiveTab(tabId);
        onTabChange?.(tabId);
        // Aggiorna hash URL senza scroll
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            window.history.replaceState(null, '', `${currentPath}#${tabId}`);
            // Emetti un custom event per notificare AdminTabPanel del cambio
            // (replaceState non triggera hashchange)
            window.dispatchEvent(new CustomEvent('admintabchange', { detail: { tabId } }));
        }
    };
    return (_jsx("div", { className: cn('border-b border-neutral-200 dark:border-neutral-800', className), children: _jsx("nav", { className: cn('-mb-px flex overflow-x-auto', 'scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent', 'scroll-snap-x-mandatory scroll-smooth', 'lg:space-x-1'), "aria-label": "Tabs", style: {
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(212 212 212) transparent',
            }, children: tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDisabled = tab.disabled;
                return (_jsx("button", { onClick: () => handleTabClick(tab.id), disabled: isDisabled, className: cn('group relative flex-shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors', 'scroll-snap-start touch-manipulation', 'min-h-[44px] min-w-[44px]', // Touch-friendly
                    'sm:px-4 sm:py-3', 'lg:min-w-0 lg:flex-1', // Desktop: flex-1 per distribuzione uniforme
                    'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none', isDisabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-600', isActive
                        ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'), "aria-current": isActive ? 'page' : undefined, children: _jsxs("span", { className: "flex items-center justify-center gap-1.5 sm:gap-2", children: [_jsx("span", { className: "truncate", children: tab.label }), tab.count !== undefined && (_jsx("span", { className: cn('flex-shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold', 'sm:px-2', isActive
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'), children: tab.count })), tab.badge && (_jsx("span", { className: cn('flex-shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold', 'sm:px-2', isActive
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'), children: tab.badge }))] }) }, tab.id));
            }) }) }));
}
export function AdminTabPanel({ children, tabId, activeTab: propActiveTab, className, }) {
    // Se activeTab è fornito come prop, usalo direttamente (compatibilità)
    // Altrimenti leggi dall'URL hash
    const [urlActiveTab, setUrlActiveTab] = useState(() => {
        // Inizializza dall'URL hash se disponibile
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.slice(1);
            return hash || '';
        }
        return '';
    });
    useEffect(() => {
        // Se activeTab è fornito come prop, non sincronizzare con URL
        if (propActiveTab)
            return;
        // Sincronizza con hash URL
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            setUrlActiveTab(hash || '');
        };
        // Listener per hashchange (back/forward navigation)
        window.addEventListener('hashchange', handleHashChange);
        // Listener per custom event emesso da AdminTabs quando cambia tab
        const handleTabChange = (event) => {
            const customEvent = event;
            setUrlActiveTab(customEvent.detail.tabId || '');
        };
        window.addEventListener('admintabchange', handleTabChange);
        // Controlla immediatamente al mount
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.slice(1);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUrlActiveTab(hash || '');
        }
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('admintabchange', handleTabChange);
        };
    }, [propActiveTab]);
    const activeTab = propActiveTab || urlActiveTab;
    // Mostra il contenuto solo se il tabId corrisponde all'activeTab
    if (tabId !== activeTab)
        return null;
    return _jsx("div", { className: cn('mt-6', className), children: children });
}
