'use client';

import { useTranslations } from 'next-intl';
/**
 * Credit Balance Component
 *
 * Display saldo crediti utente
 */

import { Coins, Infinity, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@onecoach/ui';
import { Link } from 'app/navigation';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';
import { useCredits, useCurrentUser } from '@onecoach/lib-api/hooks';
import { creditsKeys } from '@onecoach/lib-api/queries/credits.queries';
import { useRealtimeInvalidator } from '@/hooks/use-realtime-invalidator';

export function CreditBalance() {
  const t = useTranslations('common');

  const currentUser = useCurrentUser();
  const { data: stats, isLoading } = useCredits();

  // Invalida il saldo crediti quando la tabella users cambia per l'utente corrente
  useRealtimeInvalidator('users', [creditsKeys.balance()], {
    filter: currentUser?.id ? `id=eq.${currentUser.id}` : undefined,
    enabled: !!currentUser?.id,
  });

  if (isLoading) {
    return (
      <div className={cn(darkModeClasses.loading.container)}>
        <div className="animate-pulse">
          <div className={cn('h-8 w-32 rounded', darkModeClasses.loading.skeleton)}></div>
          <div className={cn('mt-4 h-12 w-48 rounded', darkModeClasses.loading.skeleton)}></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div
      className={cn(
        'overflow-x-hidden rounded-lg border p-4 sm:p-6',
        'bg-gradient-to-br from-blue-50 to-purple-50',
        'dark:border-neutral-700 dark:bg-neutral-800 dark:from-blue-950/50 dark:to-purple-950/50',
        'shadow-sm dark:shadow-2xl dark:shadow-neutral-950/50'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div
            className={cn(
              'flex-shrink-0 rounded-full p-2 sm:p-3',
              'border border-blue-200 bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30'
            )}
          >
            <Coins className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium break-words text-neutral-700 sm:text-sm dark:text-neutral-300">
              {t('credits.credit_balance.saldo_crediti')}
            </p>
            {stats.hasUnlimitedCredits ? (
              <div className="mt-1 flex items-center gap-2">
                <Infinity className="h-6 w-6 flex-shrink-0 text-purple-600 sm:h-8 sm:w-8 dark:text-purple-400" />
                <span className="text-xl font-bold break-words text-neutral-900 sm:text-2xl dark:text-neutral-100">
                  Illimitati
                </span>
              </div>
            ) : (
              <p className="mt-1 text-2xl font-bold break-words text-neutral-900 sm:text-3xl dark:text-neutral-100">
                {stats.balance.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {!stats.hasUnlimitedCredits && (
          <Link href="/pricing">
            <Button variant="primary" size="sm" className="flex-shrink-0">
              Acquista
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      {!stats.hasUnlimitedCredits && (
        <div className="mt-4 grid grid-cols-2 gap-3 overflow-x-hidden sm:mt-6 sm:gap-4">
          <div
            className={cn(
              'overflow-x-hidden rounded-lg border p-2 sm:p-3',
              darkModeClasses.card.base,
              'shadow-sm dark:shadow-lg dark:shadow-neutral-950/30'
            )}
          >
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs font-medium break-words text-neutral-700 dark:text-neutral-300">
                Aggiunti
              </span>
            </div>
            <p className="mt-1 text-base font-bold break-words text-neutral-900 sm:text-lg dark:text-neutral-100">
              {stats.totalAdded.toLocaleString()}
            </p>
          </div>
          <div
            className={cn(
              'overflow-x-hidden rounded-lg border p-2 sm:p-3',
              darkModeClasses.card.base,
              'shadow-sm dark:shadow-lg dark:shadow-neutral-950/30'
            )}
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <TrendingDown className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs font-medium break-words text-neutral-700 dark:text-neutral-300">
                Consumati
              </span>
            </div>
            <p className="mt-1 text-base font-bold break-words text-neutral-900 sm:text-lg dark:text-neutral-100">
              {stats.totalConsumed.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Pro badge */}
      {stats.hasUnlimitedCredits && (
        <div
          className={cn(
            'mt-4 overflow-x-hidden rounded-lg border p-3 text-center',
            'border-purple-200 bg-purple-100 dark:border-purple-800 dark:bg-purple-900/30',
            'shadow-sm dark:shadow-lg dark:shadow-purple-950/30'
          )}
        >
          <p className="text-xs font-semibold break-words text-purple-900 sm:text-sm dark:text-purple-200">
            {t('credits.credit_balance.piano_pro_attivo_crediti_illimitati')}
          </p>
        </div>
      )}
    </div>
  );
}
