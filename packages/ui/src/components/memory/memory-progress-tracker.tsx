/**
 * Memory Progress Tracker Component
 *
 * Tracks and displays user progress (weight, injuries, goals).
 * KISS: Simple progress display with add button
 */

'use client';

import React, { useState } from 'react';
import { Card } from '../../card';
import { Button } from '../../button';
import { Input } from '../../input';
import { Textarea } from '../../textarea';
import { MemoryTimeline } from './memory-timeline';
import { Plus } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import type { TimelineEventType } from '@onecoach/lib-core/user-memory/types';

export interface MemoryProgressTrackerProps {
  userId: string;
  className?: string;
}

export function MemoryProgressTracker({ userId, className }: MemoryProgressTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [eventType, setEventType] = useState<TimelineEventType>('progress');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddEvent = async () => {
    if (!title.trim()) return;

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

      if (!response.ok) throw new Error('Failed to create event');

      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowAddForm(false);
      // Timeline will auto-refresh
    } catch (error) {
      console.error('[Progress Tracker] Error:', error);
      alert("Errore durante la creazione dell'evento");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card variant="glass" padding="md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Tracciamento Progressi
          </h3>
          <Button
            variant="ghost"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            Aggiungi Evento
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Tipo Evento
              </label>
              <select
                value={eventType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setEventType(e.target.value as TimelineEventType)
                }
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <option value="progress">Progresso</option>
                <option value="injury">Infortunio</option>
                <option value="goal">Obiettivo</option>
                <option value="milestone">Milestone</option>
                <option value="note">Nota</option>
              </select>
            </div>

            <Input
              label="Titolo"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Es. Dimagrimento di 5kg"
            />

            <Textarea
              label="Descrizione"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Dettagli aggiuntivi..."
            />

            <Input
              label="Data"
              type="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
            />

            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleAddEvent} disabled={isSaving}>
                {isSaving ? 'Salvataggio...' : 'Salva'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setTitle('');
                  setDescription('');
                }}
              >
                Annulla
              </Button>
            </div>
          </div>
        )}
      </Card>

      <MemoryTimeline userId={userId} limit={10} />
    </div>
  );
}
