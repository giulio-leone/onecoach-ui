import type React from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Heading, Text } from '@giulio-leone/ui';
import { KpiCard, type KpiCardProps } from './kpi-card';

export interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  stats?: KpiCardProps[];
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  actions,
  stats,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn('mb-10 flex flex-col gap-6', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Heading level={1} size="3xl" weight="bold" className="tracking-tight text-neutral-900 dark:text-white">
            {title}
          </Heading>
          {description && (
            <Text size="base" className="text-neutral-600 dark:text-neutral-400">
              {description}
            </Text>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat: any) => (
            <KpiCard key={stat.label} {...stat} />
          ))}
        </div>
      )}
    </div>
  );
}
