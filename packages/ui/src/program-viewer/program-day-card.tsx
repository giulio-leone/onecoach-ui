'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export interface ProgramDayCardProps {
  dayNumber: number;
  name?: string;
  notes?: string;
  children: React.ReactNode;
  onTrack?: () => void;
  trackLabel?: string;
  variant?: 'workout' | 'nutrition';
  className?: string;
}

export function ProgramDayCard({
  dayNumber,
  name,
  notes,
  children,
  onTrack,
  trackLabel = 'Inizia Allenamento',
  variant = 'workout',
  className = '',
}: ProgramDayCardProps) {
  const isWorkout = variant === 'workout';
  const trackColor = isWorkout
    ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
    : 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800';

  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200/60 bg-neutral-50 p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-white/[0.08] dark:bg-neutral-800/50',
        className
      )}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {name || `Giorno ${dayNumber}`}
            </h3>
            {notes && (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{notes}</p>
            )}
          </div>
          {onTrack && (
            <button
              onClick={onTrack}
              className={cn(
                'ml-4 flex min-h-[44px] touch-manipulation items-center gap-2 rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]',
                trackColor
              )}
              aria-label={trackLabel}
            >
              <Play className="h-4 w-4" />
              {trackLabel}
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
