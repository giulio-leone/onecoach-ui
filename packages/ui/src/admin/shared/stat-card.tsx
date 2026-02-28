/**
 * Shared Stat Card Component
 * Reusable metric display with icon, value, label, and optional trend
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'blue' | 'emerald' | 'violet' | 'amber' | 'red' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  delay?: number;
  className?: string;
}

const COLOR_VARIANTS = {
  blue: {
    gradient: 'from-primary-500/10 to-primary-600/5',
    border: 'border-primary-200/50 dark:border-primary-500/20',
    icon: 'text-primary-600 dark:text-primary-400',
  },
  emerald: {
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-200/50 dark:border-emerald-500/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  violet: {
    gradient: 'from-violet-500/10 to-violet-600/5',
    border: 'border-violet-200/50 dark:border-violet-500/20',
    icon: 'text-violet-600 dark:text-violet-400',
  },
  amber: {
    gradient: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-200/50 dark:border-amber-500/20',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    gradient: 'from-red-500/10 to-red-600/5',
    border: 'border-red-200/50 dark:border-red-500/20',
    icon: 'text-red-600 dark:text-red-400',
  },
  neutral: {
    gradient: 'from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-800/50',
    border: 'border-neutral-200/50 dark:border-white/[0.08]',
    icon: 'text-neutral-600 dark:text-neutral-400',
  },
};

const SIZE_VARIANTS = {
  sm: {
    padding: 'p-3',
    iconSize: 'h-4 w-4',
    valueSize: 'text-lg',
    labelSize: 'text-xs',
  },
  md: {
    padding: 'p-4',
    iconSize: 'h-5 w-5',
    valueSize: 'text-2xl',
    labelSize: 'text-xs',
  },
  lg: {
    padding: 'p-6',
    iconSize: 'h-6 w-6',
    valueSize: 'text-3xl',
    labelSize: 'text-sm',
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'neutral',
  size = 'md',
  animate = true,
  delay = 0,
  className,
}: StatCardProps) {
  const colorVariant = COLOR_VARIANTS[color];
  const sizeVariant = SIZE_VARIANTS[size];

  const content = (
    <div
      className={cn(
        'rounded-2xl',
        sizeVariant.padding,
        'bg-gradient-to-br',
        colorVariant.gradient,
        'border',
        colorVariant.border,
        className
      )}
    >
      <div className={cn('flex items-center gap-2', colorVariant.icon)}>
        <Icon className={sizeVariant.iconSize} />
        <span className={cn('font-medium', sizeVariant.labelSize)}>{label}</span>
      </div>
      <p className={cn('mt-2 font-bold text-neutral-900 dark:text-white', sizeVariant.valueSize)}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {trend && (
        <div
          className={cn(
            'mt-1 flex items-center gap-1',
            sizeVariant.labelSize,
            trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500'
          )}
        >
          {trend.direction === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {trend.value > 0 ? '+' : ''}
          {trend.value}%
        </div>
      )}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {content}
    </motion.div>
  );
}

/**
 * Compact stat for inline display
 */
export interface CompactStatProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: 'blue' | 'emerald' | 'violet' | 'amber';
}

export function CompactStat({ icon: Icon, value, label, color = 'blue' }: CompactStatProps) {
  const iconColor = {
    blue: 'text-primary-500',
    emerald: 'text-emerald-500',
    violet: 'text-violet-500',
    amber: 'text-amber-500',
  }[color];

  return (
    <div
      className={cn(
        'rounded-xl p-4',
        'bg-white/80 dark:bg-white/[0.06]',
        'backdrop-blur-xl',
        'border border-neutral-200/50 dark:border-white/[0.08]'
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('h-5 w-5', iconColor)} />
        <span className="text-2xl font-bold text-neutral-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </div>
  );
}
