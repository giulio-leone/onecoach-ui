'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@giulio-leone/ui';
import { X, Clock } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';

import { logger } from '@giulio-leone/lib-shared';

interface PromptHistoryEntry {
  id: string;
  promptTemplate: string;
  isActive: boolean;
  changedBy: string;
  changeReason: string | null;
  createdAt: string;
}

interface PromptHistoryProps {
  agentId: string;
  onClose: () => void;
}

export function PromptHistory({ agentId, onClose }: PromptHistoryProps) {
  const [history, setHistory] = useState<PromptHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<PromptHistoryEntry | null>(null);
  const t = useTranslations('admin.promptHistory');
  const format = useFormatter();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/prompts/${encodeURIComponent(agentId)}/history`);
      if (!response.ok) {
        throw new Error('Failed to load history');
      }
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      logger.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold">{t('title')}</h2>
          <p className="text-muted-foreground font-mono text-sm">{agentId}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          {t('close')}
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center">{t('loading')}</div>
      ) : history.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">{t('noHistory')}</div>
      ) : (
        <div className="space-y-4">
          {history.map((entry: any) => (
            <div
              key={entry.id}
              className="hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">
                      {format.dateTime(new Date(entry.createdAt), {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    {entry.isActive && (
                      <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-600">
                        {t('wasActive')}
                      </span>
                    )}
                  </div>
                  {entry.changeReason && (
                    <p className="text-muted-foreground mb-2 text-sm">
                      {t('reason', { reason: entry.changeReason })}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    {t('changedBy', { name: entry.changedBy })}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {t('templateLength', { length: entry.promptTemplate.length })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background max-h-[80vh] w-full max-w-4xl overflow-auto rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {t('entryTitle', {
                  date: format.dateTime(new Date(selectedEntry.createdAt), {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }),
                })}
              </h3>
              <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-4 space-y-2">
              <p className="text-sm">
                <strong>{t('changedBy', { name: '' }).replace(': ', '')}:</strong>{' '}
                {selectedEntry.changedBy}
              </p>
              {selectedEntry.changeReason && (
                <p className="text-sm">
                  <strong>{t('reasonLabel')}</strong> {selectedEntry.changeReason}
                </p>
              )}
              <p className="text-sm">
                <strong>{t('wasActiveLabel')}</strong> {selectedEntry.isActive ? t('yes') : t('no')}
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">{t('template')}</h4>
              <pre className="bg-muted max-h-96 overflow-auto rounded p-4 text-sm whitespace-pre-wrap">
                {selectedEntry.promptTemplate}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
