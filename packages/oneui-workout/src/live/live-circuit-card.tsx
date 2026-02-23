'use client';

import { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2 } from 'lucide-react';
import type { Circuit } from '@giulio-leone/schemas';
import { Card } from '@giulio-leone/ui';

export interface LiveCircuitCardProps {
  circuit: Circuit;
  onComplete: (data: { roundsCompleted: number }) => void;
  className?: string;
}

/**
 * LiveCircuitCard - Interactive circuit training for live workout
 *
 * Displays exercises in sequence with round counter.
 * Each round cycles through all exercises.
 */
export function LiveCircuitCard({ circuit, onComplete, className = '' }: LiveCircuitCardProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [exercisesDone, setExercisesDone] = useState<Set<string>>(new Set());
  const [restCountdown, setRestCountdown] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalExercises = circuit.exercises.length;
  const totalRounds = circuit.rounds;
  const currentExercise = circuit.exercises[currentExerciseIdx];

  // Create unique key for exercise completion (round-exercise)
  const getExerciseKey = (round: number, idx: number) => `${round}-${idx}`;

  // Rest timer effect
  useEffect(() => {
    if (restCountdown === null || restCountdown <= 0) return;

    const timer = setTimeout(() => {
      setRestCountdown((prev) => (prev ?? 0) - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [restCountdown]);

  // Handle rest completion
  useEffect(() => {
    if (restCountdown === 0) {
      setRestCountdown(null);
    }
  }, [restCountdown]);

  const handleExerciseDone = () => {
    if (!currentExercise) return;

    const key = getExerciseKey(currentRound, currentExerciseIdx);
    setExercisesDone((prev) => new Set(prev).add(key));

    const isLastExercise = currentExerciseIdx === totalExercises - 1;
    const isLastRound = currentRound === totalRounds;

    if (isLastExercise && isLastRound) {
      // Circuit complete!
      setIsCompleted(true);
      onComplete({ roundsCompleted: totalRounds });
    } else if (isLastExercise) {
      // End of round - start rest between rounds
      setRestCountdown(circuit.restBetweenRounds);
      setCurrentRound((prev) => prev + 1);
      setCurrentExerciseIdx(0);
    } else {
      // Move to next exercise - start rest between exercises
      if (circuit.restBetweenExercises > 0) {
        setRestCountdown(circuit.restBetweenExercises);
      }
      setCurrentExerciseIdx((prev) => prev + 1);
    }
  };

  // Calculate progress
  const completedCount = exercisesDone.size;
  const totalCount = totalExercises * totalRounds;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <Card variant="glass" className={`overflow-hidden ${className}`} gradient={isCompleted}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 px-5 py-4 dark:from-orange-500/20 dark:to-red-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 dark:bg-orange-500/30">
              <RotateCw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 uppercase dark:bg-orange-500/20 dark:text-orange-400">
                  CIRCUIT
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    COMPLETATO
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{circuit.name}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {totalExercises} esercizi • {totalRounds} round
              </p>
            </div>
          </div>

          {/* Round Counter */}
          <div className="flex items-center gap-2 rounded-xl bg-orange-100 px-4 py-2 dark:bg-orange-500/20">
            <span className="text-xs font-bold text-orange-700 uppercase dark:text-orange-400">
              Round
            </span>
            <span className="font-mono text-2xl font-bold text-orange-700 dark:text-orange-400">
              {currentRound}/{totalRounds}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Progresso circuito</span>
            <span>
              {completedCount}/{totalCount} esercizi
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rest Timer Display */}
      {restCountdown !== null && restCountdown > 0 && (
        <div className="flex items-center justify-center gap-3 bg-amber-50 px-5 py-6 dark:bg-amber-500/10">
          <div className="text-center">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Riposo</p>
            <span className="font-mono text-4xl font-bold text-amber-700 dark:text-amber-400">
              {restCountdown}s
            </span>
          </div>
        </div>
      )}

      {/* Current Exercise Display */}
      {!restCountdown && !isCompleted && currentExercise && (
        <div className="px-5 py-6">
          <div className="text-center">
            <span className="text-xs font-medium text-neutral-500 uppercase">
              Esercizio {currentExerciseIdx + 1} di {totalExercises}
            </span>
            <h3 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
              {currentExercise.name}
            </h3>

            <div className="mt-4 flex items-center justify-center gap-4">
              {currentExercise.reps && (
                <div className="rounded-xl bg-neutral-100 px-6 py-3 dark:bg-neutral-800">
                  <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                    {currentExercise.reps}
                  </span>
                  <span className="ml-2 text-sm text-neutral-500">rep</span>
                </div>
              )}
              {currentExercise.duration && (
                <div className="rounded-xl bg-neutral-100 px-6 py-3 dark:bg-neutral-800">
                  <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                    {currentExercise.duration}
                  </span>
                  <span className="ml-2 text-sm text-neutral-500">sec</span>
                </div>
              )}
            </div>

            {currentExercise.notes && (
              <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                {currentExercise.notes}
              </p>
            )}
          </div>

          {/* Complete Exercise Button */}
          <button
            onClick={handleExerciseDone}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-4 text-lg font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/30"
          >
            <CheckCircle2 className="mr-2 inline-block h-5 w-5" />
            Fatto!
          </button>
        </div>
      )}

      {/* Exercises List (Overview) */}
      <div className="border-t border-neutral-200 dark:border-neutral-700">
        <div className="px-5 py-2">
          <span className="text-xs font-medium text-neutral-500 uppercase">
            Esercizi nel circuito
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 px-5 pb-4">
          {circuit.exercises.map((ex, idx) => {
            const isDone = exercisesDone.has(getExerciseKey(currentRound, idx));
            const isActive = idx === currentExerciseIdx && !restCountdown;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : isActive
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {isDone && <CheckCircle2 className="h-4 w-4" />}
                <span className="truncate">{ex.name}</span>
                {ex.reps && <span className="ml-auto text-xs">×{ex.reps}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      {circuit.notes && (
        <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{circuit.notes}</p>
        </div>
      )}
    </Card>
  );
}
