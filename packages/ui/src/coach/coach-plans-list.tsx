'use client';

import { useTranslations } from 'next-intl';
/**
 * Coach Plans List Component
 *
 * Display list of published plans from a coach
 */

import {
  MarketplacePlanCard,
  type MarketplacePlanCardProps,
} from '@giulio-leone/ui';
import { EmptyState } from '@giulio-leone/ui';
import { Package } from 'lucide-react';

interface CoachPlansListProps {
  plans: MarketplacePlanCardProps[];
}

export function CoachPlansList({ plans }: CoachPlansListProps) {
  const t = useTranslations('coach');

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={t('coach.coach_plans_list.nessun_piano_pubblicato')}
        description={t('coach.coach_plans_list.questo_coach_non_ha_ancora_pubblicato_pi')}
      />
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">
        {t('coach.coach_plans_list.piani_pubblicati')}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan: any) => (
          <MarketplacePlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
