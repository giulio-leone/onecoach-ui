'use client';

import { useState } from 'react';
import { Layers, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Superset, Exercise, ExerciseSet } from '@giulio-leone/schemas';
import { Card } from '@giulio-leone/ui';

export interface LiveSupersetCardProps {
  superset: Superset;
  onExerciseComplete: (exerciseIdx: number) => void;
  className?: string;
}

function getSetsFromExercise(exercise: Exercise): ExerciseSet[] {
  const sets: ExerciseSet[] = [];
  for (const group of exercise.setGroups) {
    for (const set of group.sets) {
      sets.push(set);
    }
  }
  return sets;
}

/**
 * LiveSupersetCard - Interactive superset for live workout
 *
 * Displays linked exercises with visual indicators.
 * Exercises are performed back-to-back with minimal rest.
 */
export function LiveSupersetCard({
  superset,
  onExerciseComplete,
  className = '',
}: LiveSupersetCardProps) {
  const [expandedExercise, setExpandedExercise] = useState<number | null>(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  const allComplete = completedExercises.size === superset.exercises.length;

  const handleExerciseDone = (exerciseIdx: number) => {
    const newCompleted = new Set(completedExercises);
    newCompleted.add(exerciseIdx);
    setCompletedExercises(newCompleted);
    onExerciseComplete(exerciseIdx);

    // Auto-expand next exercise
    const nextIdx = exerciseIdx + 1;
    if (nextIdx < superset.exercises.length) {
      setExpandedExercise(nextIdx);
    }
  };

  return (
    <Card variant="glass" className={`overflow-hidden ${className}`} gradient={allComplete}>
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-500/10 to-secondary-500/10 px-5 py-4 dark:from-secondary-500/20 dark:to-secondary-500/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-500/20 dark:bg-secondary-500/30">
            <Layers className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-bold text-secondary-700 uppercase dark:bg-secondary-500/20 dark:text-secondary-400">
                SUPERSET
              </span>
              {allComplete && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  COMPLETATO
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {superset.name || 'Superset'}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {superset.exercises.length} esercizi • {completedExercises.size}/
              {superset.exercises.length} completati
              {(superset.rounds ?? 1) > 1 && ` • ${superset.rounds} round`}
            </p>
          </div>
        </div>

        {/* Visual link indicator */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {superset.exercises.map((ex, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className={`flex h-8 items-center rounded-full px-3 text-sm font-medium ${
                  completedExercises.has(idx)
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : expandedExercise === idx
                      ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-400'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-white/[0.04] dark:text-neutral-400'
                }`}
              >
                {ex.name}
              </div>
              {idx < superset.exercises.length - 1 && (
                <div className="h-0.5 w-4 bg-secondary-300 dark:bg-secondary-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exercises (Accordion) */}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {superset.exercises.map((exercise, exerciseIdx) => {
          const isExpanded = expandedExercise === exerciseIdx;
          const isDone = completedExercises.has(exerciseIdx);
          const sets = getSetsFromExercise(exercise);

          return (
            <div key={exerciseIdx}>
              {/* Exercise Header */}
              <button
                onClick={() => setExpandedExercise(isExpanded ? null : exerciseIdx)}
                className={`flex w-full items-center justify-between px-5 py-3 transition-colors ${
                  isDone
                    ? 'bg-emerald-50 dark:bg-emerald-500/5'
                    : 'hover:bg-neutral-50 dark:hover:bg-white/[0.06]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                    {exerciseIdx + 1}
                  </span>
                  <div className="text-left">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {exercise.name}
                    </h3>
                    <p className="text-xs text-neutral-500">{sets.length} serie</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDone && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Sets Preview (Collapsible) */}
              {isExpanded && !isDone && (
                <div className="bg-neutral-50 px-5 py-4 dark:bg-neutral-900/30">
                  <div className="mb-3 grid grid-cols-3 gap-3 text-center">
                    {sets.slice(0, 3).map((set, setIdx) => (
                      <div key={setIdx} className="rounded-lg bg-white p-3 dark:bg-white/[0.04]">
                        <p className="text-xs text-neutral-500">Set {setIdx + 1}</p>
                        <p className="font-bold text-neutral-900 dark:text-white">
                          {set.reps ?? '-'} rep
                          {set.weight ? ` × ${set.weight}kg` : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleExerciseDone(exerciseIdx)}
                    className="w-full rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-500 py-3 text-sm font-bold text-white transition-all hover:shadow-lg"
                  >
                    <CheckCircle2 className="mr-2 inline-block h-4 w-4" />
                    Fatto
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rest Info */}
      <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          💡 Riposo tra esercizi: {superset.restBetweenExercises}s • Dopo superset:{' '}
          {superset.restAfterSuperset}s
        </p>
      </div>

      {/* Notes */}
      {superset.notes && (
        <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{superset.notes}</p>
        </div>
      )}
    </Card>
  );
}
