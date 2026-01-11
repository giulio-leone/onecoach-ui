'use client';

import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Coins,
  Gift,
  Target,
  type LucideIcon,
} from 'lucide-react';

interface AffiliateStatsCardProps {
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    cancelledReferrals: number;
    pendingRewards: number;
    clearedRewards: number;
    lifetimeCreditsEarned: number;
    lifetimeCurrencyEarned: number;
    pendingCredits: number;
    pendingCurrency: number;
    currencyCode: string | null;
  };
  programSettings: {
    maxLevels: number;
    pendingDays: number;
    graceDays: number;
  } | null;
}

export function AffiliateStatsCard({
  stats, programSettings }: AffiliateStatsCardProps) {
  type Metric = {
    title: string;
    value: string;
    subtitle: string;
    icon: LucideIcon;
    color?: string;
    bgColor?: string;
  };
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

  const mainMetrics: Metric[] = [
    {
      title: 'Referral Totali',
      value: stats.totalReferrals.toString(),
      icon: Users,
      subtitle: `${stats.activeReferrals} attivi`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Commissioni Liquidate',
      value: formatCurrency(stats.lifetimeCurrencyEarned, stats.currencyCode),
      icon: Coins,
      subtitle: `${stats.clearedRewards} pagamenti`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Crediti Guadagnati',
      value: stats.lifetimeCreditsEarned.toString(),
      icon: Gift,
      subtitle: `${stats.pendingCredits} in pending`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Reward Pendenti',
      value: stats.pendingRewards.toString(),
      icon: Clock,
      subtitle: `${formatCurrency(stats.pendingCurrency, stats.currencyCode)} in attesa`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  const secondaryMetrics: Metric[] = [
    {
      title: 'Tasso Conversione',
      value:
        stats.totalReferrals > 0
          ? `${((stats.activeReferrals / stats.totalReferrals) * 100).toFixed(1)}%`
          : '0%',
      icon: Target,
      subtitle: 'Attivi / Totali',
    },
    {
      title: 'Livelli Disponibili',
      value: programSettings?.maxLevels?.toString() || '1',
      icon: TrendingUp,
      subtitle: 'Multi-tier support',
    },
    {
      title: 'Periodo Pending',
      value: `${programSettings?.pendingDays || 14} giorni`,
      icon: CheckCircle,
      subtitle: 'Prima del pagamento',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainMetrics.map((metric) => (
          <div
            key={metric.title}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
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
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{metric.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {secondaryMetrics.map((metric) => (
          <div
            key={metric.title}
            className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
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
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{metric.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
