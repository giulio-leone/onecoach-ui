'use client';

import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface ProgramWeekCardProps {
  weekNumber: number;
  focus?: string;
  notes?: string;
  children: React.ReactNode;
  className?: string;
}

export function ProgramWeekCard({
  weekNumber,
  focus,
  notes,
  children,
  className = '',
}: ProgramWeekCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900',
        className
      )}
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Settimana {weekNumber}
        </h2>
        {focus && <p className="text-sm text-neutral-600 dark:text-neutral-400">Focus: {focus}</p>}
        {notes && <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">{notes}</p>}
      </div>
      {children}
    </div>
  );
}
