/**
 * IconBadge Component
 *
 * Reusable icon badge with optimized dark mode styling.
 * Used for transaction icons, status indicators, etc.
 */

'use client';

import { cn } from '@giulio-leone/lib-design-system';
import type { LucideIcon } from 'lucide-react';

export interface IconBadgeProps {
  icon: LucideIcon;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

const iconSizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const variantClasses = {
  success:
    'bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
  error:
    'bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
  warning:
    'bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
  info: 'bg-primary-100 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400',
  neutral:
    'bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400',
  purple:
    'bg-secondary-100 dark:bg-secondary-900/40 border border-secondary-200 dark:border-secondary-800 text-secondary-600 dark:text-secondary-400',
};

export function IconBadge({
  icon: Icon,
  variant = 'neutral',
  size = 'md',
  className,
}: IconBadgeProps) {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <Icon className={iconSizeClasses[size]} />
    </div>
  );
}
