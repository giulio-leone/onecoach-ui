'use client';

import { useMemo } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface DayData {
  date: string; // ISO date
  calories: number;
  target: number;
}

export interface WeeklySummaryProps {
  days: DayData[];
  className?: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklySummary({ days, className }: WeeklySummaryProps) {
  const { maxValue, average, bars } = useMemo(() => {
    const max = Math.max(...days.map((d) => Math.max(d.calories, d.target)), 1);
    const avg = days.length > 0
      ? Math.round(days.reduce((s, d) => s + d.calories, 0) / days.length)
      : 0;

    const bars = days.map((d, i) => {
      const pct = (d.calories / max) * 100;
      const targetPct = (d.target / max) * 100;
      const isOver = d.calories > d.target;
      const isToday = i === days.length - 1;

      return { ...d, pct, targetPct, isOver, isToday, dayLabel: DAY_LABELS[i % 7] };
    });

    return { maxValue: max, average: avg, bars };
  }, [days]);

  return (
    <div className={cn('rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 backdrop-blur-md', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Weekly Overview</h3>
        <span className="text-xs text-neutral-400">Avg: {average} kcal</span>
      </div>

      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {bars.map((bar, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="relative w-full" style={{ height: 100 }}>
              {/* Target line */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-neutral-600"
                style={{ bottom: `${bar.targetPct}%` }}
              />
              {/* Bar */}
              <div
                className={cn(
                  'absolute bottom-0 left-1/2 w-3/4 -translate-x-1/2 rounded-t-sm transition-all duration-300',
                  bar.isOver
                    ? 'bg-red-500/80'
                    : bar.isToday
                      ? 'bg-primary-500'
                      : 'bg-primary-500/50',
                )}
                style={{ height: `${Math.min(bar.pct, 100)}%` }}
              />
            </div>
            <span className={cn(
              'text-[10px]',
              bar.isToday ? 'font-bold text-white' : 'text-neutral-500',
            )}>
              {bar.dayLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-neutral-500">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-primary-500" />
          <span>Calories</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-3 border-t border-dashed border-neutral-500" />
          <span>Target</span>
        </div>
      </div>
    </div>
  );
}
