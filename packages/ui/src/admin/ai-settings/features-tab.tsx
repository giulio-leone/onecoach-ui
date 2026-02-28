/**
 * Chat Features Management Tab
 * Toggle features with role-based access control
 */

'use client';

import { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Bot,
  Mic,
  CheckCircle2,
  FileText,
  MessageSquare,
  Link2,
  Lightbulb,
  ListTodo,
  Layers,
  Globe,
  Brain,
  Clock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { FeatureConfig, AIChatFeature } from './types';
import { FEATURE_METADATA, ROLES } from './constants';
import type { UserRole } from '@prisma/client';

// Icon mapping
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Bot,
  Mic,
  CheckCircle2,
  FileText,
  MessageSquare,
  Link2,
  Lightbulb,
  ListTodo,
  Layers,
  Globe,
  Brain,
  Clock,
};

interface FeaturesTabProps {
  featureConfigs: FeatureConfig[];
  onUpdateFeature: (featureId: string, data: Partial<FeatureConfig>) => Promise<void>;
  // Deprecated/Unused
  // onSave: () => Promise<void>;
  // isSaving: boolean;
}

export function FeaturesTab({ featureConfigs, onUpdateFeature }: FeaturesTabProps) {
  const t = useTranslations('admin.aiSettings.features');

  // Toggle feature enabled
  const toggleFeature = useCallback(
    (feature: AIChatFeature) => {
      const config = featureConfigs.find((c: any) => c.feature === feature);
      if (config) {
        onUpdateFeature(config.id, { isEnabled: !config.isEnabled });
      }
    },
    [featureConfigs, onUpdateFeature]
  );

  // Toggle role access for feature
  const toggleRoleForFeature = useCallback(
    (feature: AIChatFeature, role: UserRole) => {
      const config = featureConfigs.find((c: any) => c.feature === feature);
      if (config) {
        const hasRole = config.enabledForRoles.includes(role);
        const newRoles = hasRole
          ? config.enabledForRoles.filter((r: UserRole) => r !== role)
          : [...config.enabledForRoles, role];
        onUpdateFeature(config.id, { enabledForRoles: newRoles });
      }
    },
    [featureConfigs, onUpdateFeature]
  );

  // Group features by category
  const groupedFeatures = useMemo(() => {
    const groups: Record<'core' | 'ui' | 'advanced', FeatureConfig[]> = {
      core: [],
      ui: [],
      advanced: [],
    };

    featureConfigs.forEach((config: FeatureConfig) => {
      const meta = FEATURE_METADATA[config.feature];
      if (meta) {
        const category = (meta.category || 'core') as 'core' | 'ui' | 'advanced';
        groups[category].push(config);
      }
    });

    return groups;
  }, [featureConfigs]);

  // Stats
  const enabledCount = featureConfigs.filter((f: any) => f.isEnabled).length;
  const totalCount = featureConfigs.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label={t('stats.activeFeatures')}
          value={enabledCount}
          total={totalCount}
          color="emerald"
        />
        <StatCard
          label={t('stats.forAdmin')}
          value={
            featureConfigs.filter((f: any) =>
                f.enabledForRoles.includes('ADMIN') || f.enabledForRoles.includes('SUPER_ADMIN')
            ).length
          }
          total={totalCount}
          color="purple"
        />
        <StatCard
          label={t('stats.forCoach')}
          value={featureConfigs.filter((f: any) => f.enabledForRoles.includes('COACH')).length}
          total={totalCount}
          color="blue"
        />
        <StatCard
          label={t('stats.forUsers')}
          value={featureConfigs.filter((f: any) => f.enabledForRoles.includes('USER')).length}
          total={totalCount}
          color="amber"
        />
      </div>

      {/* Features by Category */}
      {Object.entries(groupedFeatures).map(([category, features]) => {
        if (features.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {t(`categories.${category}.label`)}
              </h3>
              <span className="text-sm text-neutral-400">
                ({features.filter((f: any) => f.isEnabled).length}/{features.length})
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t(`categories.${category}.description`)}
            </p>

            {/* Features Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((config, index) => (
                <FeatureCard
                  key={config.id}
                  config={config}
                  index={index}
                  onToggleEnabled={() => toggleFeature(config.feature)}
                  onToggleRole={(role) => toggleRoleForFeature(config.feature, role)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  total: number;
  color: 'emerald' | 'purple' | 'blue' | 'amber';
}

function StatCard({ label, value, total, color }: StatCardProps) {
  const colors = {
    emerald: 'from-emerald-500 to-teal-500',
    purple: 'from-secondary-500 to-secondary-500',
    blue: 'from-primary-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
  };

  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div
      className={cn(
        'rounded-xl p-4',
        'bg-white/80 dark:bg-neutral-800/80',
        'backdrop-blur-xl',
        'border border-neutral-200/50 dark:border-white/[0.08]'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</span>
        <div
          className={cn(
            'h-8 w-8 rounded-lg bg-gradient-to-br',
            colors[color],
            'flex items-center justify-center'
          )}
        >
          <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
        </div>
      </div>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  config: FeatureConfig;
  index: number;
  onToggleEnabled: () => void;
  onToggleRole: (role: UserRole) => void;
}

function FeatureCard({ config, index, onToggleEnabled, onToggleRole }: FeatureCardProps) {
  const t = useTranslations('admin.aiSettings.features');
  const roleT = useTranslations('common.roles');

  const meta = FEATURE_METADATA[config.feature];
  if (!meta) return null;

  const IconComponent = ICONS[meta.icon] || MessageSquare;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-xl p-4 transition-all duration-200',
        'border',
        config.isEnabled
          ? 'border-primary-200 dark:border-primary-800 bg-white dark:bg-neutral-800'
          : 'border-neutral-200/50 bg-neutral-50/50 dark:border-white/[0.08] dark:bg-neutral-800/50'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              config.isEnabled
                ? 'from-primary-500 shadow-primary-500/25 bg-gradient-to-br to-violet-600 text-white shadow-lg'
                : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-700'
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-neutral-900 dark:text-white">
              {t(`metadata.${config.feature}.label`)}
            </h4>
            <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
              {t(`metadata.${config.feature}.description`)}
            </p>
          </div>
        </div>
        <button onClick={onToggleEnabled} className="shrink-0">
          {config.isEnabled ? (
            <ToggleRight className="text-primary-500 h-7 w-7" />
          ) : (
            <ToggleLeft className="h-7 w-7 text-neutral-400" />
          )}
        </button>
      </div>

      {/* Role Access */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ROLES.map((role: any) => {
          const isAllowed = config.enabledForRoles.includes(role as UserRole);
          return (
            <button
              key={role}
              onClick={() => onToggleRole(role as UserRole)}
              disabled={!config.isEnabled}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                isAllowed
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400',
                config.isEnabled
                  ? 'hover:opacity-80 active:scale-95'
                  : 'cursor-not-allowed opacity-50'
              )}
            >
              {roleT(role.toLowerCase())}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
