'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@giulio-leone/lib-design-system';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50/80 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/15">
          <Icon className="h-8 w-8 text-primary-500 dark:text-primary-400" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
