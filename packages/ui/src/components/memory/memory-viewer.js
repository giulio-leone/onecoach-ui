/**
 * Memory Viewer Component
 *
 * Displays user memory organized by domains.
 * KISS: Simple tabbed interface
 * SOLID: Single responsibility - only display
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '../../card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../tabs';
import { MemoryInsightsCard } from './memory-insights-card';
import { cn } from '@onecoach/lib-design-system';
import { Dumbbell, UtensilsCrossed, Calendar, FolderKanban, CheckSquare, Target, User, } from 'lucide-react';
const isUuid = (value) => {
    if (!value)
        return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};
const domains = [
    { id: 'workout', label: 'Allenamento', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrizione', icon: UtensilsCrossed },
    { id: 'oneagenda', label: 'OneAgenda', icon: Calendar },
    { id: 'projects', label: 'Progetti', icon: FolderKanban },
    { id: 'tasks', label: 'Task', icon: CheckSquare },
    { id: 'habits', label: 'Abitudini', icon: Target },
    { id: 'general', label: 'Generale', icon: User },
];
export function MemoryViewer({ userId, initialDomain = 'workout', className }) {
    const [memory, setMemory] = useState(null);
    const [activeDomain, setActiveDomain] = useState(initialDomain);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const controllerRef = useRef(null);
    const loadMemory = useCallback(async () => {
        // Blocca subito se l'ID utente non è un UUID valido
        if (!isUuid(userId)) {
            setError('ID utente non valido');
            setMemory(null);
            setIsLoading(false);
            return;
        }
        // Annulla richieste precedenti per evitare race conditions quando si cambia dominio rapidamente
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                domain: activeDomain,
                userId,
            });
            const response = await fetch(`/api/memory?${params.toString()}`, {
                cache: 'no-store',
                credentials: 'include',
                signal: controller.signal,
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                const message = payload?.message ||
                    payload?.error ||
                    `Errore ${response.status}`;
                throw new Error(message);
            }
            setMemory(payload?.memory ?? null);
            setError(null);
        }
        catch (err) {
            if (err instanceof Error && err.name === 'AbortError')
                return;
            console.error('[Memory Viewer] Error:', err);
            setError(err instanceof Error ? err.message : 'Errore nel caricamento della memoria');
        }
        finally {
            setIsLoading(false);
        }
    }, [activeDomain, userId]);
    useEffect(() => {
        void loadMemory();
        return () => controllerRef.current?.abort();
    }, [loadMemory]);
    if (isLoading) {
        return (_jsx(Card, { variant: "glass", padding: "md", className: className, children: _jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "border-t-primary-500 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 dark:border-neutral-700" }) }) }));
    }
    if (error) {
        return (_jsx(Card, { variant: "glass", padding: "md", className: className, children: _jsxs("div", { className: "flex flex-col items-center gap-3 py-6 text-center", children: [_jsx("p", { className: "text-sm font-medium text-red-600 dark:text-red-400", children: "Non riusciamo a caricare la memoria." }), _jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: error }), _jsx("button", { type: "button", onClick: () => void loadMemory(), className: "bg-primary-500 hover:bg-primary-600 focus:ring-primary-500/70 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow focus:ring-2 focus:outline-none", children: "Riprova" })] }) }));
    }
    return (_jsx("div", { className: cn('space-y-4', className), children: _jsxs(Tabs, { defaultValue: activeDomain, onValueChange: (nextValue) => setActiveDomain(nextValue), children: [_jsx(TabsList, { className: "w-full justify-start overflow-x-auto", children: domains.map((domain) => {
                        const Icon = domain.icon;
                        return (_jsxs(TabsTrigger, { value: domain.id, className: "gap-2", children: [_jsx(Icon, { className: "h-4 w-4" }), domain.label] }, domain.id));
                    }) }), domains.map((domain) => {
                    const domainData = memory?.[domain.id];
                    return (_jsx(TabsContent, { value: domain.id, className: "mt-4", children: _jsxs("div", { className: "space-y-4", children: [domainData && (_jsxs(_Fragment, { children: [Object.keys(domainData.preferences).length > 0 && (_jsxs(Card, { variant: "glass", padding: "md", children: [_jsx("h3", { className: "mb-4 text-lg font-semibold text-neutral-900 dark:text-white", children: "Preferenze" }), _jsx("div", { className: "space-y-2", children: Object.entries(domainData.preferences).map(([key, value]) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50", children: [_jsx("span", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: key }), _jsx("span", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: typeof value === 'object' ? JSON.stringify(value) : String(value) })] }, key))) })] })), _jsx(MemoryInsightsCard, { patterns: domainData.patterns, insights: domainData.insights })] })), !domainData && (_jsx(Card, { variant: "glass", padding: "md", children: _jsx("p", { className: "text-center text-sm text-neutral-500 dark:text-neutral-400", children: "Nessun dato disponibile per questo dominio" }) }))] }) }, domain.id));
                })] }) }));
}
