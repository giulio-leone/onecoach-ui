/**
 * Admin Card Component
 *
 * Componente riutilizzabile per card nelle pagine admin
 * Supporta varianti glass e default con padding configurabile
 * Principi: KISS, SOLID, DRY
 */

import { type ReactNode } from 'react';
import { cn, darkModeClasses } from '@onecoach/lib-design-system';

export interface AdminCardProps {
  title?: string;
  description?: string;
  variant?: 'glass' | 'default';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const variantClasses = {
  glass: cn(
    'rounded-xl border backdrop-blur-sm',
    'bg-white/80 dark:bg-neutral-900/80',
    'border-neutral-200/50 dark:border-neutral-800/50',
    'shadow-sm'
  ),
  default: cn(
    'rounded-xl border',
    darkModeClasses.card.base,
    darkModeClasses.border.base,
    'shadow-sm'
  ),
};

export function AdminCard({
  title,
  description,
  variant = 'default',
  padding = 'md',
  className,
  children,
}: AdminCardProps) {
  return (
    <div className={cn(variantClasses[variant], paddingClasses[padding], className)}>
      {(title || description) && (
        <div className="mb-4 last:mb-0">
          {title && (
            <h3 className={cn('text-lg font-semibold', darkModeClasses.text.primary)}>{title}</h3>
          )}
          {description && (
            <p className={cn('mt-1 text-sm', darkModeClasses.text.secondary)}>{description}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
