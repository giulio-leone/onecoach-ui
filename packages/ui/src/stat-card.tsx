import React from 'react';
import { cn } from '@onecoach/lib-design-system';
import { Card } from './card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  subtitle?: string;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | string;
  trend?: {
    value: number; // percentuale, es. 12.5
    isPositive: boolean;
    label?: string; // es. "vs last month"
  };
  className?: string;
}

function StatCardComponent({
  label,
  value,
  icon: Icon,
  subtitle,
  color = 'blue',
  trend,
  className,
}: StatCardProps) {
  const gradients = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  const gradientClass = gradients[color as keyof typeof gradients] || color;

  return (
    <Card
      variant="elevated"
      padding="md"
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:-translate-y-1',
        'bg-gradient-to-br from-white/50 to-white/20 backdrop-blur-xl dark:from-neutral-900/50 dark:to-neutral-900/20',
        'ring-1 ring-white/20 dark:ring-white/10',
        'border-neutral-200 dark:border-neutral-800',
        'hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50',
        className
      )}
    >
      {/* Gradient Glow Effect on Hover */}
      <div
        className={cn(
          'absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20',
          gradientClass ? `bg-gradient-to-br ${gradientClass}` : 'bg-blue-500'
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {value}
            </h3>
          </div>
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110',
              gradientClass
                ? `bg-gradient-to-br ${gradientClass} text-white shadow-lg shadow-${gradientClass.split('-')[1]}-500/20`
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="relative mt-4 flex items-center gap-2">
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                trend.isPositive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
          {subtitle && (
            <p className="truncate text-xs font-medium text-neutral-400 dark:text-neutral-500">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

export { StatCardComponent as StatCard };
