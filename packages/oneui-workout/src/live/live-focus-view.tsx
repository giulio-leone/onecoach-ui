'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo, useCallback } from 'react';
import { AlertTriangle, ChevronRight, Dumbbell } from 'lucide-react';
import { EmptyState, Heading, Text, Button } from '@onecoach/ui';
import { getExerciseSets } from '@onecoach/one-workout';
import type { Exercise, ExerciseSet } from '@onecoach/schemas';
import type { WorkoutSession } from '@onecoach/types-workout';
import { LiveWorkoutHeader } from './live-workout-header';
import { LiveExerciseCard } from './live-exercise-card';
import { RestTimer } from './rest-timer';
import { WorkoutCompleteModal } from './workout-complete-modal';

// ============================================================================
// TYPES
// ============================================================================

export interface LiveFocusViewProps {
  session: WorkoutSession;
  timer: {
    duration: number;
    isPaused: boolean;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
  };
  restTimer: {
    isActive: boolean;
    timeRemaining: number;
    initialDuration: number;
    onStart: (duration: number) => void;
    onPause: () => void;
    onSkip: () => void;
    onAdd: (seconds: number) => void;
  };
  onBack: () => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, data: Partial<ExerciseSet>) => void;
  onCompleteSet: (exerciseIndex: number, setIndex: number, data: Partial<ExerciseSet>) => void;
  onViewSummary: () => void;
  programName?: string;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/** Segmented progress bar showing workout completion */
