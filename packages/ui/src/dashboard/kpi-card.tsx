import { cn } from '@giulio-leone/lib-design-system';
import { Card } from '../card';

export interface KpiCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'primary' | 'violet' | 'emerald' | 'amber' | 'neutral';
}

const colors: Record<NonNullable<KpiCardProps['color']>, string> = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  neutral: 'bg-neutral-100 text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-300',
};

export function KpiCard({
  label,
  value,
  change,
  trend = 'flat',
  icon: Icon,
  color = 'neutral',
}: KpiCardProps) {
  return (
    <Card variant="glass" className="flex h-full flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            {label}
          </p>
          <h3 className="mt-1 truncate text-2xl font-bold text-neutral-900 dark:text-white">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={cn('shrink-0 rounded-xl p-2.5', colors[color])}>
            {<Icon className="h-5 w-5" />}
          </div>
        )}
      </div>
      {change && (
        <div
          className={cn(
            'mt-3 flex items-center text-xs font-semibold',
            trend === 'up' && 'text-emerald-500',
            trend === 'down' && 'text-rose-500',
            trend === 'flat' && 'text-neutral-500'
          )}
        >
          {change}
        </div>
      )}
    </Card>
  );
}
