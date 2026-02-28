/**
 * Framework Agentico Tab
 * Configure AI framework features with granular settings
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Vote,
  Puzzle,
  TrendingUp,
  Sparkles,
  GitBranch,
  RefreshCw,
  DollarSign,
  Activity,
  Dumbbell,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Save,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import type { FrameworkConfig, FrameworkFeature } from './types';
import { FRAMEWORK_METADATA } from './constants';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

// Icon mapping
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Vote,
  Puzzle,
  TrendingUp,
  Sparkles,
  GitBranch,
  RefreshCw,
  DollarSign,
  Activity,
  Dumbbell,
};

interface FrameworkTabProps {
  frameworkConfigs: FrameworkConfig[];
  onFrameworkConfigsChange: (configs: FrameworkConfig[]) => void;
}

export function FrameworkTab({
  frameworkConfigs: _initialConfigs,
  onFrameworkConfigsChange,
}: FrameworkTabProps) {
  const frameT = useTranslations('admin.aiSettings.framework');

  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [savingFeature, setSavingFeature] = useState<string | null>(null);
  const [localConfigs, setLocalConfigs] = useState<FrameworkConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load configs from API
  useEffect(() => {
    async function loadConfigs() {
      try {
        const res = await fetch('/api/admin/framework-config');
        if (!res.ok) throw new Error();
        const data = await res.json();

        // Map to FrameworkConfig format
        const configs: FrameworkConfig[] = data.configs.map((c: Record<string, unknown>) => ({
          id: c.id as string,
          feature: c.feature as FrameworkFeature,
          isEnabled: c.isEnabled as boolean,
          config: (c.config as Record<string, unknown>) || {},
          description: c.description as string | null,
          updatedBy: c.updatedBy as string | null,
          updatedAt: c.updatedAt as string,
        }));

        setLocalConfigs(configs);
        onFrameworkConfigsChange(configs);
      } catch {
        toast.error(frameT('loadError'));
      } finally {
        setIsLoading(false);
      }
    }
    loadConfigs();
  }, [onFrameworkConfigsChange, frameT]);

  // Toggle feature
  const toggleFeature = useCallback(
    async (feature: FrameworkFeature) => {
      const config = localConfigs.find((c: any) => c.feature === feature);
      if (!config) return;

      const newEnabled = !config.isEnabled;

      // Optimistic update
      setLocalConfigs((prev) =>
        prev.map((c: any) => (c.feature === feature ? { ...c, isEnabled: newEnabled } : c))
      );

      try {
        const res = await fetch(`/api/admin/framework-config/${feature}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isEnabled: newEnabled,
            changeReason: `Toggle ${newEnabled ? 'enabled' : 'disabled'} from admin panel`,
          }),
        });

        if (!res.ok) throw new Error();

        const label = frameT(`metadata.${feature}.label`);
        toast.success(
          `${label} ${newEnabled ? frameT('status.active').toLowerCase() : frameT('status.inactive').toLowerCase()}`
        );
      } catch {
        // Rollback
        setLocalConfigs((prev) =>
          prev.map((c: any) => (c.feature === feature ? { ...c, isEnabled: !newEnabled } : c))
        );
        toast.error(frameT('updateError'));
      }
    },
    [localConfigs, frameT]
  );

  // Save config changes
  const saveConfig = useCallback(
    async (feature: FrameworkFeature, newConfig: Record<string, unknown>) => {
      setSavingFeature(feature);

      try {
        const res = await fetch(`/api/admin/framework-config/${feature}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: newConfig,
            changeReason: 'Config update from admin panel',
          }),
        });

        if (!res.ok) throw new Error();

        setLocalConfigs((prev) =>
          prev.map((c: any) => (c.feature === feature ? { ...c, config: newConfig } : c))
        );

        toast.success(frameT('saveSuccess'));
      } catch {
        toast.error(frameT('saveError'));
      } finally {
        setSavingFeature(null);
      }
    },
    [frameT]
  );

  // Get enabled count
  const enabledCount = localConfigs.filter((c: any) => c.isEnabled).length;

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
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {frameT('title')}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {frameT('activeCount', { count: enabledCount, total: localConfigs.length })}
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2',
            'bg-amber-50 dark:bg-amber-500/10',
            'border border-amber-200 dark:border-amber-500/20'
          )}
        >
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-700 dark:text-amber-300">
            {frameT('liveModifications')}
          </span>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-3">
        {localConfigs.map((config, index) => {
          const meta = FRAMEWORK_METADATA[config.feature];
          if (!meta) return null;

          const IconComponent = ICONS[meta.icon] || Sparkles;
          const isExpanded = expandedFeature === config.feature;
          const isSaving = savingFeature === config.feature;

          return (
            <motion.div
              key={config.feature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'rounded-2xl transition-all duration-200',
                'border',
                config.isEnabled
                  ? 'border-primary-200 dark:border-primary-800 bg-white dark:bg-white/[0.04]'
                  : 'border-neutral-200/50 bg-neutral-50/50 dark:border-white/[0.08] dark:bg-neutral-800/50'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                      config.isEnabled
                        ? 'from-primary-500 shadow-primary-500/25 bg-gradient-to-br to-violet-600 text-white shadow-lg'
                        : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-700'
                    )}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {frameT(`metadata.${config.feature}.label`)}
                    </h3>
                    <p className="line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {frameT(`metadata.${config.feature}.description`)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedFeature(isExpanded ? null : config.feature)}
                    className={cn(
                      'rounded-lg p-2 transition-colors',
                      'hover:bg-neutral-100 dark:hover:bg-white/[0.08]'
                    )}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-neutral-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-neutral-500" />
                    )}
                  </button>
                  <button onClick={() => toggleFeature(config.feature)}>
                    {config.isEnabled ? (
                      <ToggleRight className="text-primary-500 h-8 w-8" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-neutral-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Config */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-neutral-100 p-4 dark:border-white/[0.08]">
                      <ConfigForm
                        feature={config.feature}
                        config={config.config || {}}
                        schema={meta.configSchema}
                        isEnabled={config.isEnabled}
                        isSaving={isSaving}
                        onSave={(newConfig) => saveConfig(config.feature, newConfig)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Config Form Component
interface ConfigFormProps {
  feature: FrameworkFeature;
  config: Record<string, unknown>;
  schema: Record<
    string,
    {
      type: 'boolean' | 'number' | 'string' | 'select' | 'multiselect';
      label: string;
      description?: string;
      options?: Array<{ value: string; label: string }>;
      min?: number;
      max?: number;
      step?: number;
    }
  >;
  isEnabled: boolean;
  isSaving: boolean;
  onSave: (config: Record<string, unknown>) => void;
}

function ConfigForm({ feature, config, schema, isEnabled, isSaving, onSave }: ConfigFormProps) {
  const frameT = useTranslations('admin.aiSettings.framework');
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>(config);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    setHasChanges(JSON.stringify(localConfig) !== JSON.stringify(config));
  }, [localConfig, config]);

  // Update local config
  const updateValue = (key: string, value: unknown) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(schema).map(([key, field]) => (
          <div key={key} className={field.type === 'multiselect' ? 'sm:col-span-2' : ''}>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {frameT(`metadata.${feature}.config.${key}`)}
            </label>
            {frameT.has(`metadata.${feature}.description`) && (
              <p className="mb-2 text-xs text-neutral-500">
                {/* Optional field description if and where applicable */}
              </p>
            )}

            {/* Boolean Toggle */}
            {field.type === 'boolean' && (
              <button
                onClick={() => updateValue(key, !localConfig[key])}
                disabled={!isEnabled}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2',
                  'transition-colors',
                  localConfig[key]
                    ? 'bg-primary-50 dark:bg-primary-500/10'
                    : 'bg-neutral-100 dark:bg-neutral-700',
                  !isEnabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {localConfig[key] ? (
                  <Check className="text-primary-500 h-4 w-4" />
                ) : (
                  <div className="h-4 w-4 rounded border border-neutral-300 dark:border-neutral-600" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    localConfig[key]
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400'
                  )}
                >
                  {localConfig[key] ? frameT('status.active') : frameT('status.inactive')}
                </span>
              </button>
            )}

            {/* Number Input */}
            {field.type === 'number' && (
              <input
                type="number"
                value={(localConfig[key] as number) ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateValue(key, parseFloat(e.target.value))
                }
                min={field.min}
                max={field.max}
                step={field.step}
                disabled={!isEnabled}
                className={cn(
                  'w-full rounded-xl border px-4 py-2.5',
                  'border-neutral-200 dark:border-neutral-700',
                  'bg-white dark:bg-white/[0.04]',
                  'text-neutral-900 dark:text-white',
                  'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              />
            )}

            {/* Select */}
            {field.type === 'select' && (
              <select
                value={(localConfig[key] as string) ?? ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  updateValue(key, e.target.value)
                }
                disabled={!isEnabled}
                className={cn(
                  'w-full rounded-xl border px-4 py-2.5',
                  'border-neutral-200 dark:border-neutral-700',
                  'bg-white dark:bg-white/[0.04]',
                  'text-neutral-900 dark:text-white',
                  'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {field.options?.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {/* Handle special select cases like strategies or feedback levels */}
                    {key === 'votingStrategy'
                      ? frameT(`metadata.${feature}.strategies.${opt.value}`)
                      : key === 'errorFeedbackLevel'
                        ? frameT(`metadata.${feature}.feedbackLevels.${opt.value}`)
                        : opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Multiselect (e.g. adaptive_recovery strategies) */}
            {field.type === 'multiselect' && (
              <div className="flex flex-wrap gap-2">
                {field.options?.map((opt: any) => {
                  const values = (localConfig[key] as string[]) || [];
                  const isSelected = values.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const newValues = isSelected
                          ? values.filter((v: string) => v !== opt.value)
                          : [...values, opt.value];
                        updateValue(key, newValues);
                      }}
                      disabled={!isEnabled}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                        isSelected
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
                        isEnabled && 'hover:opacity-80',
                        !isEnabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {feature === 'adaptive_recovery' && key === 'strategies'
                        ? frameT(`metadata.${feature}.strategiesList.${opt.value}`)
                        : opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex justify-end"
          >
            <button
              onClick={() => onSave(localConfig)}
              disabled={isSaving || !isEnabled}
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
              {frameT('saveButton')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
