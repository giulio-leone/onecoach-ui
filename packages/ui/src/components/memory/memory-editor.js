/**
 * Memory Editor Component
 *
 * Editor for user memory with CRUD operations.
 * KISS: Simple form-based editor
 * SOLID: Single responsibility - only editing
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Card } from '../../card';
import { Button } from '../../button';
import { Input } from '../../input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../tabs';
import { cn } from '@onecoach/lib-design-system';
import { Save, Plus, Trash2 } from 'lucide-react';
export function MemoryEditor({ userId, domain, onSave, className }) {
    const [preferences, setPreferences] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('preferences');
    useEffect(() => {
        const loadMemory = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/memory?domain=${domain}`);
                if (!response.ok)
                    throw new Error('Failed to load memory');
                const data = await response.json();
                setPreferences(data.memory?.[domain]?.preferences || {});
            }
            catch (error) {
                console.error('[Memory Editor] Error:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadMemory();
    }, [userId, domain]);
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/memory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain,
                    preferences,
                }),
            });
            if (!response.ok)
                throw new Error('Failed to save memory');
            onSave?.();
        }
        catch (error) {
            console.error('[Memory Editor] Save error:', error);
            alert('Errore durante il salvataggio');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handlePreferenceChange = (key, value) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
    };
    const handleAddPreference = () => {
        const key = prompt('Nome preferenza:');
        if (key) {
            setPreferences((prev) => ({ ...prev, [key]: '' }));
        }
    };
    const handleRemovePreference = (key) => {
        if (confirm(`Rimuovere la preferenza "${key}"?`)) {
            setPreferences((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };
    if (isLoading) {
        return (_jsx(Card, { variant: "glass", padding: "md", className: className, children: _jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "border-t-primary-500 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 dark:border-neutral-700" }) }) }));
    }
    return (_jsx("div", { className: cn('space-y-4', className), children: _jsxs(Card, { variant: "glass", padding: "md", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-white", children: ["Modifica Memoria: ", domain] }), _jsx(Button, { variant: "primary", size: "sm", icon: Save, onClick: handleSave, disabled: isSaving, children: isSaving ? 'Salvataggio...' : 'Salva' })] }), _jsxs(Tabs, { defaultValue: "preferences", onValueChange: (v) => setActiveTab(v), children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "preferences", children: "Preferenze" }), _jsx(TabsTrigger, { value: "patterns", children: "Pattern" }), _jsx(TabsTrigger, { value: "insights", children: "Insights" })] }), _jsx(TabsContent, { value: "preferences", className: "mt-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: "Gestisci le preferenze per questo dominio" }), _jsx(Button, { variant: "ghost", size: "sm", icon: Plus, onClick: handleAddPreference, children: "Aggiungi" })] }), _jsxs("div", { className: "space-y-3", children: [Object.entries(preferences).map(([key, value]) => (_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: key, disabled: true, className: "flex-1", label: "Chiave" }), _jsx(Input, { value: String(value), onChange: (e) => handlePreferenceChange(key, e.target.value), className: "flex-2", label: "Valore" }), _jsx(Button, { variant: "ghost", size: "sm", icon: Trash2, onClick: () => handleRemovePreference(key), className: "mt-6" })] }, key))), Object.keys(preferences).length === 0 && (_jsx("p", { className: "text-center text-sm text-neutral-500 dark:text-neutral-400", children: "Nessuna preferenza. Clicca \"Aggiungi\" per crearne una." }))] })] }) }), _jsx(TabsContent, { value: "patterns", className: "mt-4", children: _jsx("div", { className: "space-y-4", children: _jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: "I pattern vengono generati automaticamente dall'AI. Puoi visualizzarli nella sezione Insights." }) }) }), _jsx(TabsContent, { value: "insights", className: "mt-4", children: _jsx("div", { className: "space-y-4", children: _jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: "Gli insights vengono generati automaticamente dall'AI. Puoi visualizzarli nella sezione Insights." }) }) })] })] }) }));
}
