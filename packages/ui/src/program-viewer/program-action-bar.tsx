'use client';

import { ArrowLeft, Play, Trash2 } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';

export interface ProgramActionBarProps {
  onBack: () => void;
  onTrack?: () => void;
  onDelete?: () => void;
  trackLabel?: string;
  deleteLabel?: string;
  variant?: 'workout' | 'nutrition';
  className?: string;
}

export function ProgramActionBar({
  onBack,
  onTrack,
  onDelete,
  trackLabel = 'Track Today',
  deleteLabel = 'Elimina Programma',
  variant = 'workout',
  className = '',
}: ProgramActionBarProps) {
  const isWorkout = variant === 'workout';
  const trackColor = isWorkout
    ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
    : 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800';

  return (
    <div className={cn('mb-6 flex items-center justify-between', className)}>
      <button
        onClick={onBack}
        className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 hover:shadow-sm active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800/50 dark:bg-neutral-900 dark:text-neutral-300"
        aria-label="Torna indietro"
      >
        <ArrowLeft className="h-5 w-5" />
        Indietro
      </button>
      <div className="flex items-center gap-3">
        {onTrack && (
          <button
            onClick={onTrack}
            className={cn(
              'flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl bg-gradient-to-r px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98]',
              trackColor
            )}
            aria-label={trackLabel}
          >
            <Play className="h-4 w-4" />
            {trackLabel}
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-all duration-200 hover:bg-red-100 hover:shadow-sm active:scale-[0.98] dark:border-red-700/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            aria-label={deleteLabel}
          >
            <Trash2 className="h-4 w-4" />
            {deleteLabel}
          </button>
        )}
      </div>
    </div>
  );
}
