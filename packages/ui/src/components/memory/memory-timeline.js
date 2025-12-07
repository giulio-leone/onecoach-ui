/**
 * Memory Timeline Component
 *
 * Displays timeline of significant events (progress, injuries, goals).
 * KISS: Simple timeline list
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card } from '../../card';
import { cn } from '@onecoach/lib-design-system';
import { TrendingUp, AlertTriangle, Target, Award, FileText } from 'lucide-react';
const eventIcons = {
    progress: TrendingUp,
    injury: AlertTriangle,
    goal: Target,
    milestone: Award,
    note: FileText,
};
const eventColors = {
    progress: 'text-green-600 dark:text-green-400',
    injury: 'text-red-600 dark:text-red-400',
    goal: 'text-blue-600 dark:text-blue-400',
    milestone: 'text-purple-600 dark:text-purple-400',
    note: 'text-neutral-600 dark:text-neutral-400',
};
export function MemoryTimeline({ userId, eventType, domain, limit = 20, className, }) {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const loadTimeline = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.set('userId', userId);
                if (eventType)
                    params.set('eventType', eventType);
                if (domain)
                    params.set('domain', domain);
                params.set('limit', limit.toString());
                const response = await fetch(`/api/memory/timeline?${params.toString()}`);
                if (!response.ok)
                    throw new Error('Failed to load timeline');
                const data = await response.json();
                setEvents(data.events || []);
            }
            catch (error) {
                console.error('[Timeline] Error:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadTimeline();
    }, [userId, eventType, domain, limit]);
    if (isLoading) {
        return (_jsx(Card, { variant: "glass", padding: "md", className: className, children: _jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "border-t-primary-500 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 dark:border-neutral-700" }) }) }));
    }
    if (events.length === 0) {
        return (_jsx(Card, { variant: "glass", padding: "md", className: className, children: _jsx("p", { className: "text-center text-sm text-neutral-500 dark:text-neutral-400", children: "Nessun evento nella timeline" }) }));
    }
    return (_jsxs(Card, { variant: "glass", padding: "md", className: cn('space-y-4', className), children: [_jsx("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-white", children: "Timeline Eventi" }), _jsx("div", { className: "space-y-4", children: events.map((event) => {
                    const Icon = eventIcons[event.eventType] ?? FileText;
                    const colorClass = eventColors[event.eventType] ?? eventColors.note;
                    return (_jsxs("div", { className: "flex gap-4 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50", children: [_jsx("div", { className: cn('flex-shrink-0', colorClass), children: _jsx(Icon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: event.title }), _jsx("span", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: new Date(event.date).toLocaleDateString('it-IT') })] }), event.description && (_jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: event.description })), event.domain && (_jsx("span", { className: "inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400", children: event.domain }))] })] }, event.id));
                }) })] }));
}
