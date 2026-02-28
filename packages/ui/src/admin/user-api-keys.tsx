/**
 * User API Keys Component
 *
 * Componente per visualizzare e gestire le subkey di un utente
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { KeyRound, Trash2, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@giulio-leone/ui';
import { useTranslations, useFormatter } from 'next-intl';

interface ApiKey {
  id: string;
  provider: string;
  keyLabel: string;
  limit: number;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserApiKeysProps {
  userId: string;
}

export function UserApiKeys({ userId }: UserApiKeysProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const t = useTranslations('admin.apiKeys');
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const format = useFormatter();

  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${userId}/api-keys`);

      if (!response.ok) {
        throw new Error(tAdmin('loadError'));
      }

      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (_err: unknown) {
      setError(_err instanceof Error ? _err.message : tCommon('errors.unknown'));
    } finally {
      setLoading(false);
    }
  }, [userId, t, tCommon]);

  useEffect(() => {
    void fetchApiKeys();
  }, [fetchApiKeys]);

  const handleRevoke = async (keyId: string) => {
    const { dialog } = await import('@giulio-leone/lib-stores');
    const confirmed = await dialog.confirm(tAdmin('revokeConfirm'));
    if (!confirmed) {
      return;
    }

    setRevokingId(keyId);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${userId}/api-keys`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || tAdmin('revokeError'));
      }

      // Ricarica la lista
      await fetchApiKeys();
    } catch (_err: unknown) {
      setError(_err instanceof Error ? _err.message : tAdmin('revokeError'));
    } finally {
      setRevokingId(null);
    }
  };

  const getStatusBadge = (status: 'ACTIVE' | 'REVOKED' | 'EXPIRED') => {
    const styles = {
      ACTIVE: {
        bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle2,
      },
      REVOKED: {
        bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
      },
      EXPIRED: {
        bg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400',
        icon: AlertCircle,
      },
    };

    const style = styles[status] || styles.ACTIVE;
    const Icon = style.icon;

    return (
      <span
        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${style.bg}`}
      >
        <Icon className="h-3 w-3" />
        {tAdmin(`status.${status}`)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{t('title')}</h4>
        </div>
        <Button onClick={fetchApiKeys} variant="secondary" size="sm">
          {t('refresh')}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
          <KeyRound className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t('noKeys')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key: any) => (
            <div
              key={key.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {key.keyLabel}
                    </span>
                    {getStatusBadge(key.status)}
                  </div>

                  <div className="grid gap-2 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {t('provider')}{' '}
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {key.provider}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">{t('limit')} </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {key.limit} {t('credits')}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {t('created')}{' '}
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {format.dateTime(new Date(key.createdAt), {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    {key.stripePaymentIntentId && (
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {t('paymentIntent')}{' '}
                        </span>
                        <span className="font-mono text-xs text-neutral-900 dark:text-neutral-100">
                          {key.stripePaymentIntentId.substring(0, 20)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {key.status === 'ACTIVE' && (
                  <Button
                    onClick={() => handleRevoke(key.id)}
                    variant="secondary"
                    size="sm"
                    disabled={revokingId === key.id}
                    className="ml-4"
                  >
                    {revokingId === key.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('revoking')}
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('revoke')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
