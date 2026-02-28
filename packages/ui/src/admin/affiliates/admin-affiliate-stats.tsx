'use client';

import { useTranslations } from 'next-intl';

import { Users, TrendingUp, Clock, Coins, Gift, Target, Activity } from 'lucide-react';
import { formatCurrency } from '@giulio-leone/lib-shared';

type AffiliateProgram = {
  name: string;
  baseCommissionRate: number | string;
  registrationCredit: number;
  maxLevels: number;
  rewardPendingDays: number;
  subscriptionGraceDays: number;
};

interface AdminAffiliateStatsProps {
  stats: {
    totalAffiliates: number;
    activeAffiliates: number;
    newAffiliatesThisMonth: number;
    totalReferrals: number;
    activeReferrals: number;
    totalRewards: number;
    pendingRewards: number;
    clearedRewards: number;
    totalPayoutAmount: number;
    pendingPayoutAmount: number;
  };
  program?: AffiliateProgram | null;
}

export function AdminAffiliateStats({ stats, program }: AdminAffiliateStatsProps) {
  const t = useTranslations('admin');


  const formatPercent = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const mainMetrics = [
    {
      title: 'Affiliati Totali',
      value: stats.totalAffiliates.toString(),
      icon: Users,
      subtitle: `${stats.activeAffiliates} attivi (${formatPercent(stats.activeAffiliates, stats.totalAffiliates)})`,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      trend: stats.newAffiliatesThisMonth > 0 ? ('up' as const) : undefined,
    },
    {
      title: 'Referral Totali',
      value: stats.totalReferrals.toString(),
      icon: TrendingUp,
      subtitle: `${stats.activeReferrals} attivi (${formatPercent(stats.activeReferrals, stats.totalReferrals)})`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Reward Liquidate',
      value: formatCurrency(stats.totalPayoutAmount),
      icon: Coins,
      subtitle: `${stats.clearedRewards} pagamenti effettuati`,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      title: 'Payout Pending',
      value: formatCurrency(stats.pendingPayoutAmount),
      icon: Clock,
      subtitle: `${stats.pendingRewards} in attesa di approvazione`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  type MainMetric = (typeof mainMetrics)[number];

  const secondaryMetrics = [
    {
      title: 'Tasso Attivazione',
      value: formatPercent(stats.activeAffiliates, stats.totalAffiliates),
      icon: Target,
      subtitle: 'Affiliati attivi / totali',
    },
    {
      title: 'Conversione Referral',
      value: formatPercent(stats.activeReferrals, stats.totalReferrals),
      icon: Activity,
      subtitle: 'Referral attivi / totali',
    },
    {
      title: 'Reward per Affiliato',
      value:
        stats.totalAffiliates > 0 ? (stats.totalRewards / stats.totalAffiliates).toFixed(1) : '0',
      icon: Gift,
      subtitle: 'Media reward per affiliato',
    },
  ];

  type SecondaryMetric = (typeof secondaryMetrics)[number];

  const programInfo: Array<{ label: string; value: string }> = program
    ? [
        {
          label: 'Nome Programma',
          value: program.name,
        },
        {
          label: 'Commissione Base',
          value: `${(Number(program.baseCommissionRate) * 100).toFixed(1)}%`,
        },
        {
          label: 'Crediti Registrazione',
          value: program.registrationCredit.toString(),
        },
        {
          label: 'Livelli Supportati',
          value: program.maxLevels.toString(),
        },
        {
          label: 'Periodo Pending',
          value: `${program.rewardPendingDays} giorni`,
        },
        {
          label: 'Grace Period',
          value: `${program.subscriptionGraceDays} giorni`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <section aria-label="Metriche principali">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mainMetrics.map((metric: MainMetric) => (
            <div
              key={metric.title}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-500">
                    {metric.title}
                  </p>
                  <p className="mt-1 text-lg font-bold text-neutral-900 sm:text-xl dark:text-neutral-100">
                    {metric.value}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {metric.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary Metrics */}
      <section aria-label="Metriche secondarie">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryMetrics.map((metric: SecondaryMetric) => (
            <div
              key={metric.title}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-950"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/50">
                  <metric.icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-500">
                    {metric.title}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {metric.value}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {metric.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Program Information */}
      {programInfo.length > 0 && (
        <section
          aria-label="Informazioni programma"
          className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-white/[0.08] dark:bg-zinc-950"
        >
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {t('admin.admin_affiliate_stats.impostazioni_programma_attuale')}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programInfo.map((info: any) => (
              <div
                key={info.label}
                className="flex items-center justify-between border-b border-neutral-100 py-2"
              >
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {info.label}
                </span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {info.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