function SegmentedProgress({
  total,
  current,
  completedCount,
}: {
  total: number;
  current: number;
  completedCount: number;
}) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = i < completedCount;
        const isCurrent = i === current;
        return (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              isCompleted
                ? 'bg-emerald-500'
                : isCurrent
                  ? 'bg-indigo-500'
                  : 'bg-neutral-700'
            }`}
          />
        );
      })}
    </div>
  );
}

/** "Coming Up Next" preview card */
function UpNextCard({
  exercise,
  onClick,
}: {
  exercise: Exercise;
  onClick?: () => void;
}) {
  const sets = getExerciseSets(exercise as any);
  const setCount = sets.length;

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/80 px-5 py-4 text-left backdrop-blur-sm transition-all hover:border-neutral-700 hover:bg-neutral-800/80"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 transition-colors group-hover:bg-indigo-500/20 group-hover:text-indigo-400">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <Heading level={4} size="md" weight="bold" className="text-white">{exercise.name}</Heading>
          <Text size="sm" className="text-neutral-500">{setCount} Sets</Text>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-neutral-400" />
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LiveFocusView({
  session,
  timer,
  restTimer,
  onBack,
  onUpdateSet,
  onCompleteSet,
  onViewSummary,
  programName,
}: LiveFocusViewProps) {
  const t = useTranslations('workouts');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const exercises = useMemo(
    () => (session.exercises as Exercise[]) || [],
    [session.exercises]
  );

  // Find the first exercise with at least one incomplete set
  const findActiveExerciseIndex = useCallback(() => {
    for (let i = 0; i < exercises.length; i++) {
      const sets = getExerciseSets(exercises[i] as any);
      if (sets.some((s) => !s.done)) {
        return i;
      }
    }
    return exercises.length > 0 ? exercises.length - 1 : 0;
  }, [exercises]);

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(
    findActiveExerciseIndex
  );

  const currentExercise = exercises[activeExerciseIndex];
  const nextExercise = exercises[activeExerciseIndex + 1];

  // Count completed exercises (all sets done)
  const completedExercisesCount = useMemo(() => {
    return exercises.filter((ex) => {
      const sets = getExerciseSets(ex as any);
      return sets.length > 0 && sets.every((s) => s.done);
    }).length;
  }, [exercises]);

  // Check if current exercise is fully complete
  const isCurrentExerciseComplete = useMemo(() => {
    if (!currentExercise) return false;
    const sets = getExerciseSets(currentExercise as any);
    return sets.length > 0 && sets.every((s) => s.done);
  }, [currentExercise]);

  const handleStop = () => {
    timer.onStop();
    setShowCompleteModal(true);
  };

  const handleNextExercise = useCallback(() => {
    if (activeExerciseIndex < exercises.length - 1) {
      setActiveExerciseIndex((prev) => prev + 1);
    }
  }, [activeExerciseIndex, exercises.length]);

  // Intercept set completion to potentially auto-advance
  const handleSetComplete = useCallback(
    (exerciseIndex: number, setIndex: number, data: Partial<ExerciseSet>) => {
      onCompleteSet(exerciseIndex, setIndex, data);
      // Re-check after state update (parent handles the actual state, so we can't auto-advance immediately reliably)
      // The isCurrentExerciseComplete will update on next render
    },
    [onCompleteSet]
  );

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 h-[60%] w-[80%] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute top-[40%] -left-[20%] h-[50%] w-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[10%] h-[40%] w-[40%] rounded-full bg-pink-600/5 blur-[100px]" />
      </div>

      {/* Header - Fixed */}
      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
        <LiveWorkoutHeader
          programName={programName}
          weekNumber={session.weekNumber}
          dayNumber={session.dayNumber}
          duration={timer.duration}
          isPaused={timer.isPaused}
          onPause={timer.onPause}
          onResume={timer.onResume}
          onStop={handleStop}
          onBack={() => setShowLeaveConfirm(true)}
        />
        {/* Segmented Progress Bar */}
        <SegmentedProgress
          total={exercises.length}
          current={activeExerciseIndex}
          completedCount={completedExercisesCount}
        />
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 flex-col px-4 py-6 lg:px-8">
        {exercises.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={AlertTriangle}
              title={t('page.nessun_esercizio')}
              description={t('page.questa_sessione_sembra_vuota')}
            />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
            {/* Exercise Title */}
            <div className="mb-2 text-center text-xs font-bold tracking-widest text-neutral-500 uppercase">
              EXERCISE {activeExerciseIndex + 1} / {exercises.length}
            </div>

            {/* Current Exercise Card */}
            {currentExercise && (
              <LiveExerciseCard
                exercise={currentExercise}
                exerciseIndex={activeExerciseIndex}
                onSetComplete={handleSetComplete}
                onSetUpdate={onUpdateSet}
                className="flex-1"
              />
            )}

            {/* Auto-Advance / Manual Next Button */}
            {isCurrentExerciseComplete && nextExercise && (
              <div className="mt-6">
                <Button
                  fullWidth
                  size="lg"
                  variant="primary"
                  className="py-6 text-lg shadow-lg shadow-indigo-500/25"
                  onClick={handleNextExercise}
                >
                  Next Exercise →
                </Button>
              </div>
            )}

            {/* Up Next Preview */}
            {nextExercise && !isCurrentExerciseComplete && (
              <div className="mt-auto pt-8">
                <Text size="xs" weight="bold" className="mb-3 tracking-widest text-neutral-600 uppercase">
                  COMING UP NEXT
                </Text>
                <UpNextCard exercise={nextExercise} onClick={handleNextExercise} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <Heading level={3} size="lg" weight="bold" className="mb-2 text-white">
              {t('page.interrompere_l_allenamento')}
            </Heading>
            <Text size="sm" className="mb-6 text-neutral-400">
              {t('page.i_progressi_verranno_salvati_ma_la_sessi')}
            </Text>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800"
                onClick={() => setShowLeaveConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={onBack}
              >
                End Workout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Overlay */}
      {restTimer.isActive && restTimer.initialDuration > 0 && (
        <RestTimer
          duration={restTimer.initialDuration}
          timeRemaining={restTimer.timeRemaining}
          isActive={restTimer.isActive}
          onComplete={restTimer.onSkip}
          onSkip={restTimer.onSkip}
          onStart={(d) => restTimer.onStart(d || restTimer.initialDuration)}
          onPause={restTimer.onPause}
          onAddTime={restTimer.onAdd}
          variant="fullscreen"
        />
      )}

      {/* Completion Modal */}
      {showCompleteModal && (
        <WorkoutCompleteModal
          isOpen={showCompleteModal}
          session={session}
          onClose={() => {
            setShowCompleteModal(false);
            onBack();
          }}
          onViewSummary={() => {
            setShowCompleteModal(false);
            onViewSummary();
          }}
        />
      )}
    </div>
  );
}
