'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dumbbell,
  Calendar,
  Target,
  AlertCircle,
  Play,
  Clock,
  Flame,
  ChevronLeft,
  BarChart3,
  MoreVertical,
  Check,
} from 'lucide-react';
import { DifficultyLevel } from '@giulio-leone/types/workout';
import { getWeekAndDayFromDate, getWorkoutProgramWeek } from '@giulio-leone/one-workout';
import { Card, Spinner } from '@giulio-leone/ui';
import { GlassContainer, ScaleTouch } from '@giulio-leone/ui-core';

import { dialog } from '@giulio-leone/lib-stores';

import { logger } from '@giulio-leone/lib-shared';
import type {
  WorkoutProgram,
  WorkoutDay,
  WorkoutWeek,
  Exercise,
} from '@giulio-leone/types/workout';

// --- HELPER COMPONENTS ---

function formatMuscleLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\s+|_/)
    .filter(Boolean)
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function collectTargetMuscles(day: WorkoutDay): string[] {
  const fromDay = (day.targetMuscles || []).map(formatMuscleLabel);
  const fromExercises = (day.exercises || [])
    .flatMap((exercise: Exercise) => exercise.muscleGroups || [])
    .map(formatMuscleLabel);
  return Array.from(new Set([...fromDay, ...fromExercises])).filter(Boolean);
}

// --- MAIN COMPONENT ---

export interface WorkoutProgramDashboardProps {
  program: WorkoutProgram;
  programId: string;
  onBack: () => void;
  onDelete: () => void;
  /**
   * Callback to create a session.
   * Should return the session ID if successful, or null if failed.
   */
  onCreateSession: (week: number, day: number) => Promise<string | null>;
  missingOneRM?: Array<{ id: string; name: string }>;
  onOpenMissingOneRM?: () => void;
  copilotSidebar?: React.ReactNode;
  className?: string;
}

