/**
 * Coach Analytics Charts Component
 *
 * Display analytics charts for coach (sales, revenue, rating, top plans)
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import {
  AnalyticsChart as ProgressChart,
  type AnalyticsChartDataPoint as ChartDataPoint,
} from '@giulio-leone/ui-analytics';
import { LoadingIndicator } from '@giulio-leone/ui';
import { logger } from '@giulio-leone/lib-shared';

export type Period = '7d' | '30d' | '90d' | '1y';

interface CoachAnalyticsChartsProps {
  userId: string;
  period?: Period;
}

export function CoachAnalyticsCharts({ userId, period = '30d' }: CoachAnalyticsChartsProps) {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const [salesData, setSalesData] = useState<ChartDataPoint[]>([]);
  const [revenueData, setRevenueData] = useState<ChartDataPoint[]>([]);
  const [ratingData, setRatingData] = useState<ChartDataPoint[]>([]);
  const [topPlansData, setTopPlansData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [salesRes, revenueRes, ratingRes, topPlansRes] = await Promise.all([
          fetch(`/api/coach/analytics/sales?period=${period}`),
          fetch(`/api/coach/analytics/revenue?period=${period}`),
          fetch(`/api/coach/analytics/rating?period=${period}`),
          fetch(`/api/coach/analytics/top-plans`),
        ]);

        if (salesRes.ok) {
          const sales = await salesRes.json();
          setSalesData(
            sales.trends.map((t: { date: string; sales: number }) => ({
              date: t.date,
              vendite: t.sales,
            }))
          );
        }

        if (revenueRes.ok) {
          const revenue = await revenueRes.json();
          setRevenueData(
            revenue.trends.map((t: { date: string; revenue: number }) => ({
              date: t.date,
              revenue: t.revenue,
            }))
          );
        }

        if (ratingRes.ok) {
          const rating = await ratingRes.json();
          setRatingData(
            rating.trends.map((t: { date: string; rating: number | null }) => ({
              date: t.date,
              rating: t.rating || 0,
            }))
          );
        }

        if (topPlansRes.ok) {
          const topPlans = await topPlansRes.json();
          setTopPlansData(
            topPlans.plans.map((p: { title: string; sales: number }) => ({
              date: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
              vendite: p.sales,
            }))
          );
        }
      } catch (err: unknown) {
        logger.error(tCommon('error'), err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, userId, t]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex h-80 items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
          >
            <LoadingIndicator />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Sales Chart */}
      <ProgressChart
        data={salesData}
        type="line"
        title={t('coach.coach_analytics_charts.vendite_nel_tempo')}
        xLabel="Data"
        yLabel="Vendite"
        datasets={[{ label: 'Vendite', dataKey: 'vendite', color: '#3b82f6' }]}
      />

      {/* Revenue Chart */}
      <ProgressChart
        data={revenueData}
        type="area"
        title={t('coach.coach_analytics_charts.revenue_nel_tempo')}
        xLabel="Data"
        yLabel="Revenue (€)"
        datasets={[{ label: 'Revenue', dataKey: 'revenue', color: '#10b981' }]}
      />

      {/* Rating Chart */}
      <ProgressChart
        data={ratingData}
        type="line"
        title={t('coach.coach_analytics_charts.rating_trends')}
        xLabel="Data"
        yLabel="Rating"
        datasets={[{ label: 'Rating Medio', dataKey: 'rating', color: '#f59e0b' }]}
      />

      {/* Top Plans Chart */}
      <ProgressChart
        data={topPlansData}
        type="bar"
        title={t('coach.coach_analytics_charts.top_piani_piu_venduti')}
        xLabel="Piano"
        yLabel="Vendite"
        datasets={[{ label: 'Vendite', dataKey: 'vendite', color: '#8b5cf6' }]}
      />
    </div>
  );
}
