'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, Timer, Activity } from 'lucide-react';
import type { WarmupSection } from '@giulio-leone/schemas';
import { Card } from '@giulio-leone/ui';

export interface LiveWarmupCardProps {
  warmup: WarmupSection;
  onComplete: () => void;
  className?: string;
}

/**
 * LiveWarmupCard - Interactive warmup section for live workout
 *
 * Displays warmup exercises with a countdown timer.
 * Users can mark exercises as done or skip the warmup.
 */
export function LiveWarmupCard({ warmup, onComplete, className = '' }: LiveWarmupCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(warmup.durationMinutes * 60);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onComplete]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExercise = (index: number) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedExercises(newCompleted);

    // Auto-complete if all exercises done
    if (newCompleted.size === warmup.exercises.length) {
      setIsCompleted(true);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsCompleted(true);
    onComplete();
  };

  return (
    <Card variant="glass" className={`overflow-hidden ${className}`} gradient={isCompleted}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-5 py-4 dark:from-amber-500/20 dark:to-orange-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 dark:bg-amber-500/30">
              <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {warmup.name || 'Riscaldamento'}
                </h2>
                {isCompleted && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    COMPLETATO
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {warmup.exercises.length} esercizi • {warmup.durationMinutes} min
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 dark:bg-white/[0.04]">
              <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="font-mono text-xl font-bold text-neutral-900 dark:text-white">
                {formatTime(timeRemaining)}
              </span>
            </div>

            {!isCompleted && (
              <button
                onClick={() => setIsActive(!isActive)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-white/[0.08] dark:text-neutral-200'
                }`}
              >
                {isActive ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="divide-y divide-neutral-200 dark:divide-white/[0.08]">
        {warmup.exercises.map((exercise, index) => {
          const isDone = completedExercises.has(index);

          return (
            <button
              key={index}
              onClick={() => !isCompleted && toggleExercise(index)}
              disabled={isCompleted}
              className={`flex w-full items-center gap-4 px-5 py-3 text-left transition-colors ${
                isDone
                  ? 'bg-emerald-50 dark:bg-emerald-500/10'
                  : 'hover:bg-neutral-50 dark:hover:bg-white/[0.06]/50'
              } ${isCompleted ? 'cursor-default opacity-60' : ''}`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-neutral-300 dark:border-white/[0.1]'
                }`}
              >
                {isDone && <CheckCircle2 className="h-4 w-4" />}
              </div>

              <div className="flex-1">
                <p
                  className={`font-medium ${isDone ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-white'}`}
                >
                  {exercise.name}
                </p>
                {(exercise.duration || exercise.reps) && (
                  <p className="text-sm text-neutral-500">
                    {exercise.duration
                      ? `${Math.round(exercise.duration / 60)} min`
                      : `${exercise.reps} rep`}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Skip Button */}
      {!isCompleted && (
        <div className="border-t border-neutral-200/60 px-5 py-3 dark:border-white/[0.08]">
          <button
            onClick={handleSkip}
            className="w-full rounded-lg bg-neutral-100 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08]"
          >
            Salta riscaldamento
          </button>
        </div>
      )}

      {/* Notes */}
      {warmup.notes && (
        <div className="border-t border-neutral-200/60 px-5 py-3 dark:border-white/[0.08]">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{warmup.notes}</p>
        </div>
      )}
    </Card>
  );
}
