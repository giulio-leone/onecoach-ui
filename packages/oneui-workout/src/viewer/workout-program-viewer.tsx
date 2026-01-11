'use client';

import { useRouter } from 'next/navigation';
import { Dumbbell, Calendar, Target, AlertCircle } from 'lucide-react';
import { getExerciseSets } from '@onecoach/one-workout';
import { DifficultyLevel } from '@onecoach/types/client';
import { useTranslations } from 'next-intl';
import {
  ProgramActionBar,
  ProgramInfoCard,
  ProgramGoalsSection,
  ProgramWeekCard,
  ProgramDayCard,
  type ProgramMetadata,
} from '@onecoach/ui';
import { useWeightUnit } from '@onecoach/lib-api/hooks';
import { formatWeightByUnit } from '@onecoach/lib-shared';
import { getWeekAndDayFromDate } from '@onecoach/lib-shared';
import type { WorkoutProgram, ExerciseSet, WorkoutDay, Exercise } from '@onecoach/types-workout';

// workoutApi is not needed in viewer - deletion is handled by parent

function formatMuscleLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\s+|_/)
    .filter(Boolean)
    .map((part: any) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function collectTargetMuscles(day: WorkoutDay): string[] {
  const fromDay = (day.targetMuscles || []).map(formatMuscleLabel);
  const fromExercises = (day.exercises || [])
    .flatMap((exercise) => exercise.muscleGroups || [])
    .map(formatMuscleLabel);
  return Array.from(new Set([...fromDay, ...fromExercises])).filter(Boolean) as string[];
}

function describeSet(
  set: ExerciseSet,
  index: number,
  repRange?: string,
  weightUnit: 'KG' | 'LBS' = 'KG'
): string {
  const parts: string[] = [];

  // Reps
  if (set.reps !== undefined) {
    if (set.repsMax) {
      parts.push(`${set.reps}-${set.repsMax} rip`);
    } else {
      parts.push(`${set.reps} rip`);
    }
  } else if (repRange) {
    parts.push(`${repRange} rip`);
  }

  // Duration
  if (set.duration !== undefined) {
    parts.push(`${set.duration}s`);
  }

  // Weight
  if (set.weight !== null && set.weight !== undefined) {
    const minWeight = formatWeightByUnit(set.weight, set.weightLbs ?? null, weightUnit);
    if (set.weightMax) {
      const maxWeight = formatWeightByUnit(set.weightMax, null, weightUnit);
      parts.push(`${minWeight}-${maxWeight}`);
    } else {
      parts.push(minWeight);
    }
  }

  // Intensity %
  if (set.intensityPercent !== null && set.intensityPercent !== undefined) {
    if (set.intensityPercentMax) {
      parts.push(`${set.intensityPercent}-${set.intensityPercentMax}% 1RM`);
    } else {
      parts.push(`${set.intensityPercent}% 1RM`);
    }
  }

  // RPE
  if (set.rpe !== null && set.rpe !== undefined) {
    if (set.rpeMax) {
      parts.push(`RPE ${set.rpe}-${set.rpeMax}`);
    } else {
      parts.push(`RPE ${set.rpe}`);
    }
  }

  const restLabel = set.rest !== undefined ? `recupero ${set.rest}s` : undefined;
  const detail = parts.length > 0 ? parts.join(' · ') : `Serie ${index + 1}`;

  return restLabel ? `${detail} · ${restLabel}` : detail;
}

export interface WorkoutProgramViewerProps {
  program: WorkoutProgram;
  programId: string;
  onBack: () => void;
  onDelete: () => void;
  onTrack?: (weekNumber?: number, dayNumber?: number) => void;
  missingOneRM?: Array<{ id: string; name: string }>;
  onOpenMissingOneRM?: () => void;
  copilotSidebar?: React.ReactNode;
  className?: string;
}

export function WorkoutProgramViewer({
  program,
  programId,
  onBack,
  onDelete,
  onTrack,
  missingOneRM = [],
  onOpenMissingOneRM,
  copilotSidebar,
  className = '',
}: WorkoutProgramViewerProps) {
  const router = useRouter();
  const weightUnit = useWeightUnit();
  const t = useTranslations();

  const difficultyLabels: Record<DifficultyLevel, string> = {
    [DifficultyLevel.BEGINNER]: 'Principiante',
    [DifficultyLevel.INTERMEDIATE]: 'Intermedio',
    [DifficultyLevel.ADVANCED]: 'Avanzato',
  };

  const difficultyColors: Record<DifficultyLevel, string> = {
    [DifficultyLevel.BEGINNER]: 'bg-green-100 text-green-700',
    [DifficultyLevel.INTERMEDIATE]: 'bg-yellow-100 text-yellow-700',
    [DifficultyLevel.ADVANCED]: 'bg-red-100 text-red-700',
  };

  const handleTrack = () => {
    if (onTrack) {
      const today = new Date();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const weekDay = getWeekAndDayFromDate(program as any, today);
      if (weekDay) {
        onTrack(weekDay.weekNumber, weekDay.dayNumber);
      } else {
        onTrack();
      }
    } else {
      const today = new Date();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const weekDay = getWeekAndDayFromDate(program as any, today);
      if (weekDay) {
        router.push(
          `/workouts/${programId}/start?week=${weekDay.weekNumber}&day=${weekDay.dayNumber}`
        );
      } else {
        router.push(`/workouts/${programId}/start`);
      }
    }
  };

  const handleDayTrack = (weekNumber: number, dayNumber: number) => {
    if (onTrack) {
      onTrack(weekNumber, dayNumber);
    } else {
      router.push(`/workouts/${programId}/start?week=${weekNumber}&day=${dayNumber}`);
    }
  };

  const metadata: ProgramMetadata[] = [
    {
      label: 'Difficoltà',
      value: (
        <span className={difficultyColors[program.difficulty as DifficultyLevel]}>
          {difficultyLabels[program.difficulty as DifficultyLevel]}
        </span>
      ),
      icon: Target,
    },
    {
      label: 'Durata',
      value: `${program.durationWeeks} settimane`,
      icon: Calendar,
    },
  ];

  return (
    <div className={className}>
      {/* Missing 1RM Alert */}
      {missingOneRM.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">
                {missingOneRM.length} esercizio{missingOneRM.length > 1 ? 'i' : ''} richiedono un
                1RM
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                Inserisci i massimali per questi esercizi per calcolare automaticamente i pesi in
                base all'intensità percentuale.
              </p>
              {onOpenMissingOneRM && (
                <button
                  onClick={onOpenMissingOneRM}
                  className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
                >
                  {t('workout.oneRm.insertMissing')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <ProgramActionBar
        onBack={onBack}
        onTrack={handleTrack}
        onDelete={onDelete}
        trackLabel={t('workout.actions.trackToday')}
        deleteLabel={t('workout.actions.deleteProgram')}
        variant="workout"
      />

      {/* Program Info */}
      <ProgramInfoCard
        name={program.name}
        description={program.description}
        metadata={metadata}
        icon={Dumbbell}
        variant="workout"
      />

      {/* Goals */}
      {program.goals && program.goals.length > 0 && (
        <ProgramGoalsSection goals={program.goals} variant="workout" />
      )}

      {/* Weeks */}
      <div className="space-y-8">
        {program.weeks.map((week: any) => (
          <ProgramWeekCard
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            focus={week.focus}
            notes={week.notes}
          >
            {/* Days */}
            <div className="space-y-6">
              {week.days.map((day: any) => {
                const targetMuscles = collectTargetMuscles(day);

                return (
                  <ProgramDayCard
                    key={day.dayNumber}
                    dayNumber={day.dayNumber}
                    name={day.name}
                    notes={day.notes}
                    onTrack={() => handleDayTrack(week.weekNumber, day.dayNumber)}
                    trackLabel="Inizia Allenamento"
                    variant="workout"
                  >
                    {/* Target Muscles */}
                    {targetMuscles.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {targetMuscles.map((muscle: string) => (
                          <span
                            key={muscle}
                            className="rounded-lg border border-indigo-200/50 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Warmup */}
                    {day.warmup && (
                      <div className="mb-4 rounded-xl border border-amber-200/50 bg-amber-50/50 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                        <span className="font-semibold">Warm-up:</span> {day.warmup}
                      </div>
                    )}

                    {/* Exercises */}
                    <div className="space-y-3">
                      {(day.exercises || []).map((exercise: any) => (
                        <div
                          key={exercise.id}
                          className="rounded-2xl border border-neutral-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md dark:border-white/5 dark:bg-neutral-900/80 dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-xl"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {exercise.name}
                              </h4>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                <span className="rounded bg-neutral-200 px-2 py-0.5 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                                  {exercise.category}
                                </span>
                                {exercise.muscleGroups?.map((group: string) => (
                                  <span
                                    key={group}
                                    className="rounded bg-blue-100 px-2 py-0.5 text-blue-700"
                                  >
                                    {group}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {exercise.description && (
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                              {exercise.description}
                            </p>
                          )}

                          {(exercise.typeLabel || exercise.repRange) && (
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                              {exercise.typeLabel && (
                                <span className="rounded bg-neutral-100 px-2 py-1 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                  {exercise.typeLabel}
                                </span>
                              )}
                              {exercise.repRange && (
                                <span className="rounded bg-blue-100 px-2 py-1 font-medium text-blue-700">
                                  Ripetizioni: {exercise.repRange}
                                </span>
                              )}
                            </div>
                          )}

                          {exercise.notes && (
                            <div className="mt-2 text-sm text-neutral-600 italic dark:text-neutral-400">
                              💡 {exercise.notes}
                            </div>
                          )}

                          {/* SSOT: usa getExerciseSets() invece di exercise.sets */}
                          {(() => {
                            const sets = getExerciseSets(exercise as Exercise);
                            return (
                              sets.length > 0 && (
                                <ul className="mt-3 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                                  {sets.map((set: ExerciseSet, setIdx: number) => (
                                    <li key={`${exercise.id}-set-${setIdx}`}>
                                      • {describeSet(set, setIdx, exercise.repRange, weightUnit)}
                                    </li>
                                  ))}
                                </ul>
                              )
                            );
                          })()}

                          {exercise.formCues && exercise.formCues.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                Form cues:
                              </p>
                              <ul className="mt-1 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                                {exercise.formCues.map((cue: string, cueIdx: number) => (
                                  <li key={`${exercise.id}-cue-${cueIdx}`}>• {cue}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {exercise.equipment && exercise.equipment.length > 0 && (
                            <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                Attrezzatura:
                              </span>{' '}
                              {exercise.equipment.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}

                      {(!day.exercises || day.exercises.length === 0) && (
                        <p className="text-center text-sm text-neutral-500 dark:text-neutral-500">
                          {t('common.empty.noExercisesInDay')}
                        </p>
                      )}
                    </div>

                    {/* Cooldown */}
                    {day.cooldown && (
                      <div className="mt-4 rounded-xl border border-blue-200/50 bg-blue-50/50 p-3 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                        <span className="font-semibold">Cooldown:</span> {day.cooldown}
                      </div>
                    )}
                  </ProgramDayCard>
                );
              })}
            </div>
          </ProgramWeekCard>
        ))}
      </div>

      {/* Copilot Sidebar */}
      {copilotSidebar}
    </div>
  );
}
