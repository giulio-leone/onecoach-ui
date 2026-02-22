'use client';

import { useTranslations } from 'next-intl';
/**
 * Credit History Component
 *
 * Storico transazioni crediti
 */

import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { TransactionItem } from '@giulio-leone/ui';
import { useCreditsHistory } from '@giulio-leone/lib-api/hooks';

interface CreditHistoryProps {
  limit?: number;
}

export function CreditHistory({ limit = 10 }: CreditHistoryProps) {
  const t = useTranslations('common');

  const { data, isLoading } = useCreditsHistory(limit);
  const transactions = data?.transactions || [];

  if (isLoading) {
    return (
      <div className={cn(darkModeClasses.transaction.container, 'p-4 sm:p-6')}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div
                className={cn(
                  'h-10 w-10 flex-shrink-0 rounded-full',
                  darkModeClasses.loading.skeleton
                )}
              ></div>
              <div className="min-w-0 flex-1">
                <div className={cn('h-4 w-32 rounded', darkModeClasses.loading.skeleton)}></div>
                <div
                  className={cn('mt-2 h-3 w-48 rounded', darkModeClasses.loading.skeleton)}
                ></div>
              </div>
              <div
                className={cn('h-6 w-16 flex-shrink-0 rounded', darkModeClasses.loading.skeleton)}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={cn(darkModeClasses.emptyState.container)}>
        <Clock className={cn(darkModeClasses.emptyState.icon)} />
        <p className={cn(darkModeClasses.emptyState.text)}>
          {t('credits.credit_history.nessuna_transazione_ancora')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(darkModeClasses.transaction.container)}>
      <div className={cn(darkModeClasses.transaction.header)}>
        <h3 className="text-base font-semibold break-words text-neutral-900 sm:text-lg dark:text-neutral-100">
          {t('credits.credit_history.storico_transazioni')}
        </h3>
      </div>

      <div className={cn(darkModeClasses.list.container)}>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            icon={transaction.amount > 0 ? ArrowUpRight : ArrowDownRight}
            iconVariant={transaction.amount > 0 ? 'success' : 'error'}
            title={transaction.description}
            subtitle={new Date(transaction.createdAt).toLocaleString('it-IT', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            amount={transaction.amount}
            showBalance={false}
          />
        ))}
      </div>
    </div>
  );
}
