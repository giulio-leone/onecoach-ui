/**
 * Platform Configuration Tab
 * Unified billing and feature flags management
 * Consolidates Billing + Flags sections
 */

'use client';

import { useState, Suspense, lazy, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import { CreditCard, Activity, Users, Zap, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TabSkeleton, StatCard } from '../shared';
import type { CreditPackPricing, PlanPricing } from '@giulio-leone/types/domain';

// Lazy load heavy sub-components
const PlansConfigForm = lazy(() =>
  import('../plans').then((m) => ({ default: m.PlansConfigForm }))
);

type PlatformSubTab = 'billing' | 'flags';

type FlagData = {
  id: string;
  key: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
};

type PlanPricingWithMeta = PlanPricing & { description?: string | null };

interface PlatformTabProps {
  plansStats: {
    plusSubs: number;
    proSubs: number;
    totalRevenue: number;
  };
  creditPacks: CreditPackPricing[];
  featureFlagsData: {
    flags: FlagData[];
    betaUsersCount: number;
    totalMetrics: number;
  };
  stripePlans: {
    plus: PlanPricingWithMeta;
    pro: PlanPricingWithMeta;
  };
}

export function PlatformTab({
  plansStats,
  creditPacks,
  featureFlagsData,
  stripePlans,
}: PlatformTabProps) {
  const t = useTranslations('admin.aiSettings.platform');
  const [activeSubTab, setActiveSubTab] = useState<PlatformSubTab>('billing');

  const enabledFlags = useMemo(
    () => featureFlagsData.flags.filter((f: any) => f.enabled).length,
    [featureFlagsData.flags]
  );

  const subTabs: { id: PlatformSubTab; label: string; icon: typeof CreditCard }[] = [
    { id: 'billing', label: t('tabs.billing'), icon: CreditCard },
    { id: 'flags', label: t('tabs.flags'), icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2">
        {subTabs.map((tab: any) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5',
                'text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-500 shadow-primary-500/20 text-white shadow-lg'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08]'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeSubTab === 'billing' && (
          <div className="space-y-6">
            {/* Billing Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label={t('billing.plus')}
                value={plansStats.plusSubs}
                icon={Users}
                color="blue"
                delay={0}
              />
              <StatCard
                label={t('billing.pro')}
                value={plansStats.proSubs}
                icon={Zap}
                color="violet"
                delay={0.05}
              />
              <StatCard
                label={t('billing.revenue')}
                value={`€${plansStats.totalRevenue.toFixed(0)}`}
                icon={BarChart3}
                color="emerald"
                delay={0.1}
              />
              <StatCard
                label={t('billing.total')}
                value={plansStats.plusSubs + plansStats.proSubs}
                icon={Activity}
                color="amber"
                delay={0.15}
              />
            </div>

            {/* Plans Config */}
            <div
              className={cn(
                'rounded-2xl p-6',
                'bg-white/60 dark:bg-white/[0.05]',
                'backdrop-blur-xl',
                'border border-neutral-200/50 dark:border-white/[0.08]'
              )}
            >
              <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">
                {t('billing.plansConfig')}
              </h3>
              <Suspense fallback={<TabSkeleton />}>
                <PlansConfigForm plans={stripePlans} creditPacks={creditPacks} />
              </Suspense>
            </div>
          </div>
        )}

        {activeSubTab === 'flags' && (
          <div className="space-y-6">
            {/* Flags Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                label={t('flags.enabled')}
                value={enabledFlags}
                icon={Activity}
                color="emerald"
                delay={0}
              />
              <StatCard
                label={t('flags.total')}
                value={featureFlagsData.flags.length}
                icon={Activity}
                color="neutral"
                delay={0.05}
              />
              <StatCard
                label={t('flags.betaUsers')}
                value={featureFlagsData.betaUsersCount}
                icon={Users}
                color="violet"
                delay={0.1}
              />
            </div>

            {/* Flags Grid */}
            <div
              className={cn(
                'rounded-2xl p-6',
                'bg-white/60 dark:bg-white/[0.05]',
                'backdrop-blur-xl',
                'border border-neutral-200/50 dark:border-white/[0.08]'
              )}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {featureFlagsData.flags.map((flag, index) => (
                  <motion.div
                    key={flag.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'rounded-xl p-4 transition-all duration-200',
                      'border',
                      flag.enabled
                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20'
                        : 'border-neutral-200/50 bg-neutral-50/50 dark:border-white/[0.08] dark:bg-white/[0.05]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm font-medium text-neutral-900 dark:text-white">
                          {flag.key}
                        </p>
                        {flag.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                            {flag.description}
                          </p>
                        )}
                      </div>
                      <div
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                          flag.enabled
                            ? 'bg-emerald-500 text-white'
                            : 'bg-neutral-300 text-neutral-600 dark:bg-white/[0.10] dark:text-neutral-300'
                        )}
                      >
                        {flag.enabled ? t('flags.on') : t('flags.off')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
