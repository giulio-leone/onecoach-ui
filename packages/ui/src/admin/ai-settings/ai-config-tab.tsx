/**
 * AI Configuration Tab
 * Unified AI behavior configuration
 * Consolidates FrameworkTab + OperationsTab + Edge Config
 */

'use client';

import { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import { Wand2, Zap, Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TabSkeleton } from '../shared';
import type { FrameworkConfig, AIModel } from './types';

// Lazy load heavy sub-components
const FrameworkTab = lazy(() =>
  import('./framework-tab').then((m) => ({ default: m.FrameworkTab }))
);
const OperationsTab = lazy(() =>
  import('./operations-tab').then((m) => ({ default: m.OperationsTab }))
);
const EdgeConfigPanel = lazy(() =>
  import('../edge-config-panel').then((m) => ({ default: m.EdgeConfigPanel }))
);

type ConfigSubTab = 'framework' | 'operations' | 'edge';

interface AIConfigTabProps {
  frameworkConfigs: FrameworkConfig[];
  models: AIModel[];
  onFrameworkConfigsChange: (configs: FrameworkConfig[]) => void;
}

export function AIConfigTab({
  frameworkConfigs,
  models,
  onFrameworkConfigsChange,
}: AIConfigTabProps) {
  const t = useTranslations('admin.aiSettings.aiConfig');
  const [activeSubTab, setActiveSubTab] = useState<ConfigSubTab>('framework');

  const subTabs: { id: ConfigSubTab; label: string; icon: typeof Wand2; description: string }[] = [
    {
      id: 'framework',
      label: t('tabs.framework'),
      icon: Wand2,
      description: t('tabs.frameworkDesc'),
    },
    {
      id: 'operations',
      label: t('tabs.operations'),
      icon: Zap,
      description: t('tabs.operationsDesc'),
    },
    {
      id: 'edge',
      label: t('tabs.edge'),
      icon: Settings2,
      description: t('tabs.edgeDesc'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation - card style */}
      <div className="grid gap-3 sm:grid-cols-3">
        {subTabs.map((tab: any) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                'flex items-start gap-3 rounded-xl p-4 text-left transition-all duration-200',
                'border',
                isActive
                  ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-500/10'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p
                  className={cn(
                    'font-semibold',
                    isActive
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-neutral-900 dark:text-white'
                  )}
                >
                  {tab.label}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab content with lazy loading */}
      <motion.div
        key={activeSubTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'rounded-2xl',
          'bg-white/60 dark:bg-neutral-800/60',
          'backdrop-blur-xl',
          'border border-neutral-200/50 dark:border-white/[0.08]',
          'p-6'
        )}
      >
        <Suspense fallback={<TabSkeleton />}>
          {activeSubTab === 'framework' && (
            <FrameworkTab
              frameworkConfigs={frameworkConfigs}
              onFrameworkConfigsChange={onFrameworkConfigsChange}
            />
          )}
          {activeSubTab === 'operations' && <OperationsTab models={models} />}
          {activeSubTab === 'edge' && <EdgeConfigPanel />}
        </Suspense>
      </motion.div>
    </div>
  );
}
