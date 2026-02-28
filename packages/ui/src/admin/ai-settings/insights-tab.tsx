/**
 * AI Insights Tab
 * Unified analytics and conversations monitoring
 * Consolidates AnalyticsTab + ConversationsTab with internal sub-navigation
 */

'use client';

import { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import { BarChart3, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TabSkeleton } from '../shared';

// Lazy load heavy sub-components
const AnalyticsTab = lazy(() =>
  import('./analytics-tab').then((m) => ({ default: m.AnalyticsTab }))
);
const ConversationsTab = lazy(() =>
  import('./conversations-tab').then((m) => ({ default: m.ConversationsTab }))
);

type InsightSubTab = 'analytics' | 'conversations';

interface InsightsTabProps {
  projectId?: string;
}

export function InsightsTab({ projectId }: InsightsTabProps) {
  const t = useTranslations('admin.aiSettings.insights');
  const [activeSubTab, setActiveSubTab] = useState<InsightSubTab>('analytics');

  const subTabs: { id: InsightSubTab; label: string; icon: typeof BarChart3 }[] = [
    { id: 'analytics', label: t('tabs.analytics'), icon: BarChart3 },
    { id: 'conversations', label: t('tabs.conversations'), icon: MessageSquare },
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
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
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
      >
        <Suspense fallback={<TabSkeleton />}>
          {activeSubTab === 'analytics' && <AnalyticsTab projectId={projectId} />}
          {activeSubTab === 'conversations' && <ConversationsTab />}
        </Suspense>
      </motion.div>
    </div>
  );
}
