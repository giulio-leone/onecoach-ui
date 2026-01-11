import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { VisualBuilderShell } from '@onecoach/ui/visual-builder';
import { useAutoSave, useVisualBuilderState } from '@onecoach/hooks';
import { useHeaderActions, useCopilotActiveContextStore } from '@onecoach/lib-stores';
import { CopilotDomainProvider } from '@onecoach/lib-copilot';
import { logger } from '@onecoach/lib-shared';
import { ArrowLeft, BarChart2, Layout, TrendingUp, Dumbbell, Upload } from 'lucide-react';
// import { WorkoutImportModal } from '@/components/workout/workout-import-modal';
// import { WorkoutClipboardProvider } from './workout-clipboard-provider';
import type { LucideIcon } from 'lucide-react';
import { WorkoutStatus } from '@onecoach/types/client';
import { DayEditor } from './day-editor';
import { WorkoutStatistics } from './workout-statistics';
import { ProgressionManager } from './progression-manager';
import { OneRmReferenceModal } from './one-rm-reference-modal';
import { cn } from '@onecoach/lib-design-system';
import type { WorkoutProgram, WorkoutDay, WorkoutWeek, Exercise } from '@onecoach/types-workout';
import { DifficultyLevel } from '@onecoach/types-workout';

interface SaveResult {
  success: boolean;
  error?: string;
}

interface WorkoutVisualBuilderProps {
  initialProgram?: WorkoutProgram;
  onSave?: (program: WorkoutProgram) => Promise<SaveResult | void>;
  onImportClick?: () => void;
}

