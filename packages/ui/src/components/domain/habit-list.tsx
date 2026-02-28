'use client';

import { cn } from '@giulio-leone/lib-design-system';
import type { HabitProps } from './habit-card';

interface HabitListProps {
  habits: HabitProps[];
  onToggleHabit?: (id: string) => void;
  className?: string;
}

/**
 * Web version of HabitList using HTML elements
 */
export function HabitList({ habits, onToggleHabit, className }: HabitListProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {habits.map((habit: HabitProps) => (
        <div
          key={habit.id}
          className={cn(
            'group relative rounded-2xl border p-4 transition-all',
            'bg-white/50 shadow-sm backdrop-blur-sm',
            'dark:border-white/[0.08] dark:bg-neutral-900/50',
            'hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-800'
          )}
        >
          <div className="flex items-start gap-3">
            {/* Checkmark Button */}
            <button
              type="button"
              onClick={() => onToggleHabit?.(habit.id)}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                habit.completedToday
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-neutral-300 hover:border-indigo-500 dark:border-white/[0.1]'
              )}
            >
              {habit.completedToday && (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <h4
                className={cn(
                  'truncate font-semibold text-neutral-900 dark:text-white',
                  habit.completedToday && 'line-through opacity-60'
                )}
              >
                {habit.title}
              </h4>
              {habit.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {habit.description}
                </p>
              )}
              {typeof habit.streak === 'number' && habit.streak > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  🔥 {habit.streak} streak
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
