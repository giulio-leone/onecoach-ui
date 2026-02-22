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
            'bg-white/50 backdrop-blur-sm shadow-sm',
            'dark:bg-neutral-900/50 dark:border-neutral-800',
            'hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800'
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
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-neutral-300 hover:border-indigo-500 dark:border-neutral-600'
              )}
            >
              {habit.completedToday && (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                'font-semibold text-neutral-900 dark:text-white truncate',
                habit.completedToday && 'line-through opacity-60'
              )}>
                {habit.title}
              </h4>
              {habit.description && (
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
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
