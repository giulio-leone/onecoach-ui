/**
 * Memory Version History Component
 *
 * Displays version history with diff and restore capability.
 * KISS: Simple version list with restore button
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card } from '../../card';
import { Button } from '../../button';
import { History, RotateCcw } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export function MemoryVersionHistory({ userId, limit = 20, onRestore, className, }) {
    const [versions, setVersions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [restoring, setRestoring] = useState(null);
    useEffect(() => {
        const loadVersions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/memory/history?limit=${limit}`);
                if (!response.ok)
                    throw new Error('Failed to load versions');
                const data = await response.json();
                setVersions(data.versions || []);
            }
            catch (error) {
                console.error('[Version History] Error:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadVersions();
    }, [userId, limit]);
    const handleRestore = async (versionNumber) => {
        if (!confirm(`Ripristinare la versione ${versionNumber}?`))
            return;
        setRestoring(versionNumber);
        try {
            const response = await fetch('/api/memory/history/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionNumber }),
            });
            if (!response.ok)
                throw new Error('Failed to restore version');
            onRestore?.(versionNumber);
            // Reload versions
            const data = await response.json();
            setVersions(data.versions || []);
        }
        catch (error) {
            console.error('[Version History] Restore error:', error);
            alert('Errore durante il ripristino');
        }
        finally {
            setRestoring(null);
        }
    };
    if (isLoading) {
        return (_jsx(Card, { variant: "glass", padding: "md", className: className, children: _jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "border-t-primary-500 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 dark:border-neutral-700" }) }) }));
    }
    if (versions.length === 0) {
        return (_jsx(Card, { variant: "glass", padding: "md", className: className, children: _jsx("p", { className: "text-center text-sm text-neutral-500 dark:text-neutral-400", children: "Nessuna versione salvata" }) }));
    }
    return (_jsxs(Card, { variant: "glass", padding: "md", className: cn('space-y-4', className), children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("h3", { className: "flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white", children: [_jsx(History, { className: "h-5 w-5" }), "Cronologia Versioni"] }) }), _jsx("div", { className: "space-y-2", children: versions.map((version) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-medium text-neutral-900 dark:text-white", children: ["Versione ", version.versionNumber] }), _jsx("span", { className: "rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400", children: version.changeType })] }), version.changeNote && (_jsx("p", { className: "mt-1 text-sm text-neutral-600 dark:text-neutral-400", children: version.changeNote })), _jsxs("p", { className: "mt-1 text-xs text-neutral-500 dark:text-neutral-400", children: [new Date(version.createdAt).toLocaleString('it-IT'), " \u2022 ", version.changedBy] })] }), _jsx(Button, { variant: "ghost", size: "sm", icon: RotateCcw, onClick: () => handleRestore(version.versionNumber), disabled: restoring === version.versionNumber, children: "Ripristina" })] }, version.id))) })] }));
}
