'use client';

import { useTranslations } from 'next-intl';
/**
 * Coach Dashboard Stats Component
 *
 * Display overview statistics for coach dashboard
 */
import { LoadingIndicator, StatCard } from '@giulio-leone/ui';
import { TrendingUp, DollarSign, Star, Package } from 'lucide-react';
import type { CoachDashboardStats as CoachDashboardStatsType } from '@giulio-leone/features-coach/hooks';

interface CoachDashboardStatsProps {
  stats: CoachDashboardStatsType | null;
  isLoading?: boolean;
}
export function CoachDashboardStats({ stats, isLoading }: CoachDashboardStatsProps) {
  const t = useTranslations('coach');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex h-32 items-center justify-center rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
          >
            <LoadingIndicator />
          </div>
        ))}
      </div>
    );
  }
  if (!stats) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={t('coach_dashboard_stats.vendite_totali')}
        value={stats.totalSales}
        icon={TrendingUp}
        color="from-blue-500 to-blue-600"
        subtitle={`${stats.publishedPlans} piani pubblicati`}
      />
      <StatCard
        label={t('coach_dashboard_stats.revenue_totale')}
        value={`€${stats.totalRevenue.toFixed(2)}`}
        icon={DollarSign}
        color="from-green-500 to-green-600"
        subtitle="70% commissione"
      />
      <StatCard
        label={t('coach_dashboard_stats.rating_medio')}
        value={stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
        icon={Star}
        color="from-yellow-500 to-yellow-600"
        subtitle={`${stats.totalReviews} recensioni`}
      />
      <StatCard
        label={t('coach_dashboard_stats.piani_totali')}
        value={stats.totalPlans}
        icon={Package}
        color="from-purple-500 to-purple-600"
        subtitle={`${stats.draftPlans} in bozza`}
      />
    </div>
  );
}
