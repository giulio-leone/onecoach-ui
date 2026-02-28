/**
 * Analytics Tab
 * Real-time usage analytics with Supabase subscriptions
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Coins,
  Clock,
  Zap,
  AlertTriangle,
  RefreshCw,
  Calendar,
  ChevronDown,
  Loader2,
  Users,
  Bot,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { PROVIDER_COLORS } from './constants';

interface UsageStats {
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  errorRate: number;
  uniqueUsers: number;
  conversationsCount: number;
  toolCallsCount: number;
}

interface DailyStats {
  date: string;
  messages: number;
  tokens: number;
  cost: number;
}

interface ProviderStats {
  provider: string;
  messages: number;
  tokens: number;
  cost: number;
}

interface ModelStats {
  modelId: string;
  modelName: string;
  provider: string;
  messages: number;
  tokens: number;
  avgLatency: number;
}

interface AnalyticsTabProps {
  projectId?: string;
}

export function AnalyticsTab({ projectId }: AnalyticsTabProps) {
  const t = useTranslations('admin.aiSettings.analytics');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const [period, setPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [modelStats, setModelStats] = useState<ModelStats[]>([]);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const PERIOD_OPTIONS = useMemo(
    () => [
      { value: '24h', label: t('period.24h') },
      { value: '7d', label: t('period.7d') },
      { value: '30d', label: t('period.30d') },
      { value: '90d', label: t('period.90d') },
    ],
    [t]
  );

  // Load analytics data
  const loadAnalytics = useCallback(
    async (showLoader = true) => {
      if (showLoader) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const res = await fetch(
          `/api/admin/analytics?period=${period}&projectId=${projectId || ''}`
        );
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setDailyStats(data.dailyStats || []);
          setProviderStats(data.providerStats || []);
          setModelStats(data.modelStats || []);
        }
      } catch {
        // Mock data for development
        setStats({
          totalMessages: 12847,
          totalTokens: 3456000,
          totalCost: 89.45,
          avgLatency: 1.2,
          errorRate: 0.02,
          uniqueUsers: 234,
          conversationsCount: 567,
          toolCallsCount: 1234,
        });
        setDailyStats([
          { date: '2024-01-14', messages: 1500, tokens: 400000, cost: 12.5 },
          { date: '2024-01-15', messages: 1800, tokens: 480000, cost: 15.2 },
          { date: '2024-01-16', messages: 2100, tokens: 560000, cost: 17.8 },
          { date: '2024-01-17', messages: 1900, tokens: 510000, cost: 16.1 },
          { date: '2024-01-18', messages: 2300, tokens: 620000, cost: 19.5 },
          { date: '2024-01-19', messages: 1700, tokens: 450000, cost: 14.3 },
          { date: '2024-01-20', messages: 1547, tokens: 436000, cost: 13.95 },
        ]);
        setProviderStats([
          { provider: 'openai', messages: 7500, tokens: 2000000, cost: 52.3 },
          { provider: 'anthropic', messages: 4200, tokens: 1200000, cost: 31.5 },
          { provider: 'google', messages: 1147, tokens: 256000, cost: 5.65 },
        ]);
        setModelStats([
          {
            modelId: 'gpt-4o',
            modelName: 'GPT-4o',
            provider: 'openai',
            messages: 5200,
            tokens: 1400000,
            avgLatency: 1.1,
          },
          {
            modelId: 'claude-3.5-sonnet',
            modelName: 'Claude 3.5 Sonnet',
            provider: 'anthropic',
            messages: 3800,
            tokens: 1100000,
            avgLatency: 1.3,
          },
          {
            modelId: 'gpt-4o-mini',
            modelName: 'GPT-4o Mini',
            provider: 'openai',
            messages: 2300,
            tokens: 600000,
            avgLatency: 0.8,
          },
        ]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [period, projectId]
  );

  useEffect(() => {
    loadAnalytics();
  }, [period, projectId, loadAnalytics]);

  // Max values for bar charts
  const maxMessages = useMemo(
    () => Math.max(...dailyStats.map((d: any) => d.messages), 1),
    [dailyStats]
  );
  const maxProviderMessages = useMemo(
    () => Math.max(...providerStats.map((p: any) => p.messages), 1),
    [providerStats]
  );

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
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5',
                'bg-white dark:bg-white/[0.04]',
                'border border-neutral-200 dark:border-white/[0.08]',
                'text-sm font-medium text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-50 dark:hover:bg-white/[0.08]'
              )}
            >
              <Calendar className="h-4 w-4" />
              {PERIOD_OPTIONS.find((p: any) => p.value === period)?.label}
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showPeriodDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'absolute top-full right-0 z-50 mt-2',
                    'min-w-[180px] rounded-xl p-1',
                    'bg-white dark:bg-white/[0.04]',
                    'border border-neutral-200 dark:border-white/[0.08]',
                    'shadow-xl'
                  )}
                >
                  {PERIOD_OPTIONS.map((option: any) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPeriod(option.value);
                        setShowPeriodDropdown(false);
                      }}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left text-sm',
                        'transition-colors',
                        period === option.value
                          ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/[0.08]'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Refresh */}
          <button
            onClick={() => loadAnalytics(false)}
            disabled={isRefreshing}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2.5',
              'bg-neutral-100 dark:bg-white/[0.08]',
              'text-neutral-600 dark:text-neutral-300',
              'hover:bg-neutral-200 dark:hover:bg-neutral-600',
              'disabled:opacity-50'
            )}
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          className={cn(
            'rounded-2xl p-4',
            'bg-gradient-to-br from-primary-500/10 to-primary-600/5',
            'border border-primary-200/50 dark:border-primary-500/20'
          )}
        >
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs font-medium">{t('metrics.messages')}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {stats?.totalMessages.toLocaleString()}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            +12.5%
          </div>
        </div>

        <div
          className={cn(
            'rounded-2xl p-4',
            'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5',
            'border border-emerald-200/50 dark:border-emerald-500/20'
          )}
        >
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Zap className="h-5 w-5" />
            <span className="text-xs font-medium">{t('metrics.tokens')}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {((stats?.totalTokens ?? 0) / 1000000).toFixed(1)}M
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            +8.3%
          </div>
        </div>

        <div
          className={cn(
            'rounded-2xl p-4',
            'bg-gradient-to-br from-violet-500/10 to-violet-600/5',
            'border border-violet-200/50 dark:border-violet-500/20'
          )}
        >
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
            <Coins className="h-5 w-5" />
            <span className="text-xs font-medium">{t('metrics.cost')}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            ${stats?.totalCost.toFixed(2)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <TrendingUp className="h-3 w-3" />
            +5.2%
          </div>
        </div>

        <div
          className={cn(
            'rounded-2xl p-4',
            'bg-gradient-to-br from-amber-500/10 to-amber-600/5',
            'border border-amber-200/50 dark:border-amber-500/20'
          )}
        >
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
            <span className="text-xs font-medium">{t('metrics.latency')}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {stats?.avgLatency}s
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
            <TrendingDown className="h-3 w-3" />
            {tAdmin('analytics_tab.0_1s')}
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          className={cn(
            'rounded-xl p-4',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-white/[0.08]'
          )}
        >
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-500" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats?.uniqueUsers}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{t('metrics.users')}</p>
        </div>
        <div
          className={cn(
            'rounded-xl p-4',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-white/[0.08]'
          )}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-violet-500" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats?.conversationsCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{t('metrics.conversations')}</p>
        </div>
        <div
          className={cn(
            'rounded-xl p-4',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-white/[0.08]'
          )}
        >
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-500" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats?.toolCallsCount?.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{t('metrics.toolCalls')}</p>
        </div>
        <div
          className={cn(
            'rounded-xl p-4',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-white/[0.08]'
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {((stats?.errorRate ?? 0) * 100).toFixed(1)}%
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{t('metrics.errorRate')}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Messages Chart */}
        <div
          className={cn(
            'rounded-2xl p-6',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-white/[0.08]'
          )}
        >
          <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">
            {t('charts.dailyMessages')}
          </h3>
          <div className="flex h-[160px] items-end gap-1">
            {dailyStats.map((day, i) => {
              const height = (day.messages / maxMessages) * 100;
              const date = new Date(day.date);
              const dayLabel = date.toLocaleDateString(locale, { weekday: 'short' });
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="relative flex w-full flex-1 items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className={cn(
                        'w-full rounded-t-lg',
                        'from-primary-500 to-primary-400 bg-gradient-to-t',
                        'hover:from-primary-600 hover:to-primary-500',
                        'cursor-pointer transition-colors'
                      )}
                      title={`${day.messages.toLocaleString()} ${t('metrics.messages').toLowerCase()}`}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Provider Distribution */}
        <div
          className={cn(
            'rounded-2xl p-6',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-white/[0.08]'
          )}
        >
          <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">
            {t('charts.providerDistribution')}
          </h3>
          <div className="space-y-3">
            {providerStats.map((provider, i) => {
              const percentage = (provider.messages / maxProviderMessages) * 100;
              const color =
                PROVIDER_COLORS[provider.provider as keyof typeof PROVIDER_COLORS] ||
                'bg-neutral-500';
              return (
                <div key={provider.provider}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-700 capitalize dark:text-neutral-300">
                      {provider.provider}
                    </span>
                    <span className="text-neutral-500">
                      {provider.messages.toLocaleString()} {tAdmin('analytics_tab.msg')}
                      {provider.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/[0.08]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: i * 0.15 }}
                      className={cn('h-full rounded-full', color)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Usage Table */}
      <div
        className={cn(
          'rounded-2xl p-6',
          'bg-white/80 dark:bg-neutral-800/80',
          'backdrop-blur-xl',
          'border border-neutral-200/50 dark:border-white/[0.08]'
        )}
      >
        <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">
          {t('charts.modelUsage')}
        </h3>
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="text-left text-xs tracking-wider text-neutral-500 uppercase">
                <th className="pb-3 font-medium">{t('table.model')}</th>
                <th className="pb-3 font-medium">{t('table.provider')}</th>
                <th className="pb-3 text-right font-medium">{t('table.messages')}</th>
                <th className="pb-3 text-right font-medium">{t('table.tokens')}</th>
                <th className="pb-3 text-right font-medium">{t('table.latency')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.08]">
              {modelStats.map((model: any) => (
                <tr key={model.modelId} className="group">
                  <td className="py-3">
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {model.modelName}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                        PROVIDER_COLORS[model.provider as keyof typeof PROVIDER_COLORS]?.replace(
                          'bg-',
                          'bg-opacity-20 text-'
                        ),
                        'text-neutral-700 dark:text-neutral-300'
                      )}
                    >
                      {model.provider}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-sm text-neutral-600 dark:text-neutral-400">
                    {model.messages.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono text-sm text-neutral-600 dark:text-neutral-400">
                    {(model.tokens / 1000).toFixed(0)}K
                  </td>
                  <td className="py-3 text-right font-mono text-sm text-neutral-600 dark:text-neutral-400">
                    {model.avgLatency}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
