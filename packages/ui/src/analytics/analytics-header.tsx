import { Card, Heading, Text, Button } from '@giulio-leone/ui';
import { Calendar, Download, Share2 } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export type Period = '7d' | '30d' | '90d' | '1y' | 'custom';

interface AnalyticsHeaderProps {
  title: string;
  subtitle?: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
  className?: string;
}

export function AnalyticsHeader({
  title,
  subtitle,
  period,
  onPeriodChange,
  className,
}: AnalyticsHeaderProps) {
  const periods: Array<{ label: string; value: Period }> = [
    { label: '7G', value: '7d' },
    { label: '30G', value: '30d' },
    { label: '90G', value: '90d' },
    { label: '1A', value: '1y' },
  ];

  return (
    <div className={cn('mb-8 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <Heading level={1} size="3xl" weight="bold" className="text-neutral-900 dark:text-white">
            {title}
          </Heading>
          {subtitle && (
            <Text className="mt-1 text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </Text>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="rounded-full border border-white/10 bg-white/10 p-2 transition-colors hover:bg-white/20 h-auto w-auto"
          >
            <Download size={20} className="text-neutral-700 dark:text-neutral-300" />
          </Button>
          <Button
            variant="ghost"
            className="rounded-full border border-white/10 bg-white/10 p-2 transition-colors hover:bg-white/20 h-auto w-auto"
          >
            <Share2 size={20} className="text-neutral-700 dark:text-neutral-300" />
          </Button>
        </div>
      </div>

      <Card variant="glass" className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-1 rounded-lg bg-neutral-100 p-1 dark:bg-white/[0.04]">
          {periods.map((p: any) => (
            <Button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              variant="ghost"
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-all h-auto',
                period === p.value
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-white/[0.08]'
              )}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          className="flex items-center space-x-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/10 h-auto"
        >
          <Calendar size={16} className="text-neutral-500 dark:text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Personalizza
          </span>
        </Button>
      </Card>
    </div>
  );
}
