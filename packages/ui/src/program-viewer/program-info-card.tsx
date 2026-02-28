'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export interface ProgramMetadata {
  label: string;
  value: string | React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export interface ProgramInfoCardProps {
  name: string;
  description?: string;
  metadata?: ProgramMetadata[];
  icon?: LucideIcon;
  variant?: 'workout' | 'nutrition';
  className?: string;
}

export function ProgramInfoCard({
  name,
  description,
  metadata = [],
  icon: Icon,
  variant = 'workout',
  className = '',
}: ProgramInfoCardProps) {
  const isWorkout = variant === 'workout';
  const gradientFrom = isWorkout ? 'from-green-50/50' : 'from-emerald-50/50';
  const iconGradient = isWorkout
    ? 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700'
    : 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700';
  const iconColor = isWorkout
    ? 'text-green-600 dark:text-green-400'
    : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div
      className={cn(
        'mb-8 overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br p-6 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-white/[0.08] dark:shadow-2xl dark:shadow-neutral-950/50 dark:hover:shadow-neutral-950/70',
        gradientFrom,
        'via-white to-white dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800/90',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div
            className={cn(
              'rounded-xl bg-gradient-to-br p-4 shadow-lg dark:shadow-green-900/20',
              iconGradient
            )}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{name}</h1>
          {description && (
            <p className="mt-2 text-base text-neutral-600 dark:text-neutral-300">{description}</p>
          )}
          {metadata.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {metadata.map((meta, idx) => {
                const MetaIcon = meta.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 shadow-sm backdrop-blur-sm dark:border-white/[0.1] dark:bg-neutral-700/80"
                  >
                    {MetaIcon && <MetaIcon className={cn('h-5 w-5', iconColor)} />}
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {meta.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
