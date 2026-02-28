import { cn } from '@giulio-leone/lib-design-system';
import { Heading, Text } from '@giulio-leone/ui';

export interface KpiCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'violet' | 'emerald' | 'amber' | 'neutral';
}

const colors: Record<NonNullable<KpiCardProps['color']>, string> = {
  blue: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
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
    <div className="flex h-full flex-col justify-between rounded-xl border border-neutral-200/50 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-neutral-800/50 dark:bg-neutral-900/80">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Text size="xs" weight="medium" className="truncate tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            {label}
          </Text>
          <Heading level={3} size="2xl" weight="bold" className="mt-1 truncate text-neutral-900 dark:text-white">
            {value}
          </Heading>
        </div>
        {Icon && (
          <div className={cn('shrink-0 rounded-xl p-2.5', colors[color])}>
            <Icon className="h-5 w-5" />
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
    </div>
  );
}
