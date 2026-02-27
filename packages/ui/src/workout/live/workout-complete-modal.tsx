'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useRef } from 'react';
import { X, Trophy, Clock, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { getExerciseSets } from '@giulio-leone/one-workout';
import { formatDuration } from '@giulio-leone/lib-shared';
import type { WorkoutSession } from '@giulio-leone/types/workout';
import { type ExerciseSet } from '@giulio-leone/schemas';
import type { Exercise } from '@giulio-leone/types';
import { Button } from '../../button';
import { Heading, Text } from '../../typography';

interface WorkoutCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WorkoutSession;
  onViewSummary?: () => void;
  className?: string; // Standard prop
}

export function WorkoutCompleteModal({
  isOpen,
  onClose,
  session,
  onViewSummary,
  className = '',
}: WorkoutCompleteModalProps) {
  const t = useTranslations('workouts');

  // Calculate stats (SSOT: usa getExerciseSets)
  // Memoize exercises array to prevent recalculation on every render
  const exercises = useMemo(
    () => session.exercises || [],
    [session.exercises]
  );
  const totalExercises = exercises.length;

  // Capture fallback time at mount
  const fallbackEndTimeRef = useRef<number>(Date.now());

  const totalVolume = useMemo(() => {
    return exercises.reduce((acc, exercise) => {
      // getExerciseSets expects an Exercise from @giulio-leone/types which conflicts slightly with schemas
      const sets = getExerciseSets(exercise);
      const exerciseVolume = sets.reduce((sAcc: number, set: ExerciseSet) => {
        // Safe access to numeric properties
        const weight = set.weight || 0;
        const reps = set.reps || 0;
        return sAcc + weight * reps;
      }, 0);
      return acc + exerciseVolume;
    }, 0);
  }, [exercises]);

  // Memoize calculations to avoid impure function calls during render
  const { completedExercises, duration, totalSetsCompleted } = useMemo(() => {
    const completed = exercises.filter((ex: Exercise) => {
      const sets = getExerciseSets(ex);
      return sets.some((set: ExerciseSet) => set.done);
    }).length;

    // Calculate total volume
    let volume = 0;
    exercises.forEach((exercise) => {
      const sets = getExerciseSets(exercise);
      sets.forEach((set: ExerciseSet) => {
        if (set.done) {
          const reps = set.repsDone || set.reps || 0;
          const weight = set.weightDone || set.weight || 0;
          volume += reps * weight;
        }
      });
    });

    // Calculate duration - use pre-captured fallbackEndTime instead of Date.now()
    const startTime =
      session.startedAt instanceof Date
        ? session.startedAt.getTime()
        : new Date(session.startedAt).getTime();
    const endTime =
      session.completedAt instanceof Date
        ? session.completedAt.getTime()
        : session.completedAt
          ? new Date(session.completedAt).getTime()
          : fallbackEndTimeRef.current;
    //const dur = Math.max(0, Math.floor((endTime - startTime) / 1000));
    // Use fallback duration calculation if endTime is invalid or same as start
    const dur = Math.max(0, Math.floor((endTime - startTime) / 1000));

    // Count total sets
    const setsCompleted = exercises.reduce((sum, ex) => {
      const sets = getExerciseSets(ex);
      return sum + sets.filter((set: ExerciseSet) => set.done).length;
    }, 0);

    return {
      completedExercises: completed,
      totalVolume: volume,
      duration: dur,
      totalSetsCompleted: setsCompleted,
    };
  }, [exercises, session.startedAt, session.completedAt]);

  if (!isOpen) return null;

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl ring-1 ring-white/10 ${className}`}
      >
        {/* Decorative Background Glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-[80px]" />

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-white/5 text-neutral-400 backdrop-blur-sm hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="relative z-10 px-6 pt-10 pb-8 text-center">
          {/* Hero Icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <Trophy className="h-10 w-10 text-white drop-shadow-md" />
          </div>

          <Heading
            level={2}
            size="3xl"
            weight="extrabold"
            className="mb-2 tracking-tight text-white"
          >
            {t('workout_complete_modal.allenamento_completato')}
          </Heading>
          <Text size="base" className="mb-8 text-neutral-400">
            {t('workout_complete_modal.ottimo_lavoro_continua_cosi')}
          </Text>

          {/* Stats Grid - Glass Style */}
          <div className="mb-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-neutral-500 uppercase">
                <Clock className="h-3.5 w-3.5" /> Durata
              </div>
              <div className="text-xl font-bold text-white">{formatDuration(duration)}</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-neutral-500 uppercase">
                <TrendingUp className="h-3.5 w-3.5" /> Volume
              </div>
              <div className="text-xl font-bold text-white">
                {totalVolume.toLocaleString('it-IT')} kg
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-neutral-500 uppercase">
                <CheckCircle2 className="h-3.5 w-3.5" /> Esercizi
              </div>
              <div className="text-xl font-bold text-white">
                {completedExercises}{' '}
                <span className="text-sm font-medium text-neutral-500">/ {totalExercises}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-neutral-500 uppercase">
                <TrendingUp className="h-3.5 w-3.5" /> Serie
              </div>
              <div className="text-xl font-bold text-white">{totalSetsCompleted}</div>
            </div>
          </div>

          {/* Personal Records Banner - if any (placeholder logic for now) */}
          <div className="mb-8 overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-indigo-500/20 p-2">
                <Trophy className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <Heading level={4} size="sm" weight="bold" className="text-indigo-300">
                  {t('workout_complete_modal.nessun_nuovo_record')}
                </Heading>
                <Text size="xs" className="mt-0.5 text-indigo-200/60">
                  {t('workout_complete_modal.spingi_di_piu_la_prossima_volta_per_batt')}
                </Text>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={onClose}
              className="order-2 flex-1 rounded-xl border-neutral-700 bg-transparent py-6 text-sm font-bold text-neutral-300 hover:bg-white/5 hover:text-white sm:order-1"
            >
              Chiudi
            </Button>

            {onViewSummary && (
              <Button
                onClick={onViewSummary}
                className="order-1 flex-1 gap-2 rounded-xl bg-emerald-600 py-6 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02] hover:bg-emerald-500 sm:order-2"
              >
                {t('workout_complete_modal.vedi_dettagli')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
