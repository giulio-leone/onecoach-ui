'use client';

import { Check, Edit2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ExerciseSet } from '@giulio-leone/schemas';
import React from 'react';
import { Button } from '@giulio-leone/ui';

export interface LiveSetTrackerProps {
  set: ExerciseSet;
  setIndex: number;
  onComplete: (setIndex: number, setData: Partial<ExerciseSet>) => void;
  onUpdate: (setIndex: number, setData: Partial<ExerciseSet>) => void;
  isActive: boolean;
  isNext: boolean;
}

export function LiveSetTracker({
  set,
  setIndex,
  onComplete,
  onUpdate,
  isActive,
  isNext,
}: LiveSetTrackerProps) {
  const t = useTranslations('common.workout');

  const isCompleted = set.done || false;
  const actualReps = set.repsDone ?? set.reps ?? 0;
  const actualWeight = set.weightDone ?? set.weight ?? 0;
  const targetWeight = set.weight ?? 0;
  const targetReps = set.reps ?? 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE SET - Large focused card with gradient border
  // ═══════════════════════════════════════════════════════════════════════════
  if (isActive && !isCompleted) {
    return (
      <div className="relative">
        {/* Outer Gradient Border */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500 via-secondary-500 to-secondary-500 opacity-80" />

        {/* Inner Content */}
        <div className="relative rounded-3xl bg-neutral-900 p-5">
          {/* Header */}
          <div className="mb-5 text-center">
            <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
              CURRENT {t('set').toUpperCase()} {setIndex + 1}
            </span>
          </div>

          {/* Inputs Row */}
          <div className="mb-5 flex gap-4">
            {/* Weight Input */}
            <div className="flex-1">
              <label className="mb-2 block text-center text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                KG
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={actualWeight || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdate(setIndex, { weightDone: parseFloat(e.target.value) || 0 })
                }
                placeholder={String(targetWeight || 0)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-4 text-center text-3xl font-black text-white placeholder:text-neutral-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
              />
            </div>

            {/* Reps Input */}
            <div className="flex-1">
              <label className="mb-2 block text-center text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                REPS
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={actualReps || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdate(setIndex, { repsDone: parseInt(e.target.value) || 0 })
                }
                placeholder={String(targetReps || 0)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-4 text-center text-3xl font-black text-white placeholder:text-neutral-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
              />
            </div>
          </div>

          {/* Complete Button */}
          <Button
            onClick={() =>
              onComplete(setIndex, {
                repsDone: actualReps || targetReps,
                weightDone: actualWeight || targetWeight,
              })
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-6 text-base font-bold text-black shadow-lg transition-all hover:bg-neutral-100 active:scale-[0.98]"
          >
            <Check className="h-5 w-5 stroke-[3]" />
            {t('completeSet')}
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETED SET - Compact green success state
  // ═══════════════════════════════════════════════════════════════════════════
  if (isCompleted) {
    return (
      <div className="group flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">
              {actualWeight}
              <span className="text-neutral-400"> kg</span> × {actualReps}
              <span className="text-neutral-400"> reps</span>
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onUpdate(setIndex, { done: false })}
          className="rounded-lg p-2 text-neutral-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-neutral-800 hover:text-neutral-300"
          aria-label="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPCOMING SET - Ghosted target state
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors ${
        isNext
          ? 'border-neutral-800 bg-neutral-900/50'
          : 'border-transparent bg-transparent opacity-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-500">
          {setIndex + 1}
        </div>
        <div>
          <span className="text-sm text-neutral-400">
            {t('target')}:{' '}
            <span className="font-semibold text-neutral-300">
              {targetWeight}kg × {targetReps} reps
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
