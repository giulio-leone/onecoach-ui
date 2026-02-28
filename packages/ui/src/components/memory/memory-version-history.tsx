/**
 * Memory Version History Component
 *
 * Displays version history with diff and restore capability.
 * KISS: Simple version list with restore button
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '../../card';
import { Button } from '../../button';
import { History, RotateCcw } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import type { MemoryVersion } from '@giulio-leone/lib-core/user-memory/types';

export interface MemoryVersionHistoryProps {
  userId: string;
  limit?: number;
  onRestore?: (versionNumber: number) => void;
  className?: string;
}

export function MemoryVersionHistory({
  userId,
  limit = 20,
  onRestore,
  className,
}: MemoryVersionHistoryProps) {
  const [versions, setVersions] = useState<MemoryVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);

  useEffect(() => {
    const loadVersions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/memory/history?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to load versions');

        const data = await response.json();
        setVersions(data.versions || []);
      } catch (error) {
        console.error('[Version History] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVersions();
  }, [userId, limit]);

  const handleRestore = async (versionNumber: number) => {
    if (!confirm(`Ripristinare la versione ${versionNumber}?`)) return;

    setRestoring(versionNumber);
    try {
      const response = await fetch('/api/memory/history/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionNumber }),
      });

      if (!response.ok) throw new Error('Failed to restore version');

      onRestore?.(versionNumber);
      // Reload versions
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error('[Version History] Restore error:', error);
      alert('Errore durante il ripristino');
    } finally {
      setRestoring(null);
    }
  };

  if (isLoading) {
    return (
      <Card variant="glass" padding="md" className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="border-t-primary-500 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 dark:border-neutral-700" />
        </div>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card variant="glass" padding="md" className={className}>
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Nessuna versione salvata
        </p>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="md" className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
          <History className="h-5 w-5" />
          Cronologia Versioni
        </h3>
      </div>
      <div className="space-y-2">
        {versions.map((version: any) => (
          <div
            key={version.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 dark:text-white">
                  Versione {version.versionNumber}
                </span>
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                  {version.changeType}
                </span>
              </div>
              {version.changeNote && (
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {version.changeNote}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {new Date(version.createdAt).toLocaleString('it-IT')} • {version.changedBy}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={() => handleRestore(version.versionNumber)}
              disabled={restoring === version.versionNumber}
            >
              Ripristina
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
