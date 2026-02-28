/**
 * Memory Editor Component
 *
 * Editor for user memory with CRUD operations.
 * KISS: Simple form-based editor
 * SOLID: Single responsibility - only editing
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../../card';
import { Button } from '../../../button';
import { Input } from '../../../input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../tabs';
import type { MemoryDomain } from '@giulio-leone/lib-core/user-memory/types';
import { cn } from '@giulio-leone/lib-design-system';
import { Save, Plus, Trash2 } from 'lucide-react';

export interface MemoryEditorProps {
  userId: string;
  domain: MemoryDomain;
  onSave?: () => void;
  className?: string;
}

export function MemoryEditor({ userId, domain, onSave, className }: MemoryEditorProps) {
  const [preferences, setPreferences] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'preferences' | 'patterns' | 'insights'>(
    'preferences'
  );

  useEffect(() => {
    const loadMemory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/memory?domain=${domain}`);
        if (!response.ok) throw new Error('Failed to load memory');

        const data = await response.json();
        setPreferences(data.memory?.[domain]?.preferences || {});
      } catch (error) {
        console.error('[Memory Editor] Error:', error);
      } finally {
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

      if (!response.ok) throw new Error('Failed to save memory');

      onSave?.();
    } catch (error) {
      console.error('[Memory Editor] Save error:', error);
      alert('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: string, value: unknown) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPreference = () => {
    const key = prompt('Nome preferenza:');
    if (key) {
      setPreferences((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleRemovePreference = (key: string) => {
    if (confirm(`Rimuovere la preferenza "${key}"?`)) {
      setPreferences((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <Card variant="glass" padding="md" className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="border-t-primary-500 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200/60 dark:border-white/[0.08]" />
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card variant="glass" padding="md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Modifica Memoria: {domain}
          </h3>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvataggio...' : 'Salva'}
          </Button>
        </div>

        <Tabs defaultValue="preferences" onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="preferences">Preferenze</TabsTrigger>
            <TabsTrigger value="patterns">Pattern</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Gestisci le preferenze per questo dominio
                </p>
                <Button variant="ghost" size="sm" icon={Plus} onClick={handleAddPreference}>
                  Aggiungi
                </Button>
              </div>
              <div className="space-y-3">
                {Object.entries(preferences).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <Input value={key} disabled className="flex-1" label="Chiave" />
                    <Input
                      value={String(value)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handlePreferenceChange(key, e.target.value)
                      }
                      className="flex-2"
                      label="Valore"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleRemovePreference(key)}
                      className="mt-6"
                    />
                  </div>
                ))}
                {Object.keys(preferences).length === 0 && (
                  <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Nessuna preferenza. Clicca "Aggiungi" per crearne una.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                I pattern vengono generati automaticamente dall'AI. Puoi visualizzarli nella sezione
                Insights.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Gli insights vengono generati automaticamente dall'AI. Puoi visualizzarli nella
                sezione Insights.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
