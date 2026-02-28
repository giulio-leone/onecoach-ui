'use client';

import { cn } from '@giulio-leone/lib-design-system';
import { Check, Flame } from 'lucide-react';

export interface HabitProps {
  id: string;
  title: string;
  description?: string;
  streak: number;
  completedToday: boolean;
  frequency: 'DAILY' | 'WEEKLY';
  onToggle?: (id: string) => void;
  className?: string;
}

export function HabitCard({
  id,
  title,
  description,
  streak,
  completedToday,
  frequency,
  onToggle,
  className,
}: HabitProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-950',
        completedToday &&
          'border-green-500/50 bg-green-50/50 dark:border-green-500/30 dark:bg-green-900/10',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'font-bold text-neutral-900 dark:text-white',
                completedToday && 'text-green-700 dark:text-green-400'
              )}
            >
              {title}
            </h3>
            {frequency === 'WEEKLY' && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500 dark:bg-white/[0.04] dark:text-neutral-400">
                WEEKLY
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          )}

          <div className="mt-3 flex items-center gap-4">
            <div
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium',
                streak > 0 ? 'text-orange-500' : 'text-neutral-400'
              )}
            >
              <Flame className={cn('h-4 w-4', streak > 0 && 'fill-orange-500')} />
              <span>{streak} Day Streak</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggle?.(id)}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-all active:scale-95',
            completedToday
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-neutral-100 text-neutral-300 hover:bg-neutral-200 hover:text-neutral-400 dark:bg-white/[0.04] dark:text-neutral-600 dark:hover:bg-white/[0.08] dark:hover:text-neutral-500'
          )}
        >
          {completedToday ? (
            <Check className="h-6 w-6" strokeWidth={3} />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-current" />
          )}
        </button>
      </div>

      {/* Progress Bar Background for Weekly habits could go here */}
    </div>
  );
}
