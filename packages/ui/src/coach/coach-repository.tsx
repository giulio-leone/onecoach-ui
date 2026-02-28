/**
 * Coach Repository Component
 *
 * Display and manage coach's plans repository
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { CoachPlanCard, type CoachPlanCardProps } from './coach-plan-card';
import { EmptyState, Button } from '@giulio-leone/ui';
import { Filter, Plus, Package } from 'lucide-react';
import { useCoachDashboardPlans } from '@giulio-leone/features/coach/hooks';
import type { MarketplacePlanCardProps } from '@giulio-leone/features/coach/hooks';
import { LoadingState, ErrorState } from '@giulio-leone/ui/components';
import { useTranslations } from 'next-intl';
import type { MarketplacePlanType } from "@giulio-leone/types/client";

interface CoachRepositoryProps {
  onPlanPublish?: (id: string) => Promise<void>;
  onPlanUnpublish?: (id: string) => Promise<void>;
  onPlanDelete?: (id: string) => Promise<void>;
}

export function CoachRepository({
  onPlanPublish,
  onPlanUnpublish,
  onPlanDelete,
}: CoachRepositoryProps) {
  const t = useTranslations('common');
  const tCoach = useTranslations('coach');
  const [filters, setFilters] = useState<{
    planType?: MarketplacePlanType;
    isPublished?: boolean;
  }>({});
  const [page, setPage] = useState(1);
  const previousFiltersRef = useRef(filters);
  const loadedPagesRef = useRef<Map<number, MarketplacePlanCardProps[]>>(new Map());

  // Reset page and loaded pages when filters change
  // This is a valid use case for setState in effect (resetting pagination on filter change)
  useEffect(() => {
    const filtersKey = JSON.stringify(filters);
    const previousFiltersKey = JSON.stringify(previousFiltersRef.current);
    if (filtersKey !== previousFiltersKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(1);
      loadedPagesRef.current.clear();
      previousFiltersRef.current = filters;
    }
  }, [filters]);

  // Fetch plans using React Query
  const {
    data: plansData,
    isLoading,
    error,
    refetch,
  } = useCoachDashboardPlans({
    planType: filters.planType,
    isPublished: filters.isPublished,
    page,
    limit: 12,
  });

  // Store loaded page data
  useEffect(() => {
    if (plansData?.plans && !loadedPagesRef.current.has(page)) {
      loadedPagesRef.current.set(page, plansData.plans);
    }
  }, [plansData, page]);

  // Accumulate plans from all loaded pages
  // This is a valid use case for setState in effect (accumulating paginated data)
  const [accumulatedPlans, setAccumulatedPlans] = useState<CoachPlanCardProps[]>([]);
  useEffect(() => {
    const sortedPages = Array.from(loadedPagesRef.current.keys()).sort((a, b) => a - b);
    const allPlans = sortedPages.flatMap(
      (pageNum) => loadedPagesRef.current.get(pageNum) || []
    ) as CoachPlanCardProps[];
    setAccumulatedPlans(allPlans);
  }, [plansData, page]);
  const plans = accumulatedPlans;
  const hasMore = plansData?.hasMore ?? false;

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleRefetch = () => {
    setPage(1);
    loadedPagesRef.current.clear();
    refetch();
  };

  const handlePublish = async (id: string) => {
    if (onPlanPublish) {
      await onPlanPublish(id);
    }
  };

  const handleUnpublish = async (id: string) => {
    if (onPlanUnpublish) {
      await onPlanUnpublish(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (onPlanDelete) {
      await onPlanDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-neutral-500 dark:text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {tCoach('repository.filters')}:
          </span>
        </div>

        <select
          value={filters.planType || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFilters((prev) => ({
              ...prev,
              planType: e.target.value ? (e.target.value as MarketplacePlanType) : undefined,
            }))
          }
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-zinc-950"
        >
          <option value="">{tCoach('repository.allTypes')}</option>
          <option value="WORKOUT">{tCoach('repository.workout')}</option>
          <option value="NUTRITION">{tCoach('repository.nutrition')}</option>
        </select>

        <select
          value={filters.isPublished === undefined ? '' : filters.isPublished ? 'true' : 'false'}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFilters((prev) => ({
              ...prev,
              isPublished: e.target.value === '' ? undefined : e.target.value === 'true',
            }))
          }
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-zinc-950"
        >
          <option value="">{tCoach('repository.allStatuses')}</option>
          <option value="true">{tCoach('repository.published')}</option>
          <option value="false">{tCoach('repository.drafts')}</option>
        </select>

        <div className="ml-auto">
          <Button variant="primary" size="sm" icon={Plus}>
            {tCoach('repository.newPlan')}
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      {isLoading && page === 1 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingState message={tCoach('repository.loadingPlans')} size="lg" />
        </div>
      ) : error ? (
        <ErrorState
          error={error instanceof Error ? error : new Error(t('errors.loadingError'))}
          title={tCoach('repository.errorLoadingPlans')}
          action={
            <Button onClick={handleRefetch} variant="secondary">
              {t('actions.retry')}
            </Button>
          }
        />
      ) : plans.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={Package}
            title={tCoach('repository.noPlanFound')}
            description={tCoach('repository.createFirstPlan')}
          />
          <div className="flex justify-center">
            <Button variant="primary" icon={Plus}>
              {tCoach('repository.createPlan')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan: any) => (
              <CoachPlanCard
                key={plan.id}
                {...plan}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t('common.loading')}
                  </>
                ) : (
                  tCoach('repository.loadMore')
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
