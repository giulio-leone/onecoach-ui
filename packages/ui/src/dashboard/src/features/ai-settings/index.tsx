/**
 * AI Settings Page Client Component
 *
 * Dashboard completa per la gestione di Chat AI, Copilot e Framework Agentico
 * - Tab-based navigation (mobile-first)
 * - Models, Features, Framework, Copilot, Analytics, Conversations
 * - Realtime Supabase subscriptions
 */

'use client';

import { useCallback, useEffect, useMemo, useState, Suspense, lazy } from 'react';
import type React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { UserRole } from '@prisma/client';
import {
  Sparkles,
  Users,
  Shield,
  Zap,
  Bot,
  Activity,
  CreditCard,
  FileText,
  Wand2,
  Settings,
  BarChart3,
  MessageSquare,
  Layers,
  ChevronRight,
  Database,
} from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { toast } from 'sonner';
import { STRIPE_PLANS } from '@giulio-leone/lib-core/stripe/config';
import type { ProviderName } from '@giulio-leone/lib-ai';
import {
  ModelsTab,
  FeaturesTab,
  FrameworkTab,
  OperationsTab,
  CopilotTab,
  AnalyticsTab,
  ConversationsTab,
} from './components';
import type { AIModel, FeatureConfig, ModelAccess, FrameworkConfig } from './components/types';
import type { AgentConfig } from '../shared/ai-agents-config';
import { useHeaderActions } from '@giulio-leone/lib-stores/header-actions.store';

import { logger } from '@giulio-leone/lib-shared';
import type { CreditPackPricing } from '@giulio-leone/types/domain';

const ProviderApiKeysSection = lazy(() =>
  import('../shared/provider-api-keys').then((m) => ({
    default: m.ProviderApiKeysSection,
  }))
);
const VisionModelsConfig = lazy(() =>
  import('../shared/vision-models-config').then((m) => ({
    default: m.VisionModelsConfig,
  }))
);
const PlansConfigForm = lazy(() =>
  import('../billing/components/plans-config-form').then((m) => ({
    default: m.PlansConfigForm,
  }))
);
const EdgeConfigPanel = lazy(() =>
  import('../shared/edge-config-panel').then((m) => ({ default: m.EdgeConfigPanel }))
);
const AIAgentsConfig = lazy(() =>
  import('../shared/ai-agents-config').then((m) => ({ default: m.AIAgentsConfig }))
);
const ImportModelsConfig = lazy(() =>
  import('../shared/import-models-config').then((m) => ({
    default: m.ImportModelsConfig,
  }))
);

type ProviderConfig = {
  provider: ProviderName;
  label: string;
  maskedKey: string;
  hasKey: boolean;
  isEnabled: boolean;
  env: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  defaultModel: string | null;
  defaultProvider: string | null;
  metadata?: Record<string, unknown> | null;
};

type FlagData = {
  id: string;
  key: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
};

interface AISettingsPageClientProps {
  models: AIModel[];
  featureConfigs: FeatureConfig[];
  modelAccess: ModelAccess[];
  frameworkConfigs?: FrameworkConfig[];
  providerConfigs: ProviderConfig[];
  aiFrameworkConfigs: AgentConfig[];
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
  databaseStats: {
    usersCount: number;
    exercisesCount: number;
    foodsCount: number;
  };
  userStats: {
    totalUsers: number;
    adminCount: number;
    coachCount: number;
    userCount: number;
  };
  initialSection?: string;
  onToggleAgent: (
    agentId: string,
    isEnabled: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdateRetry: (count: number) => Promise<{ success: boolean; error?: string }>;
}

type SectionId =
  | 'overview'
  | 'models'
  | 'features'
  | 'prompts'
  | 'framework'
  | 'operations'
  | 'copilot'
  | 'billing'
  | 'flags'
  | 'edge'
  | 'analytics'
  | 'conversations';

function isSection(value: string | undefined): value is SectionId {
  const sectionIds: SectionId[] = [
    'overview',
    'models',
    'features',
    'prompts',
    'framework',
    'operations',
    'copilot',
    'billing',
    'flags',
    'edge',
    'analytics',
    'conversations',
  ];
  return sectionIds.includes(value as SectionId);
}

function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="from-primary-500/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br to-violet-500/10">
              <Icon className="text-primary-600 dark:text-primary-400 h-5 w-5" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{title}</h2>
            {description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl',
          'bg-white/60 dark:bg-white/[0.05]',
          'backdrop-blur-xl',
          'border border-neutral-200/50 dark:border-white/[0.08]',
          'shadow-lg shadow-neutral-900/5 dark:shadow-neutral-900/20',
          'overflow-hidden'
        )}
      >
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

