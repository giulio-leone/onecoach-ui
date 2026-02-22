/**
 * EmptyState Component
 *
 * Generic empty state component for visual builders
 * Used when no items are present (weeks, days, exercises, meals, etc.)
 * Fully optimized for dark mode
 */

import React from 'react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed px-4 py-8 text-center sm:py-12',
        darkModeClasses.border.base,
        darkModeClasses.bg.subtle,
        className
      )}
    >
      {icon && (
        <div className={cn('mx-auto mb-4 h-10 w-10 sm:h-12 sm:w-12', darkModeClasses.text.muted)}>
          {icon}
        </div>
      )}
      <p className={cn('text-sm sm:text-base', darkModeClasses.text.muted)}>{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={cn(
            'mt-4 min-h-[44px] touch-manipulation rounded-xl border-2 border-dashed px-4 py-2 text-sm font-medium transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600',
            darkModeClasses.border.base,
            darkModeClasses.text.secondary
          )}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