// Helpers moved inside component or requiring translation passed in
const createEmptyProgram = (defaultName: string): WorkoutProgram => ({
  id: '',
  name: defaultName,
  description: '',
  difficulty: 'intermediate' as DifficultyLevel,
  durationWeeks: 4,
  weeks: [createEmptyWorkoutWeek(1, 'Giorno')], // Placeholder, will be translated in UI usage
  goals: [],
  status: WorkoutStatus.DRAFT,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createEmptyWorkoutWeek = (weekNumber: number, dayLabel: string = 'Giorno'): WorkoutWeek => ({
  weekNumber,
  days: [createEmptyWorkoutDay(1, dayLabel)],
  notes: '',
  focus: '',
});

const createEmptyWorkoutDay = (dayNumber: number, dayLabel: string = 'Giorno'): WorkoutDay => ({
  dayNumber,
  name: `${dayLabel} ${dayNumber}`,
  dayName: `${dayLabel} ${dayNumber}`,
  exercises: [],
  notes: '',
  targetMuscles: [],
  cooldown: '',
});

export function WorkoutVisualBuilder({ initialProgram, onSave, onImportClick }: WorkoutVisualBuilderProps) {
  const t = useTranslations('workouts.builder');
  const router = useRouter();

  // Initialize with translated defaults if needed
  const [program, setProgram] = useState<WorkoutProgram>(
    initialProgram || createEmptyProgram(t('newProgram'))
  );

  const [viewMode, setViewMode] = useState<'editor' | 'statistics' | 'progression'>('editor');

  const viewModes: Array<{
    id: 'editor' | 'statistics' | 'progression';
    label: string;
    icon: LucideIcon;
  }> = [
    { id: 'editor', label: t('modes.editor'), icon: Layout },
    { id: 'progression', label: t('modes.progression'), icon: TrendingUp },
    { id: 'statistics', label: t('modes.statistics'), icon: BarChart2 },
  ];

  const isEditor = viewMode === 'editor';

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Use shared visual builder state hook for week/day management
  const handleWeeksChange = useCallback((newWeeks: WorkoutWeek[]) => {
    setProgram((prev) => ({ ...prev, weeks: newWeeks }));
  }, []);

  const createEmptyWeek = useCallback(
    (weekNumber: number) => createEmptyWorkoutWeek(weekNumber, t('dayName')),
    [t]
  );

  const createEmptyDay = useCallback(
    (dayNumber: number) => createEmptyWorkoutDay(dayNumber, t('dayName')),
    [t]
  );

  const {
    selectedWeekIndex,
    selectedDayIndex,
    currentWeek,
    currentDay,
    addWeek,
    addDay,
    removeDay,
    selectWeek,
    selectDay,
    updateCurrentDay,
  } = useVisualBuilderState<WorkoutWeek, WorkoutDay>({
    weeks: program.weeks,
    onWeeksChange: handleWeeksChange,
    createEmptyWeek,
    createEmptyDay,
  });

  // Sync navigation state with Copilot context for AI awareness
  const setWorkoutNavigation = useCopilotActiveContextStore((s) => s.setWorkoutNavigation);
  const updateWorkoutProgram = useCopilotActiveContextStore((s) => s.updateWorkoutProgram);

  // Sync week/day selection to Copilot context
  useEffect(() => {
    setWorkoutNavigation(selectedWeekIndex, selectedDayIndex);
  }, [selectedWeekIndex, selectedDayIndex, setWorkoutNavigation]);

  // Sync program changes to Copilot context (for AI to have latest data)
  useEffect(() => {
    // Only update if program has an ID (initialized)
    if (program.id) {
      updateWorkoutProgram(program);
    }
  }, [program, updateWorkoutProgram]);

  // 1RM Management
  const [referenceMaxes, setReferenceMaxes] = useState<Record<string, number>>(
    (program.metadata?.referenceMaxes as Record<string, number>) || {}
  );
  const [isOneRmModalOpen, setIsOneRmModalOpen] = useState(false);
  /* const [isImportModalOpen, setIsImportModalOpen] = useState(false); */
  // const isImportModalOpen = false; // Placeholder

  // Sync referenceMaxes to program metadata for persistence
  const handleUpdateOneRm = useCallback((newMaxes: Record<string, number>) => {
    setReferenceMaxes(newMaxes);
    setProgram((prev) => ({
      ...prev,
      metadata: {
        ...(prev.metadata || {}),
        referenceMaxes: newMaxes,
      },
    }));
  }, []);

  // Autosave - enabled only for existing programs (edit mode)
  const isEditMode = Boolean(initialProgram?.id);

  const autosaveFn = useCallback(
    async (data: WorkoutProgram) => {
      if (onSave) {
        await onSave(data);
      }
    },
    [onSave]
  );

  const { isSaving, lastSaved, error, hasPendingChanges, saveNow } = useAutoSave(
    program,
    autosaveFn,
    {
      enabled: isEditMode && Boolean(onSave),
      delay: 2000,
    }
  );

  // Derive all used exercises for the 1RM modal
  const allExercises = useMemo(() => {
    const exercises: Exercise[] = [];
    const seenIds = new Set<string>();

    program.weeks?.forEach((week) => {
      week.days.forEach((day) => {
        day.exercises?.forEach((ex) => {
          if (ex.id && !seenIds.has(ex.id)) {
            seenIds.add(ex.id);
            exercises.push(ex);
          }
        });
      });
    });
    return exercises;
  }, [program]);

  const updateProgram = (updates: Partial<WorkoutProgram>) => {
    setProgram((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        const result = await onSave(program);
        if (result && 'success' in result && result.success) {
          router.push('/workouts');
        }
      } catch (err: unknown) {
        logger.error('Error saving program:', err);
      }
    } else {
      logger.warn('Saving program (no persistence):', program);
      router.push('/workouts');
    }
  }, [onSave, program, router]);

  /* const handleImportSuccess = useCallback(
    (programId: string) => {
      setIsImportModalOpen(false);
      // Redirect to the edito page of the imported program
      router.push(`/workouts/${programId}/edit`);
    },
    [router]
  ); */

  // 1RM Button logic (kept as is, passed to headerActions)
  const oneRmButton = (
    <button
      onClick={() => setIsOneRmModalOpen(true)}
      className={cn(
        'group flex items-center gap-2 rounded-full border transition-colors',
        'border-neutral-200 bg-neutral-50 text-neutral-600',
        'hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900',
        'dark:border-white/10 dark:bg-white/5 dark:text-neutral-400',
        'dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white',
        'h-9 w-9 justify-center sm:h-auto sm:w-auto sm:px-4 sm:py-2'
      )}
    >
      <Dumbbell size={16} />
      <span className="hidden text-sm font-medium sm:inline">{t('actions.oneRm')}</span>
    </button>
  );

  const importButton = (
    <button
      onClick={() => {
        if (onImportClick) onImportClick();
         /* else setIsImportModalOpen(true); */
      }}
      className={cn(
        'group flex items-center gap-2 rounded-full border transition-colors',
        'border-emerald-200 bg-emerald-50 text-emerald-600',
        'hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-700',
        'dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
        'dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-300',
        'h-9 w-9 justify-center sm:h-auto sm:w-auto sm:px-4 sm:py-2',
        !onImportClick && 'hidden'
      )}
      title={t('actions.importFile')}
    >
      <Upload size={16} />
      <span className="hidden text-sm font-medium sm:inline">{t('actions.import')}</span>
    </button>
  );

  // Mobile header injection: only leftContent for navigation breadcrumb.
  // Save button is handled by VisualBuilderShell to avoid duplication.
  const setLeftContent = useHeaderActions((state) => state.setLeftContent);

  useEffect(() => {
    // Left content: Back button + Program name (compact on mobile)
    const leftContent = (
      <div className="flex items-center gap-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">{t('actions.back')}</span>
        </button>
        <span className="text-neutral-300 dark:text-neutral-600">/</span>
        <span className="max-w-[120px] truncate text-sm font-semibold text-neutral-900 sm:max-w-[200px] dark:text-white">
          {program.name || t('newProgram')}
        </span>
      </div>
    );

    setLeftContent(leftContent);

    return () => {
      setLeftContent(null);
    };
  }, [program.name, setLeftContent, handleBack, t]);

  // Determine if we have a valid program ID for context init
  const hasProgramId = Boolean(initialProgram?.id);

  // Content wrapped with clipboard provider
  const builderContent = (
    <>
      <VisualBuilderShell
        theme="primary"
        // ... props ...
        title={program.name}
        onTitleChange={(name) => updateProgram({ name })}
        subtitle={t('subtitle')}
        onBack={handleBack}
        isEditMode={isEditMode}
        isSaving={isSaving}
        lastSaved={lastSaved ?? null}
        saveError={error}
        hasPendingChanges={hasPendingChanges}
        onSave={handleSave}
        onSaveNow={saveNow}
        viewModes={viewModes}
        currentViewMode={viewMode}
        onViewModeChange={(id) => setViewMode(id as 'editor' | 'statistics' | 'progression')}
        showNavigation={isEditor}
        weeks={program.weeks}
        currentWeekIndex={selectedWeekIndex}
        onSelectWeek={selectWeek}
        onAddWeek={addWeek}
        days={currentWeek?.days || []}
        currentDayIndex={selectedDayIndex}
        onSelectDay={selectDay}
        onAddDay={addDay}
        onRemoveDay={removeDay}
        headerActions={
          <>
            {importButton}
            {oneRmButton}
          </>
        }
        mobileActionsMenu={
          <div className="flex flex-col gap-1 p-1">
            <button
              onClick={() => {
                // setIsImportModalOpen(true);
                 if (onImportClick) onImportClick();
                // Close menu logic would be needed if controlled, but here it's inside content
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10"
            >
              <Upload size={16} />
              {t('actions.import')}
            </button>
            <button
              onClick={() => setIsOneRmModalOpen(true)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10"
            >
              <Dumbbell size={16} />
              {t('actions.oneRm')}
            </button>
          </div>
        }
      >
        <div className="animate-in fade-in mx-auto w-full max-w-7xl px-4 py-8 pb-32 duration-500">
          {viewMode === 'editor' ? (
            currentDay ? (
              <DayEditor
                day={currentDay}
                onUpdate={updateCurrentDay}
                referenceMaxes={referenceMaxes}
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-32 text-center">
                <div className="rounded-full bg-neutral-100 p-6 text-neutral-400 ring-1 ring-neutral-200 dark:bg-neutral-900/50 dark:text-neutral-600 dark:ring-white/5">
                  <Layout className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-medium text-neutral-900 dark:text-neutral-300">
                    {t('emptyState.noDaySelected')}
                  </p>
                  <p className="text-sm text-neutral-500">{t('emptyState.selectDay')}</p>
                </div>
              </div>
            )
          ) : viewMode === 'progression' ? (
            <ProgressionManager program={program} onUpdate={setProgram} />
          ) : (
            <WorkoutStatistics program={program} />
          )}
        </div>
      </VisualBuilderShell>

      <OneRmReferenceModal
        isOpen={isOneRmModalOpen}
        onClose={() => setIsOneRmModalOpen(false)}
        usedExercises={allExercises}
        referenceMaxes={referenceMaxes}
        onUpdateMaxes={handleUpdateOneRm}
      />

      {/* Import Modal */}
      {/* <WorkoutImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      /> */}
    </>
  );

  // Wrap with CopilotDomainProvider only when we have a valid program
  if (hasProgramId && initialProgram) {
    return (
      <CopilotDomainProvider
        domain="workout"
        workoutData={{ programId: initialProgram.id, program }}
      >
        {builderContent}
      </CopilotDomainProvider>
    );
  }

  // New program mode - no context provider needed yet
  return builderContent;
}
