'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Coins,
  Gift,
  Calendar,
  TrendingUp,
  ArrowDown,
} from 'lucide-react';
import { AffiliateRewardStatus } from '@giulio-leone/types/client';
import type { AffiliateRewardType } from '@giulio-leone/types/client';

interface AffiliateRewardsTableProps {
  rewards: Array<{
    id: string;
    type: AffiliateRewardType;
    status: AffiliateRewardStatus;
    level: number;
    creditAmount: number;
    currencyAmount: number;
    currencyCode: string | null;
    pendingUntil: Date;
    createdAt: Date;
  }>;
  currencyCode: string | null;
}

export function AffiliateRewardsTable({ rewards, currencyCode }: AffiliateRewardsTableProps) {
  const t = useTranslations('affiliates');

  const [filter, setFilter] = useState<'all' | AffiliateRewardStatus>('all');
  type Reward = AffiliateRewardsTableProps['rewards'][number];

  const formatCurrency = (amount: number, currency: string | null) => {
    if (!currency) {
      return `${amount.toFixed(2)} €`;
    }

    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusIcon = (status: AffiliateRewardStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'CLEARED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-neutral-500 dark:text-neutral-500" />;
    }
  };

  const getStatusColor = (status: AffiliateRewardStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CLEARED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-neutral-50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700';
    }
  };

  const getTypeIcon = (type: AffiliateRewardType) => {
    switch (type) {
      case 'REGISTRATION_CREDIT':
        return <Gift className="h-4 w-4 text-purple-500" />;
      case 'SUBSCRIPTION_COMMISSION':
        return <Coins className="h-4 w-4 text-blue-500" />;
      case 'BONUS':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Gift className="h-4 w-4 text-neutral-500 dark:text-neutral-500" />;
    }
  };

  const getTypeLabel = (type: AffiliateRewardType) => {
    switch (type) {
      case 'REGISTRATION_CREDIT':
        return 'Crediti Registrazione';
      case 'SUBSCRIPTION_COMMISSION':
        return 'Commissione Abbonamento';
      case 'BONUS':
        return 'Bonus Speciale';
      default:
        return type;
    }
  };

  const filteredRewards =
    filter === 'all' ? rewards : rewards.filter((reward: Reward) => reward.status === filter);

  const statusCounts = rewards.reduce<Record<AffiliateRewardStatus, number>>(
    (acc, reward) => {
      acc[reward.status] = (acc[reward.status] || 0) + 1;
      return acc;
    },
    {} as Record<AffiliateRewardStatus, number>
  );

  const totalEarned = rewards
    .filter((r: Reward) => r.status === 'CLEARED')
    .reduce((sum: number, r: Reward) => sum + r.currencyAmount, 0);

  const totalPending = rewards
    .filter((r: Reward) => r.status === 'PENDING')
    .reduce((sum: number, r: Reward) => sum + r.currencyAmount, 0);

  if (rewards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-600 dark:bg-neutral-900">
        <Coins className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600" />
        <h3 className="mt-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {t('affiliates.affiliate_rewards_table.nessuna_reward_guadagnata')}
        </h3>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
          {t('affiliates.affiliate_rewards_table.inizia_a_invitare_amici_per_guadagnare_c')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      {/* Header */}
      <div className="border-b border-neutral-200 p-6 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {t('affiliates.affiliate_rewards_table.le_tue_rewards')}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
              {t('affiliates.affiliate_rewards_table.storico_completo_delle_commissioni_e_cre')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('affiliates.affiliate_rewards_table.totale_liquidato')}
            </p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(totalEarned, currencyCode)}
            </p>
            {totalPending > 0 && (
              <p className="text-xs text-amber-600">
                +{formatCurrency(totalPending, currencyCode)}{' '}
                {t('affiliates.affiliate_rewards_table.in_pending')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('affiliates.affiliate_rewards_table.filtra')}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              {t('affiliates.affiliate_rewards_table.tutti')}
              {rewards.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'PENDING'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              {t('affiliates.affiliate_rewards_table.pending')}
              {statusCounts.PENDING || 0})
            </button>
            <button
              onClick={() => setFilter('CLEARED')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'CLEARED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              {t('affiliates.affiliate_rewards_table.liquidati')}
              {statusCounts.CLEARED || 0})
            </button>
            {statusCounts.CANCELLED > 0 && (
              <button
                onClick={() => setFilter('CANCELLED')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {t('affiliates.affiliate_rewards_table.cancellati')}
                {statusCounts.CANCELLED})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
                Reward
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
                Importo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
                Stato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredRewards.map((reward: Reward) => (
              <tr key={reward.id} className="hover:bg-neutral-50 dark:bg-neutral-800/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{getTypeIcon(reward.type)}</div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {getTypeLabel(reward.type)}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        Livello {reward.level}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {reward.creditAmount > 0 && (
                      <p className="font-medium text-purple-600">{reward.creditAmount} crediti</p>
                    )}
                    {reward.currencyAmount > 0 && (
                      <p className="font-medium text-blue-600">
                        {formatCurrency(reward.currencyAmount, reward.currencyCode)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(reward.status)}
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(reward.status)}`}
                    >
                      {reward.status}
                    </span>
                  </div>
                  {reward.status === 'PENDING' && (
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                      {t('affiliates.affiliate_rewards_table.disponibile_dal')}
                      {reward.pendingUntil.toLocaleDateString('it-IT')}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-neutral-500 dark:text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{reward.createdAt.toLocaleDateString('it-IT')}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800/50">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <span>
            Mostrando {filteredRewards.length} di {rewards.length}{' '}
            {t('affiliates.affiliate_rewards_table.rewards_totali')}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ArrowDown className="h-4 w-4" />
              <span>{t('affiliates.affiliate_rewards_table.esporta_csv')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
