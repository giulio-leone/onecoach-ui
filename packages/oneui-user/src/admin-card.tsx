/**
 * Admin Card Component
 *
 * Reusable card for admin pages.
 * Supports glass and default variants with configurable padding.
 */

import { type ReactNode } from 'react';
import { cn, darkModeClasses } from '@giulio-leone/lib-design-system';
import { Heading, Text } from '@giulio-leone/ui';

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
            <Heading level={3} size="lg" weight="semibold" className={cn(darkModeClasses.text.primary)}>
              {title}
            </Heading>
          )}
          {description && (
            <Text size="sm" className={cn('mt-1', darkModeClasses.text.secondary)}>
              {description}
            </Text>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