export function AISettingsPageClient({
  models: initialModels,
  featureConfigs: initialFeatureConfigs,
  modelAccess: initialModelAccess,
  frameworkConfigs: initialFrameworkConfigs = [],
  providerConfigs,
  aiFrameworkConfigs,
  plansStats,
  creditPacks,
  featureFlagsData,
  databaseStats,
  userStats,
  initialSection,
  onToggleAgent,
  onUpdateRetry,
}: AISettingsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setHeaderActions = useHeaderActions((state) => state.setActions);
  const t = useTranslations('admin.aiSettings');
  const tAdmin = useTranslations('admin');

  const sections: {
    id: SectionId;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = useMemo(
    () => [
      {
        id: 'overview',
        label: t('sections.overview.label'),
        description: t('sections.overview.description'),
        icon: Sparkles,
      },
      {
        id: 'models',
        label: t('sections.models.label'),
        description: t('sections.models.description'),
        icon: Bot,
      },
      {
        id: 'features',
        label: t('sections.features.label'),
        description: t('sections.features.description'),
        icon: Settings,
      },
      {
        id: 'prompts',
        label: t('sections.prompts.label'),
        description: t('sections.prompts.description'),
        icon: FileText,
      },
      {
        id: 'framework',
        label: t('sections.framework.label'),
        description: t('sections.framework.description'),
        icon: Wand2,
      },
      {
        id: 'operations',
        label: t('sections.operations.label'),
        description: t('sections.operations.description'),
        icon: Zap,
      },
      {
        id: 'copilot',
        label: t('sections.copilot.label'),
        description: t('sections.copilot.description'),
        icon: Layers,
      },
      {
        id: 'billing',
        label: t('sections.billing.label'),
        description: t('sections.billing.description'),
        icon: CreditCard,
      },
      {
        id: 'flags',
        label: t('sections.flags.label'),
        description: t('sections.flags.description'),
        icon: Activity,
      },
      {
        id: 'edge',
        label: t('sections.edge.label'),
        description: t('sections.edge.description'),
        icon: Zap,
      },
      {
        id: 'analytics',
        label: t('sections.analytics.label'),
        description: t('sections.analytics.description'),
        icon: BarChart3,
      },
      {
        id: 'conversations',
        label: t('sections.conversations.label'),
        description: t('sections.conversations.description'),
        icon: MessageSquare,
      },
    ],
    [t]
  );

  const defaultSection: SectionId = isSection(initialSection) ? initialSection : 'overview';
  const [activeSection, setActiveSection] = useState<SectionId>(defaultSection);
  const [models, setModels] = useState(initialModels);
  const [featureConfigs, setFeatureConfigs] = useState(initialFeatureConfigs);
  const [modelAccess, setModelAccess] = useState(initialModelAccess);
  const [frameworkConfigs, setFrameworkConfigs] = useState(initialFrameworkConfigs);

  // Sync state with props (Realtime updates via router.refresh())
  useEffect(() => {
    setModels(initialModels);
  }, [initialModels]);

  useEffect(() => {
    setFeatureConfigs(initialFeatureConfigs);
  }, [initialFeatureConfigs]);

  useEffect(() => {
    setModelAccess(initialModelAccess);
  }, [initialModelAccess]);

  const activeModels = models.filter((m: any) => m.isActive).length;
  const activeFeatures = featureConfigs.filter((f: any) => f.isEnabled).length;
  const enabledProviders = providerConfigs.filter((p: any) => p.hasKey).length;
  const enabledFlags = featureFlagsData.flags.filter((f: any) => f.enabled).length;

  useEffect(() => {
    setHeaderActions(
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        <Sparkles className="text-primary-500 h-4 w-4" />
        <span>{tAdmin('navigation.aiSettings')}</span>
      </div>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions, tAdmin]);

  useEffect(() => {
    const sectionFromQuery = searchParams?.get('section') || undefined;
    if (isSection(sectionFromQuery) && sectionFromQuery !== activeSection) {
      setActiveSection(sectionFromQuery);
    }
  }, [searchParams, activeSection]);

  const handleSectionChange = useCallback(
    (section: SectionId) => {
      setActiveSection(section);
      const params = new URLSearchParams(searchParams?.toString());
      if (section === 'overview') {
        params.delete('section');
      } else {
        params.set('section', section);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: true });
    },
    [pathname, router, searchParams]
  );

  const handleUpdateModelAccess = useCallback(
    async (modelId: string, role: string, canSelect: boolean) => {
      // Optimistic update
      setModelAccess((prev) => {
        const existing = prev.find((a: any) => a.modelId === modelId && a.role === role);
        if (existing) {
          return prev.map((a: any) => (a.id === existing.id ? { ...a, canSelect } : a));
        }
        const modelName = models.find((m: any) => m.id === modelId)?.displayName || '';
        return [
          ...prev,
          { id: `temp-${Date.now()}`, modelId, role: role as UserRole, canSelect, modelName },
        ];
      });

      try {
        const response = await fetch('/api/admin/ai-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateModelAccess',
            data: { modelId, role, canSelect },
          }),
        });
        if (!response.ok) throw new Error('Failed to update access');
      } catch (error) {
        logger.error('Update access failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        toast.error(t('models.access.updateError'));
        setModelAccess(initialModelAccess); // Revert
      }
    },
    [models, initialModelAccess, t]
  );

  const handleUpdateModel = useCallback(
    async (modelId: string, data: Partial<AIModel>) => {
      // Optimistic update
      setModels((prev) =>
        prev.map((m: any) => {
          if (m.id === modelId) return { ...m, ...data };
          if (data.isDefault) return { ...m, isDefault: false }; // Unset default for others
          return m;
        })
      );

      try {
        // Standard update (PUT handles default exclusivity now)
        const response = await fetch('/api/admin/ai-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            models: [{ id: modelId, ...data }],
          }),
        });
        if (!response.ok) throw new Error('Failed to update model');
        // No toast needed for autosave unless error
      } catch (error) {
        logger.error('Update failed:', {
          error: error instanceof Error ? error.message : String(error),
        });
        toast.error(t('features.updateError'));
        // Revert optimistic update (optional but recommended)
        // For simplicity/speed we rely on router.refresh() from Realtime eventually correcting it,
        // or a manual refresh. Ideally we should revert here.
        setModels(initialModels); // Re-sync with server state on error
      }
    },
    [initialModels, t]
  );

  const handleUpdateFeature = useCallback(
    async (featureId: string, data: Partial<FeatureConfig>) => {
      // Optimistic update
      setFeatureConfigs((prev) => prev.map((f: any) => (f.id === featureId ? { ...f, ...data } : f)));

      try {
        const response = await fetch('/api/admin/ai-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            featureConfigs: [{ id: featureId, ...data }],
          }),
        });
        if (!response.ok) throw new Error('Failed to update feature');
      } catch (error) {
        logger.error('Update feature failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        toast.error(t('features.updateError'));
        setFeatureConfigs(initialFeatureConfigs); // Revert
      }
    },
    [initialFeatureConfigs, t]
  );

  const statsCards = useMemo(
    () => [
      { label: t('overview.stats.activeModels'), value: activeModels, icon: Bot, color: 'purple' },
      {
        label: t('overview.stats.activeFeatures'),
        value: activeFeatures,
        icon: Activity,
        color: 'emerald',
      },
      {
        label: t('overview.stats.activeProviders'),
        value: enabledProviders,
        icon: Shield,
        color: 'blue',
      },
      {
        label: t('overview.stats.activeFlags'),
        value: enabledFlags,
        icon: Activity,
        color: 'amber',
      },
      {
        label: t('overview.stats.credits'),
        value: `${plansStats.totalRevenue.toFixed(0)}€`,
        icon: CreditCard,
        color: 'orange',
      },
    ],
    [activeFeatures, activeModels, enabledProviders, enabledFlags, plansStats.totalRevenue, t]
  );

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col gap-3">
        <div className="hidden items-center gap-2 overflow-x-auto rounded-2xl border border-neutral-200/60 bg-white/70 p-2 shadow-sm ring-1 ring-neutral-200/60 backdrop-blur lg:flex dark:border-white/[0.06] dark:bg-white/[0.05] dark:ring-neutral-800/60">
          {sections.map((section: any) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={cn(
                  'flex min-w-[180px] items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all',
                  isActive
                    ? 'from-primary-500 bg-gradient-to-r to-violet-600 text-white shadow-lg shadow-violet-500/20'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/[0.06]'
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-semibold">{section.label}</div>
                  <div className="text-xs opacity-80">{section.description}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="lg:hidden">
          <select
            value={activeSection}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleSectionChange(e.target.value as SectionId)
            }
            className="w-full rounded-xl border border-neutral-200/60 bg-white px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-white/[0.04]"
          >
            {sections.map((section: any) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-10">
        {/* Header stats */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statsCards.map((stat: any) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  'rounded-2xl border border-neutral-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.06]',
                  'flex items-center gap-3'
                )}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-white/[0.04]">
                  <Icon className="text-primary-500 h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {activeSection === 'overview' && (
          <div className="space-y-6">
            <SectionCard
              title={t('overview.title')}
              description={t('overview.subtitle')}
              icon={Sparkles}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: t('overview.stats.totalUsers'),
                    value: userStats.totalUsers,
                    icon: Users,
                  },
                  { label: t('overview.stats.admins'), value: userStats.adminCount, icon: Shield },
                  { label: t('overview.stats.coaches'), value: userStats.coachCount, icon: Layers },
                  {
                    label: t('overview.stats.betaUsers'),
                    value: featureFlagsData.betaUsersCount,
                    icon: Activity,
                  },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.05]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 dark:bg-white/[0.08]">
                        <Icon className="text-primary-500 h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                          {stat.value.toLocaleString('it-IT')}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {stat.label}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title={t('database.title')}
              description={t('database.description')}
              icon={Database}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: t('database.users'), value: databaseStats.usersCount, icon: Users },
                  {
                    label: t('database.exercises'),
                    value: databaseStats.exercisesCount,
                    icon: Activity,
                  },
                  { label: t('database.foods'), value: databaseStats.foodsCount, icon: Database },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.05]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 dark:bg-white/[0.08]">
                        <Icon className="text-primary-500 h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                          {stat.value.toLocaleString('it-IT')}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {stat.label}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        )}

        {activeSection === 'models' && (
          <div className="space-y-6">
            {/* Provider API Keys */}
            <SectionCard
              title={t('models.providerKeys.title')}
              description={t('models.providerKeys.description')}
              icon={Shield}
            >
              <Suspense
                fallback={
                  <div className="h-24 animate-pulse rounded-xl bg-neutral-200/60 dark:bg-white/[0.05]" />
                }
              >
                <ProviderApiKeysSection configs={providerConfigs} />
              </Suspense>
            </SectionCard>

            {/* Modelli & Accessi */}
            <SectionCard
              title={t('models.access.title')}
              description={t('models.access.description')}
              icon={Bot}
            >
              <ModelsTab
                models={models}
                modelAccess={modelAccess}
                onModelsChange={setModels}
                onUpdateModel={handleUpdateModel}
                onUpdateModelAccess={handleUpdateModelAccess}
              />
            </SectionCard>
          </div>
        )}

        {activeSection === 'features' && (
          <SectionCard
            title={t('features.title')}
            description={t('features.description')}
            icon={Settings}
          >
            <FeaturesTab featureConfigs={featureConfigs} onUpdateFeature={handleUpdateFeature} />
          </SectionCard>
        )}

        {activeSection === 'prompts' && (
          <SectionCard
            title={t('prompts.title')}
            description={t('prompts.description')}
            icon={FileText}
          >
            <Link
              href="/admin/prompts"
              aria-label="System Prompts"
              className="group relative flex items-center gap-3 overflow-visible rounded-xl py-2.5 pr-3 text-neutral-600 transition-all duration-200 hover:bg-neutral-100/50 dark:text-neutral-400 dark:hover:bg-white/[0.06]/50"
              style={{ paddingLeft: 24 }}
            >
              <div className="bg-primary-50 text-primary-700 ring-primary-100 dark:bg-primary-900/40 dark:text-primary-200 dark:ring-primary-900/60 flex h-9 w-9 items-center justify-center rounded-lg ring-1">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('prompts.title')}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('prompts.openEditor')}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300" />
            </Link>
          </SectionCard>
        )}

        {activeSection === 'framework' && (
          <div className="space-y-6">
            <SectionCard
              title={t('sections.framework.label')}
              description={t('sections.framework.description')}
              icon={Wand2}
            >
              <FrameworkTab
                frameworkConfigs={frameworkConfigs}
                onFrameworkConfigsChange={setFrameworkConfigs}
              />
            </SectionCard>

            <SectionCard
              title={t('sections.framework.label')}
              description={t('sections.framework.description')}
              icon={Sparkles}
            >
              <Suspense
                fallback={
                  <div className="h-24 animate-pulse rounded-xl bg-neutral-200/60 dark:bg-white/[0.05]" />
                }
              >
                <AIAgentsConfig
                  configs={aiFrameworkConfigs}
                  onToggleAgent={onToggleAgent}
                  onUpdateRetry={onUpdateRetry}
                />
              </Suspense>
            </SectionCard>

            <SectionCard
              title={t('visionImport.title')}
              description={t('visionImport.description')}
              icon={Bot}
            >
              <div className="space-y-8">
                <Suspense
                  fallback={
                    <div className="h-24 animate-pulse rounded-xl bg-neutral-200/60 dark:bg-white/[0.05]" />
                  }
                >
                  <VisionModelsConfig />
                </Suspense>

                <Suspense
                  fallback={
                    <div className="h-24 animate-pulse rounded-xl bg-neutral-200/60 dark:bg-white/[0.05]" />
                  }
                >
                  <ImportModelsConfig models={models} />
                </Suspense>
              </div>
            </SectionCard>
          </div>
        )}

        {activeSection === 'operations' && (
          <SectionCard
            title={t('sections.operations.label')}
            description={t('sections.operations.description')}
            icon={Zap}
          >
            <OperationsTab models={models} />
          </SectionCard>
        )}

        {activeSection === 'copilot' && (
          <SectionCard
            title={t('sections.copilot.label')}
            description={t('sections.copilot.description')}
            icon={Layers}
          >
            <CopilotTab userStats={userStats} />
          </SectionCard>
        )}

        {activeSection === 'billing' && (
          <div className="space-y-6">
            <SectionCard
              title={t('billing.metrics.title')}
              description={t('billing.metrics.description')}
              icon={CreditCard}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: t('billing.metrics.plus'), value: plansStats.plusSubs, icon: Users },
                  { label: t('billing.metrics.pro'), value: plansStats.proSubs, icon: Zap },
                  {
                    label: t('billing.metrics.revenue'),
                    value: `€${plansStats.totalRevenue.toFixed(0)}`,
                    icon: BarChart3,
                  },
                  {
                    label: t('billing.metrics.total'),
                    value: plansStats.plusSubs + plansStats.proSubs,
                    icon: Activity,
                  },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-xl border border-neutral-200/60 bg-neutral-50/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.05]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 dark:bg-white/[0.08]">
                          <Icon className="text-primary-500 h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                            {typeof stat.value === 'number'
                              ? stat.value.toLocaleString('it-IT')
                              : stat.value}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title={t('billing.plansConfig.title')}
              description={t('billing.plansConfig.description')}
              icon={CreditCard}
            >
              <Suspense
                fallback={
                  <div className="h-24 animate-pulse rounded-xl bg-neutral-200/60 dark:bg-white/[0.05]" />
                }
              >
                <PlansConfigForm plans={STRIPE_PLANS} creditPacks={creditPacks} />
              </Suspense>
            </SectionCard>
          </div>
        )}

        {activeSection === 'flags' && (
          <SectionCard
            title={t('flags.title')}
            description={t('flags.description')}
            icon={Activity}
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
                      {flag.enabled ? t('flags.status.on') : t('flags.status.off')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </SectionCard>
        )}

        {activeSection === 'edge' && (
          <SectionCard title={t('edge.title')} description={t('edge.description')} icon={Zap}>
            <Suspense
              fallback={
                <div className="h-24 animate-pulse rounded-xl bg-neutral-200/60 dark:bg-white/[0.05]" />
              }
            >
              <EdgeConfigPanel />
            </Suspense>
          </SectionCard>
        )}

        {activeSection === 'analytics' && (
          <SectionCard
            title={t('analytics.title')}
            description={t('analytics.subtitle')}
            icon={BarChart3}
          >
            <AnalyticsTab />
          </SectionCard>
        )}

        {activeSection === 'conversations' && (
          <SectionCard
            title={t('conversations.title')}
            description={t('conversations.subtitle', { count: '' })} // Handle count if needed, or use a general key
            icon={MessageSquare}
          >
            <ConversationsTab />
          </SectionCard>
        )}

        {activeSection !== 'overview' && (
          <div className="text-right text-xs text-neutral-500 dark:text-neutral-400">
            {t('section', { name: activeSection })}
          </div>
        )}
      </div>
    </div>
  );
}
