/**
 * Policy History Modal Component
 *
 * Mostra lo storico delle modifiche di una policy
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { X, History, Clock } from 'lucide-react';
import { Button } from '@giulio-leone/ui';
import { formatDateTime } from '@giulio-leone/lib-shared';

interface PolicyHistory {
  id: string;
  policyId: string;
  version: number;
  slug: string;
  type: string;
  title: string;
  content: string;
  metaDescription: string | null;
  status: string;
  changedBy: string;
  changeReason: string | null;
  createdAt: string;
}

interface PolicyHistoryModalProps {
  policyId: string;
  onClose: () => void;
}

export function PolicyHistoryModal({ policyId, onClose }: PolicyHistoryModalProps) {
  const t = useTranslations();
  const tAdmin = useTranslations('admin');
  const [history, setHistory] = useState<PolicyHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/policies/${policyId}/history`);

      if (!response.ok) {
        throw new Error('Errore nel recupero dello storico');
      }

      const data = await response.json();
      setHistory(data);
    } catch (_err: unknown) {
      setError(_err instanceof Error ? _err.message : tAdmin('common.errors.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [policyId, tAdmin]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusBadge = (status: string) => {
    const styles = {
      PUBLISHED: 'bg-green-100 text-green-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
      ARCHIVED: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200',
    };

    const labels = {
      PUBLISHED: 'Pubblicata',
      DRAFT: 'Bozza',
      ARCHIVED: 'Archiviata',
    };

    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || styles.DRAFT}`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <History className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {t('admin.policy_history_modal.storico_policy')}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                {t('admin.policy_history_modal.visualizza_tutte_le_versioni_e_modifiche')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 dark:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}

          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

          {!isLoading && !error && history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-600" />
              <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
                {t('admin.policy_history_modal.nessuno_storico')}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                {t('admin.policy_history_modal.non_ci_sono_versioni_precedenti_per_ques')}
              </p>
            </div>
          )}

          {!isLoading && !error && history.length > 0 && (
            <div className="space-y-4">
              {history.map((item: PolicyHistory) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  {/* Version Header */}
                  <div
                    className="flex cursor-pointer items-center justify-between p-4"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                        v{item.version}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {item.title}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateTime(item.createdAt)}</span>
                          {item.changeReason && (
                            <>
                              <span>•</span>
                              <span className="italic">{item.changeReason}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-400 dark:text-neutral-600">
                      <svg
                        className={`h-5 w-5 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === item.id && (
                    <div className="space-y-4 border-t border-neutral-200 p-4 dark:border-neutral-700">
                      <div>
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          {t('admin.policy_history_modal.slug')}
                        </label>
                        <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                          /{item.slug}
                        </p>
                      </div>

                      {item.metaDescription && (
                        <div>
                          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            {t('admin.policy_history_modal.meta_description')}
                          </label>
                          <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                            {item.metaDescription}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                          {t('admin.policy_history_modal.contenuto')}
                        </label>
                        <div className="mt-2 max-h-60 overflow-y-auto rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50">
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-6 py-4 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex justify-end">
            <Button onClick={onClose} variant="secondary">
              Chiudi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