export function WorkoutProgramDashboard({
  program,
  onBack,
  onDelete,
  onCreateSession,
  missingOneRM = [],
  onOpenMissingOneRM,
  copilotSidebar,
  className = '',
}: WorkoutProgramDashboardProps) {
  const t = useTranslations();
  const router = useRouter();
  // removed hook usage
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [creatingSessionFor, setCreatingSessionFor] = useState<{
    week: number;
    day: number;
  } | null>(null);

  // Determine next session
  const nextSession = useMemo(() => {
    const today = new Date();
    const weekDay = getWeekAndDayFromDate(program, today);

    if (weekDay) {
      const week = getWorkoutProgramWeek(program, weekDay.weekNumber);
      const day = week?.days?.find((d: WorkoutDay) => d.dayNumber === weekDay.dayNumber);
      if (week && day) {
        return {
          week,
          day,
          weekNumber: weekDay.weekNumber,
          dayNumber: weekDay.dayNumber,
        };
      }
    }

    // Fallback to first day of first week
    if (program.weeks?.[0]?.days?.[0]) {
      const week = program.weeks[0];
      const day = week.days[0];
      if (day) {
        return { week, day, weekNumber: week.weekNumber, dayNumber: day.dayNumber };
      }
    }

    return null;
  }, [program]);

  const handleStartSession = async (weekNumber: number, dayNumber: number) => {
    setCreatingSessionFor({ week: weekNumber, day: dayNumber });
    setIsCreatingSession(true);
    try {
      const sessionId = await onCreateSession(weekNumber, dayNumber);
      if (sessionId) {
        router.push(`/live-workout/${sessionId}`);
      } else {
        await dialog.error(t('common.ui.cannotCreateSession'));
      }
    } catch (error) {
      logger.error('Error creating session:', error);
      await dialog.error(error instanceof Error ? error.message : t('common.errors.unknown'));
    } finally {
      setCreatingSessionFor(null);
      setIsCreatingSession(false);
    }
  };

  const difficultyLabels: Record<DifficultyLevel, string> = {
    [DifficultyLevel.BEGINNER]: 'Principiante',
    [DifficultyLevel.INTERMEDIATE]: 'Intermedio',
    [DifficultyLevel.ADVANCED]: 'Avanzato',
  };

  // Chromatic Optimization: Zinc/Indigo Scale
  const difficultyBadgeStyles: Record<DifficultyLevel, string> = {
    [DifficultyLevel.BEGINNER]:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    [DifficultyLevel.INTERMEDIATE]:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    [DifficultyLevel.ADVANCED]:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <GlassContainer intensity="ambient" className={`min-h-screen ${className}`}>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-8 pb-24 lg:px-8">
        {/* --- Header Section --- */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <button
              onClick={onBack}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Torna ai programmi
            </button>

            <div className="mb-3 flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase ${difficultyBadgeStyles[program.difficulty]}`}
              >
                {difficultyLabels[program.difficulty]}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                <Clock className="h-3.5 w-3.5" />
                {program.durationWeeks} Settimane
              </span>
            </div>

            <h1 className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-500 bg-clip-text text-4xl font-black tracking-tighter text-transparent sm:text-6xl dark:from-white dark:via-neutral-200 dark:to-neutral-500">
              {program.name}
            </h1>
            {program.description && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                {program.description}
              </p>
            )}
          </div>

          {/* Header Actions */}
          <div className="flex gap-3">
            <button
              onClick={onDelete}
              className="flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-rose-600 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-rose-500 dark:hover:bg-rose-900/20"
            >
              Elimina
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* --- Left Column: Main Content (8 cols) --- */}
          <div className="space-y-8 lg:col-span-8">
            {/* Mobile Missing 1RM Alert */}
            {missingOneRM.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 lg:hidden">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                      Dati mancanti
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-amber-600/80 dark:text-amber-500/70">
                      Mancano i massimali per {missingOneRM.length} esercizi. Inseriscili per
                      calcolare i carichi ideali.
                    </p>
                    {onOpenMissingOneRM && (
                      <button
                        onClick={onOpenMissingOneRM}
                        className="mt-3 text-xs font-bold text-amber-600 hover:text-amber-800 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        Inserisci Massimali →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {nextSession && (
              <div className="group relative overflow-hidden rounded-[32px] p-1 shadow-2xl shadow-indigo-500/30 transition-transform duration-500 hover:scale-[1.01]">
                {/* Animated Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-100" />

                {/* Content Container */}
                <div className="relative h-full overflow-hidden rounded-[28px] bg-neutral-950/90 p-6 backdrop-blur-xl sm:p-10">
                  {/* Inner Glow */}
                  <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[300px] w-[300px] rounded-full bg-indigo-500/30 blur-[80px]" />

                  <div className="relative z-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-indigo-400 backdrop-blur-sm">
                        <Flame className="animate-pulse-slow h-4 w-4 fill-current" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">
                          Ready for Workout
                        </span>
                      </div>

                      <div>
                        <h2 className="mb-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                          {nextSession.day?.name}
                        </h2>
                        <p className="text-lg font-medium text-neutral-400">
                          Settimana {nextSession.weekNumber}{' '}
                          <span className="mx-2 text-neutral-600">•</span>{' '}
                          {nextSession.week.focus || 'Focus Generale'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {nextSession.day &&
                          collectTargetMuscles(nextSession.day).map((muscle: string) => (
                            <span
                              key={muscle}
                              className="inline-flex items-center rounded-lg border border-white/5 bg-neutral-800/80 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-700"
                            >
                              {muscle}
                            </span>
                          ))}
                      </div>
                    </div>

                    <ScaleTouch
                      onClick={() =>
                        handleStartSession(nextSession.weekNumber, nextSession.dayNumber)
                      }
                      scale={0.95}
                    >
                      <div
                        className={`group/btn relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-8 py-5 text-lg font-bold text-black shadow-lg shadow-white/10 transition-all hover:bg-neutral-100 sm:w-auto ${
                          isCreatingSession ? 'cursor-not-allowed opacity-80' : ''
                        }`}
                      >
                        {isCreatingSession &&
                        creatingSessionFor?.week === nextSession.weekNumber &&
                        creatingSessionFor?.day === nextSession.dayNumber ? (
                          <Spinner size="sm" className="text-black" />
                        ) : (
                          <>
                            <Play className="h-6 w-6 fill-current transition-transform group-hover/btn:scale-110" />
                            <span>INIZIA ORA</span>
                          </>
                        )}
                      </div>
                    </ScaleTouch>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Explorer */}
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                <Calendar className="h-5 w-5 text-neutral-400" />
                Programma Completo
              </h3>

              <div className="space-y-8">
                {program.weeks.map((week: WorkoutWeek) => (
                  <div key={week.weekNumber} className="space-y-4">
                    {/* Week Header */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-sm font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {week.weekNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold tracking-wide text-neutral-900 uppercase dark:text-white">
                          Settimana {week.weekNumber}
                        </h4>
                        {week.focus && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {week.focus}
                          </p>
                        )}
                      </div>
                      <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                    </div>

                    {/* Days Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {week.days.map((day: WorkoutDay) => {
                        const targetMuscles = collectTargetMuscles(day);
                        const isCreatingThis =
                          creatingSessionFor?.week === week.weekNumber &&
                          creatingSessionFor?.day === day.dayNumber;

                        return (
                          <ScaleTouch key={day.dayNumber} className="h-full" scale={0.98}>
                            {/* Outer Glow Container */}
                            <div className="group relative h-full overflow-hidden rounded-[28px] p-[2px] transition-all duration-500 hover:shadow-[0_0_60px_-10px_theme(colors.indigo.500/0.5),0_0_30px_-5px_theme(colors.purple.500/0.3)]">
                              {/* Animated Gradient Border */}
                              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-indigo-500/40 via-purple-500/30 to-pink-500/20 opacity-60 transition-all duration-500 group-hover:from-indigo-400/80 group-hover:via-purple-500/60 group-hover:to-pink-500/40 group-hover:opacity-100" />

                              {/* Card Content */}
                              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] bg-gradient-to-br from-[#0f0f14] via-[#0a0a0f] to-[#080810] p-6">
                                {/* Ambient Light - Top Right */}
                                <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-indigo-500/20" />

                                {/* Ambient Light - Bottom Left */}
                                <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-purple-500/20" />

                                {/* Top Surface Shine */}
                                <div className="pointer-events-none absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div className="relative z-10">
                                  <div className="mb-5 flex items-start justify-between">
                                    {/* Gradient Day Badge */}
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-lg font-black text-white shadow-lg ring-1 shadow-indigo-500/10 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:from-indigo-500 group-hover:to-purple-600 group-hover:shadow-indigo-500/30 group-hover:ring-indigo-400/50">
                                      {day.dayNumber}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {day.isCompleted && (
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/20 text-emerald-400 shadow-lg ring-1 shadow-emerald-500/20 ring-emerald-500/30">
                                          <Check className="h-5 w-5 stroke-[3]" />
                                        </div>
                                      )}
                                      <button className="-m-1.5 rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-white/5 hover:text-white">
                                        <MoreVertical className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>

                                  <h5 className="mb-4 text-xl leading-tight font-bold tracking-tight text-white">
                                    {day.name}
                                  </h5>

                                  <div className="flex flex-wrap gap-2">
                                    {targetMuscles
                                      .slice(0, 3)
                                      .map((muscle: string, idx: number) => (
                                        <span
                                          key={muscle}
                                          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase shadow-sm transition-all duration-300 ${
                                            idx === 0
                                              ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30 group-hover:bg-indigo-500/30 group-hover:text-indigo-200'
                                              : idx === 1
                                                ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30 group-hover:bg-purple-500/30 group-hover:text-purple-200'
                                                : 'bg-pink-500/20 text-pink-300 ring-1 ring-pink-500/30 group-hover:bg-pink-500/30 group-hover:text-pink-200'
                                          }`}
                                        >
                                          {muscle}
                                        </span>
                                      ))}
                                    {targetMuscles.length > 3 && (
                                      <span className="self-center px-2 text-[10px] font-semibold text-neutral-500">
                                        +{targetMuscles.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="relative z-10 mt-6 border-t border-white/10 pt-5 transition-colors group-hover:border-indigo-500/30">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 text-neutral-400 transition-colors group-hover:text-neutral-300">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/5">
                                        <Dumbbell className="h-4 w-4" />
                                      </div>
                                      <span className="text-sm font-semibold">
                                        {day.exercises?.length || 0} Esercizi
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartSession(week.weekNumber, day.dayNumber);
                                      }}
                                      disabled={isCreatingSession}
                                      className="flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_4px_20px_-4px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105 hover:bg-neutral-100 hover:shadow-[0_4px_30px_-4px_rgba(255,255,255,0.5)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isCreatingThis ? (
                                        <Spinner size="sm" className="text-black" />
                                      ) : (
                                        <>
                                          <Play className="h-4 w-4 fill-current" />
                                          INIZIA
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </ScaleTouch>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Right Column: Sidebar (4 cols) --- */}
          <div className="space-y-6 lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Missing 1RM Alert */}
              {missingOneRM.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        Dati mancanti
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-amber-600/80 dark:text-amber-500/70">
                        Mancano i massimali per {missingOneRM.length} esercizi. Inseriscili per
                        calcolare i carichi ideali.
                      </p>
                      {onOpenMissingOneRM && (
                        <button
                          onClick={onOpenMissingOneRM}
                          className="mt-3 text-xs font-bold text-amber-600 hover:text-amber-800 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                        >
                          Inserisci Massimali →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Program Stats */}
              <Card variant="glass" className="p-6">
                <h3 className="mb-4 text-sm font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
                  Statistiche
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                        <Target className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Difficoltà
                      </span>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {difficultyLabels[program.difficulty as DifficultyLevel]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Focus
                      </span>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {program.goals?.[0] || 'Generale'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Progresso
                      </span>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">0%</span>
                  </div>
                </div>
              </Card>

              {/* Copilot Integration */}
              {copilotSidebar}
            </div>
          </div>
        </div>
      </div>
    </GlassContainer>
  );
}
