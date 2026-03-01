import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface ResponsiveActionPillProps {
  label: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  variant?: 'blue' | 'emerald' | 'purple' | 'red' | 'neutral';
  className?: string;
  showLabelOnMobile?: boolean;
  title?: string;
  isIconOnly?: boolean;
}

const variantClasses = {
  blue: 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30',
  emerald:
    'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30',
  purple:
    'bg-secondary-50 text-secondary-700 hover:bg-secondary-100 dark:bg-secondary-900/20 dark:text-secondary-400 dark:hover:bg-secondary-900/30',
  red: 'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20', // Red is usually ghost/icon-only in this context
  neutral:
    'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08]',
};

export function ResponsiveActionPill({
  label,
  icon,
  onClick,
  variant = 'blue',
  className,
  showLabelOnMobile = false,
  title,
  isIconOnly = false,
}: ResponsiveActionPillProps) {
  // Special handling for red/icon-only variant to match existing design
  if (isIconOnly) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
          variantClasses[variant],
          className
        )}
        title={title || label}
      >
        <span className="flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm',
        variantClasses[variant],
        className
      )}
      title={title || label}
    >
      <span className="flex items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4">
        {icon}
      </span>
      <span className={cn('truncate', !showLabelOnMobile && 'hidden md:inline')}>{label}</span>
    </button>
  );
}
