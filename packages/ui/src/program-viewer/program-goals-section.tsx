'use client';

import { Target } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export interface ProgramGoalsSectionProps {
  goals: string[];
  variant?: 'workout' | 'nutrition';
  className?: string;
}

export function ProgramGoalsSection({
  goals,
  variant = 'workout',
  className = '',
}: ProgramGoalsSectionProps) {
  if (goals.length === 0) return null;

  const isWorkout = variant === 'workout';
  const badgeColor = isWorkout
    ? 'border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60'
    : 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60';

  return (
    <div
      className={cn(
        'mb-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Target className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Obiettivi</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {goals.map((goal, idx) => (
          <span
            key={idx}
            className={cn(
              'hover:bg-opacity-80 rounded-full border px-3 py-1 text-sm font-medium shadow-sm transition-all duration-200',
              badgeColor
            )}
          >
            {goal}
          </span>
        ))}
      </div>
    </div>
  );
}
