/**
 * Copilot Settings Tab
 * Global Copilot configuration and context builder management
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@onecoach/lib-design-system';
import {
  Wand2,
  ToggleLeft,
  ToggleRight,
  Layers,
  Sparkles,
  Shield,
  Users,
  MessageSquare,
  Eye,
  Loader2,
  Save,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface CopilotConfig {
  globalEnabled: boolean;
  defaultSuggestionMode: 'auto' | 'manual' | 'disabled';
  autoTriggerDelay: number;
  maxContextTokens: number;
  enabledContextBuilders: string[];
  disabledScreens: string[];
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

interface CopilotTabProps {
  userStats: {
    totalUsers: number;
    adminCount: number;
    coachCount: number;
    userCount: number;
  };
}

const DEFAULT_CONFIG: CopilotConfig = {
  globalEnabled: true,
  defaultSuggestionMode: 'auto',
  autoTriggerDelay: 2000,
  maxContextTokens: 4000,
  enabledContextBuilders: ['nutrition', 'workout', 'exercise', 'profile'],
  disabledScreens: [],
  rateLimits: {
    requestsPerMinute: 20,
    tokensPerMinute: 50000,
  },
};

interface CopilotTabProps {
  userStats: {
    totalUsers: number;
    adminCount: number;
    coachCount: number;
    userCount: number;
  };
}

export function CopilotTab({ userStats }: CopilotTabProps) {
  const t = useTranslations('admin.aiSettings.copilot');
  const tAdmin = useTranslations('admin');

  // Available context builders
  const contextBuilders = useMemo(
    () => [
      {
        id: 'nutrition',
        label: t('builders.items.nutrition.label'),
        description: t('builders.items.nutrition.desc'),
      },
      {
        id: 'workout',
        label: t('builders.items.workout.label'),
        description: t('builders.items.workout.desc'),
      },
      {
        id: 'exercise',
        label: t('builders.items.exercise.label'),
        description: t('builders.items.exercise.desc'),
      },
      {
        id: 'profile',
        label: t('builders.items.profile.label'),
        description: t('builders.items.profile.desc'),
      },
      {
        id: 'progress',
        label: t('builders.items.progress.label'),
        description: t('builders.items.progress.desc'),
      },
      {
        id: 'calendar',
        label: t('builders.items.calendar.label'),
        description: t('builders.items.calendar.desc'),
      },
    ],
    [t]
  );

  // Available screens
  const screens = useMemo(
    () => [
      { id: 'dashboard', label: t('screens.items.dashboard') },
      { id: 'nutrition-plan', label: t('screens.items.nutrition-plan') },
      { id: 'workout-plan', label: t('screens.items.workout-plan') },
      { id: 'exercise-library', label: t('screens.items.exercise-library') },
      { id: 'food-library', label: t('screens.items.food-library') },
      { id: 'profile', label: t('screens.items.profile') },
      { id: 'progress', label: t('screens.items.progress') },
      { id: 'calendar', label: t('screens.items.calendar') },
      { id: 'chat', label: t('screens.items.chat') },
    ],
    [t]
  );
  const [config, setConfig] = useState<CopilotConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState<CopilotConfig>(DEFAULT_CONFIG);

  // Load config
  useEffect(() => {
    async function loadConfig() {
      try {
        // Load from API - using copilot_admin_config table
        const res = await fetch('/api/admin/copilot-config');
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
            setOriginalConfig(data.config);
          }
        }
      } catch {
        // Use defaults
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Check for changes
  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(originalConfig));
  }, [config, originalConfig]);

  // Toggle context builder
  const toggleContextBuilder = useCallback((builderId: string) => {
    setConfig((prev) => ({
      ...prev,
      enabledContextBuilders: prev.enabledContextBuilders.includes(builderId)
        ? prev.enabledContextBuilders.filter((id) => id !== builderId)
        : [...prev.enabledContextBuilders, builderId],
    }));
  }, []);

  // Toggle screen
  const toggleScreen = useCallback((screenId: string) => {
    setConfig((prev) => ({
      ...prev,
      disabledScreens: prev.disabledScreens.includes(screenId)
        ? prev.disabledScreens.filter((id) => id !== screenId)
        : [...prev.disabledScreens, screenId],
    }));
  }, []);

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/copilot-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error();

      setOriginalConfig(config);
      setHasChanges(false);
      toast.success(tAdmin('saveSuccess'));
    } catch {
      toast.error(tAdmin('saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-primary-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('description')}</p>
        </div>
        <AnimatePresence>
          {hasChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={saveConfig}
              disabled={isSaving}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5',
                'from-primary-500 bg-gradient-to-r to-violet-600',
                'text-sm font-medium text-white',
                'shadow-primary-500/25 shadow-lg',
                'hover:shadow-primary-500/30 hover:shadow-xl',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-all duration-200'
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('saveChanges')}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          className={cn(
            'rounded-xl p-4',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-neutral-700/50'
          )}
        >
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {userStats.totalUsers}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{t('stats.users')}</p>
        </div>
        <div
          className={cn(
            'rounded-xl p-4',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-neutral-700/50'
          )}
        >
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-500" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {config.enabledContextBuilders.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{t('stats.builders')}</p>
        </div>
        <div
          className={cn(
            'rounded-xl p-4',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-neutral-700/50'
          )}
        >
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-violet-500" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {screens.length - config.disabledScreens.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{t('stats.screens')}</p>
        </div>
        <div
          className={cn(
            'rounded-xl p-4',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-neutral-700/50'
          )}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {config.rateLimits.requestsPerMinute}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{t('stats.limit')}</p>
        </div>
      </div>

      {/* Global Toggle */}
      <div
        className={cn(
          'rounded-2xl p-6',
          'bg-white/80 dark:bg-neutral-800/80',
          'backdrop-blur-xl',
          'border border-neutral-200/50 dark:border-neutral-700/50'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl',
                config.globalEnabled
                  ? 'from-primary-500 shadow-primary-500/25 bg-gradient-to-br to-violet-600 shadow-lg'
                  : 'bg-neutral-100 dark:bg-neutral-700'
              )}
            >
              <Wand2
                className={cn('h-7 w-7', config.globalEnabled ? 'text-white' : 'text-neutral-400')}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {t('global.title')}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {config.globalEnabled ? t('global.enabled') : t('global.disabled')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfig((prev) => ({ ...prev, globalEnabled: !prev.globalEnabled }))}
          >
            {config.globalEnabled ? (
              <ToggleRight className="text-primary-500 h-10 w-10" />
            ) : (
              <ToggleLeft className="h-10 w-10 text-neutral-400" />
            )}
          </button>
        </div>
      </div>

      {/* Suggestion Mode */}
      <div
        className={cn(
          'rounded-2xl p-6',
          'bg-white/80 dark:bg-neutral-800/80',
          'backdrop-blur-xl',
          'border border-neutral-200/50 dark:border-neutral-700/50'
        )}
      >
        <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">
          {t('suggestions.title')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              mode: 'auto' as const,
              label: t('suggestions.auto.label'),
              description: t('suggestions.auto.desc'),
              icon: Sparkles,
            },
            {
              mode: 'manual' as const,
              label: t('suggestions.manual.label'),
              description: t('suggestions.manual.desc'),
              icon: MessageSquare,
            },
            {
              mode: 'disabled' as const,
              label: t('suggestions.disabled.label'),
              description: t('suggestions.disabled.desc'),
              icon: Eye,
            },
          ].map(({ mode, label, description, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setConfig((prev) => ({ ...prev, defaultSuggestionMode: mode }))}
              className={cn(
                'rounded-xl p-4 text-left transition-all',
                'border',
                config.defaultSuggestionMode === mode
                  ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-500/10'
                  : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
              )}
            >
              <Icon
                className={cn(
                  'mb-2 h-5 w-5',
                  config.defaultSuggestionMode === mode ? 'text-primary-500' : 'text-neutral-400'
                )}
              />
              <p className="font-medium text-neutral-900 dark:text-white">{label}</p>
              <p className="mt-1 text-xs text-neutral-500">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Context Builders */}
        <div
          className={cn(
            'rounded-2xl p-6',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-neutral-700/50'
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {t('builders.title')}
            </h3>
            <span className="text-sm text-neutral-500">
              {config.enabledContextBuilders.length}/{contextBuilders.length}
            </span>
          </div>
          <div className="space-y-2">
            {contextBuilders.map((builder) => {
              const isEnabled = config.enabledContextBuilders.includes(builder.id);
              return (
                <div
                  key={builder.id}
                  className={cn(
                    'flex items-center justify-between rounded-xl p-3',
                    'transition-colors',
                    isEnabled
                      ? 'bg-primary-50 dark:bg-primary-500/10'
                      : 'bg-neutral-50 dark:bg-neutral-700/50'
                  )}
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{builder.label}</p>
                    <p className="text-xs text-neutral-500">{builder.description}</p>
                  </div>
                  <button onClick={() => toggleContextBuilder(builder.id)}>
                    {isEnabled ? (
                      <ToggleRight className="text-primary-500 h-6 w-6" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-neutral-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Screen Availability */}
        <div
          className={cn(
            'rounded-2xl p-6',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-neutral-700/50'
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 dark:text-white">{t('screens.title')}</h3>
            <span className="text-sm text-neutral-500">
              {screens.length - config.disabledScreens.length}/{screens.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {screens.map((screen) => {
              const isEnabled = !config.disabledScreens.includes(screen.id);
              return (
                <button
                  key={screen.id}
                  onClick={() => toggleScreen(screen.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2',
                    'text-sm font-medium transition-all',
                    isEnabled
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                  )}
                >
                  {isEnabled ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded border border-current opacity-50" />
                  )}
                  {screen.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rate Limits & Advanced */}
      <div
        className={cn(
          'rounded-2xl p-6',
          'bg-white/80 dark:bg-neutral-800/80',
          'backdrop-blur-xl',
          'border border-neutral-200/50 dark:border-neutral-700/50'
        )}
      >
        <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">{t('params.title')}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('params.rpm')}
            </label>
            <input
              type="number"
              value={config.rateLimits.requestsPerMinute}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfig((prev) => ({
                  ...prev,
                  rateLimits: {
                    ...prev.rateLimits,
                    requestsPerMinute: parseInt(e.target.value) || 0,
                  },
                }))
              }
              className={cn(
                'w-full rounded-xl border px-4 py-2.5',
                'border-neutral-200 dark:border-neutral-700',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
              )}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('params.tpm')}
            </label>
            <input
              type="number"
              value={config.rateLimits.tokensPerMinute}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfig((prev) => ({
                  ...prev,
                  rateLimits: {
                    ...prev.rateLimits,
                    tokensPerMinute: parseInt(e.target.value) || 0,
                  },
                }))
              }
              className={cn(
                'w-full rounded-xl border px-4 py-2.5',
                'border-neutral-200 dark:border-neutral-700',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
              )}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('params.maxTokens')}
            </label>
            <input
              type="number"
              value={config.maxContextTokens}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfig((prev) => ({
                  ...prev,
                  maxContextTokens: parseInt(e.target.value) || 0,
                }))
              }
              className={cn(
                'w-full rounded-xl border px-4 py-2.5',
                'border-neutral-200 dark:border-neutral-700',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
              )}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('params.delay')}
            </label>
            <input
              type="number"
              step="100"
              value={config.autoTriggerDelay}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfig((prev) => ({
                  ...prev,
                  autoTriggerDelay: parseInt(e.target.value) || 0,
                }))
              }
              className={cn(
                'w-full rounded-xl border px-4 py-2.5',
                'border-neutral-200 dark:border-neutral-700',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
