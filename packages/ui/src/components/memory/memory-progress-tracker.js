/**
 * Memory Progress Tracker Component
 *
 * Tracks and displays user progress (weight, injuries, goals).
 * KISS: Simple progress display with add button
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Card } from '../../card';
import { Button } from '../../button';
import { Input } from '../../input';
import { Textarea } from '../../textarea';
import { MemoryTimeline } from './memory-timeline';
import { Plus } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
export function MemoryProgressTracker({ userId, className }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [eventType, setEventType] = useState('progress');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
    const handleAddEvent = async () => {
        if (!title.trim())
            return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/memory/timeline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    eventType,
                    title,
                    description: description || undefined,
                    date,
                }),
            });
            if (!response.ok)
                throw new Error('Failed to create event');
            setTitle('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            setShowAddForm(false);
            // Timeline will auto-refresh
        }
        catch (error) {
            console.error('[Progress Tracker] Error:', error);
            alert("Errore durante la creazione dell'evento");
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsxs("div", { className: cn('space-y-4', className), children: [_jsxs(Card, { variant: "glass", padding: "md", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-neutral-900 dark:text-white", children: "Tracciamento Progressi" }), _jsx(Button, { variant: "ghost", size: "sm", icon: Plus, onClick: () => setShowAddForm(!showAddForm), children: "Aggiungi Evento" })] }), showAddForm && (_jsxs("div", { className: "space-y-4 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Tipo Evento" }), _jsxs("select", { value: eventType, onChange: (e) => setEventType(e.target.value), className: "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900", children: [_jsx("option", { value: "progress", children: "Progresso" }), _jsx("option", { value: "injury", children: "Infortunio" }), _jsx("option", { value: "goal", children: "Obiettivo" }), _jsx("option", { value: "milestone", children: "Milestone" }), _jsx("option", { value: "note", children: "Nota" })] })] }), _jsx(Input, { label: "Titolo", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Es. Dimagrimento di 5kg" }), _jsx(Textarea, { label: "Descrizione", value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Dettagli aggiuntivi..." }), _jsx(Input, { label: "Data", type: "date", value: date, onChange: (e) => setDate(e.target.value) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "primary", size: "sm", onClick: handleAddEvent, disabled: isSaving, children: isSaving ? 'Salvataggio...' : 'Salva' }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                            setShowAddForm(false);
                                            setTitle('');
                                            setDescription('');
                                        }, children: "Annulla" })] })] }))] }), _jsx(MemoryTimeline, { userId: userId, limit: 10 })] }));
}
