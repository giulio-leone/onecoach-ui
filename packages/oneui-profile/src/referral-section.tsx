'use client';
import { useState, useEffect, useCallback } from 'react';
import { Copy, Users, Coins, Share2, Check } from 'lucide-react';
import { Button, IconBadge, Input } from '@onecoach/ui';
import { useTranslations } from 'next-intl';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';
import { LoadingState } from '@onecoach/ui/components';
import { logger } from '@onecoach/lib-shared';
interface ReferralData {
  referralCode: {
    code: string;
    totalUses: number;
  };
  stats: {
    totalReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    clearedEarnings: number;
  };
}
export function ReferralSection() {
  const t = useTranslations();
  const [data, setData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/affiliate/me');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Errore ${response.status}: ${response.statusText}`;
        // Se non autorizzato, non mostrare errore (l'utente potrebbe non essere autenticato)
        if (response.status === 401) {
          setError(null);
          setIsLoading(false);
          return;
        }
        // Se non c'è un programma affiliati attivo, mostra un messaggio user-friendly
        if (
          errorMessage.includes('programma affiliati') ||
          errorMessage.includes('Nessun programma') ||
          response.status === 404
        ) {
          setError(t('common.empty.noPlans'));
          setIsLoading(false);
          return;
        }
        throw new Error(errorMessage);
      }
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Impossibile caricare i dati referral';
      // Trasforma messaggi tecnici in messaggi user-friendly
      if (
        errorMessage.includes('programma affiliati') ||
        errorMessage.includes('Nessun programma')
      ) {
        setError(t('common.empty.noPlans'));
      } else {
        setError(errorMessage);
      }
      logger.error('[ReferralSection] Error loading referral data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [t]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const copyToClipboard = async () => {
    if (!data?.referralCode?.code) return;
    try {
      await navigator.clipboard.writeText(data.referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      logger.error('Failed to copy', err);
    }
  };
  if (isLoading) return <LoadingState message={t('common.loadingReferral')} size="sm" />;
  // Se c'è un errore o non ci sono dati, mostra un messaggio informativo invece di nascondere
  if (error || !data) {
    return (
      <section
        className={cn(
          'overflow-x-hidden rounded-xl border p-4 shadow-sm sm:p-6',
          darkModeClasses.card.elevated
        )}
      >
        <div className="mb-6 flex items-center gap-3">
          <IconBadge icon={Share2} variant="success" size="md" />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold break-words text-neutral-900 sm:text-lg dark:text-neutral-100">
              {t('common.ui.referralSuccess')}
            </h2>
            <p className="text-xs break-words text-neutral-600 sm:text-sm dark:text-neutral-300">
              {t('common.ui.referralDesc')}
            </p>
          </div>
        </div>
        <div className={cn('rounded-lg border p-4 text-center', darkModeClasses.card.base)}>
          <div className="mb-3 flex justify-center">
            <IconBadge icon={Share2} variant="neutral" size="md" />
          </div>
          <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {error?.includes('non è attualmente disponibile')
              ? t('common.empty.noPlans')
              : t('common.errors.generic')}
          </p>
          <p className="mb-4 text-xs text-neutral-600 dark:text-neutral-400">
            {error || t('common.empty.noData')}
          </p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            {t('common.ui.retry')}
          </Button>
        </div>
      </section>
    );
  }
  return (
    <section
      className={cn(
        'overflow-x-hidden rounded-xl border p-4 shadow-sm sm:p-6',
        darkModeClasses.card.elevated
      )}
    >
      <div className="mb-6 flex items-center gap-3">
        <IconBadge icon={Share2} variant="success" size="md" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold break-words text-neutral-900 sm:text-lg dark:text-neutral-100">
            {t('common.ui.referralSuccess')}
          </h2>
          <p className="text-xs break-words text-neutral-600 sm:text-sm dark:text-neutral-300">
            {t('common.ui.referralDesc')}
          </p>
        </div>
      </div>
      <div className="grid gap-6 overflow-x-hidden lg:grid-cols-2">
        {/* Referral Code Card */}
        <div className={cn('rounded-lg border p-5', darkModeClasses.card.base)}>
          <h3 className="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('common.ui.referralCode')}
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                readOnly
                value={data.referralCode.code}
                className="bg-neutral-50 pr-10 text-center font-mono text-lg font-bold tracking-wider uppercase dark:bg-neutral-900/50"
              />
            </div>
            <Button
              variant={copied ? 'success' : 'primary'}
              onClick={copyToClipboard}
              className="min-w-[100px]"
              icon={copied ? Check : Copy}
            >
              {copied ? t('common.ui.done') : t('common.actions.copy')}
            </Button>
          </div>
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            {t('common.ui.welcomeBonus')}
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={cn('rounded-lg border p-4', darkModeClasses.card.base)}>
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {t('common.ui.invitedFriends')}
              </span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {data.stats.totalReferrals}
            </p>
          </div>
          <div className={cn('rounded-lg border p-4', darkModeClasses.card.base)}>
            <div className="mb-2 flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {t('common.ui.earnedCredits')}
              </span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {data.stats.totalEarnings}
            </p>
            {data.stats.pendingEarnings > 0 && (
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
                + {data.stats.pendingEarnings} {t('common.ui.pending')}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
