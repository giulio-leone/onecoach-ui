'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  WorkoutProgressionService,
  type GroupedExercise,
  type ExerciseOccurrence,
  type ProgressionParams,
} from '@giulio-leone/lib-workout';
import { Button } from '@giulio-leone/ui';
import { useTranslations } from 'next-intl';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Dumbbell,
  TrendingUp,
  Repeat,
  Percent,
  Zap,
  CheckCircle2,
  ArrowRight,
  Play,
  Scale,
  Save,
  Download,
  LayoutList,
  Edit2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { SetGroupEditor } from '../editor/set-group-editor';

import { logger } from '@giulio-leone/lib-shared';
import type { WorkoutProgram, SetGroup } from '@giulio-leone/types/workout';

type GroupedExerciseWithCatalog = GroupedExercise & { catalogExerciseId?: string };

type SetGroupOverride = {
  _setGroups?: SetGroup[];
} & Record<string, unknown>;

// =====================================================
// Helper: Generate unique ID
// =====================================================
function generateUniqueId(): string {
  return `sg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// =====================================================
// Helper: Deep clone SetGroup preserving its ID
// Used when we need to edit existing SetGroups
// =====================================================
function deepCloneSetGroup(setGroup: SetGroup): SetGroup {
  return {
    ...setGroup,
    baseSet: { ...setGroup.baseSet },
    sets: setGroup.sets?.map((s: any) => ({ ...s })) || [],
  } as SetGroup;
}

// =====================================================
// Helper: Clone SetGroup with NEW unique ID
// Used when creating new SetGroups (add/duplicate)
// =====================================================
function cloneSetGroupWithNewId(setGroup: SetGroup): SetGroup {
  return {
    ...deepCloneSetGroup(setGroup),
    id: generateUniqueId(),
  };
}

const toDomainSetGroup = (group: Partial<SetGroup> & Pick<SetGroup, 'baseSet'>): SetGroup => {
  const sanitizeSet = (s: Partial<SetGroup['baseSet']>) => ({
    ...s,
    weight: s.weight ?? null,
    rest: s.rest ?? 90,
    intensityPercent: s.intensityPercent ?? null,
    rpe: s.rpe ?? null,
  });
  return {
    ...group,
    baseSet: sanitizeSet(group.baseSet),
    sets: group.sets?.map(sanitizeSet) || [],
  } as SetGroup;
};

interface ProgressionManagerProps {
  program: WorkoutProgram;
  onUpdate: (program: WorkoutProgram) => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const progressionTypes: Array<{
  id: ProgressionParams['type'];
  label: string;
  icon: typeof Dumbbell;
}> = [
  { id: 'linear_weight', label: 'Peso', icon: Dumbbell },
  { id: 'linear_reps', label: 'Reps', icon: Repeat },
  { id: 'percentage', label: '% 1RM', icon: Percent },
  { id: 'rpe', label: 'RPE', icon: Zap },
];

export function ProgressionManager({ program, onUpdate }: ProgressionManagerProps) {
  const t = useTranslations('workouts.builder.progression');
  const [groupedExercises, setGroupedExercises] = useState<GroupedExercise[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupedExercise | null>(null);

  // Track if we're applying changes to prevent infinite loops
  const isApplyingRef = useRef(false);
  const lastAppliedOverridesRef = useRef<string>('');

  // Configuration State
  const [params, setParams] = useState<ProgressionParams>({
    type: 'linear_weight',
    startValue: 0,
    increment: 2.5,
    frequency: 1,
  });

  const [oneRepMax, setOneRepMax] = useState<number | undefined>(undefined);
  const [userOneRepMax, setUserOneRepMax] = useState<number | null>(null);
  const [userOneRepMaxUpdatedAt, setUserOneRepMaxUpdatedAt] = useState<string | null>(null);
  const [oneRepStatus, setOneRepStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle');
  const [oneRepNotFound, setOneRepNotFound] = useState(false);
  const [oneRepError, setOneRepError] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [preview, setPreview] = useState<ExerciseOccurrence[]>([]);

  // Granular Overrides: Map<index, { _count?: number, ...ExerciseSet }>
  // Stores manual overrides for specific occurrences
  const [overrides, setOverrides] = useState<Map<number, SetGroupOverride>>(new Map());

  // UI State
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // Index of card being edited
  const [editingSetGroupIndex, setEditingSetGroupIndex] = useState<number>(0); // SetGroup index being edited

  const catalogExerciseId =
    (selectedGroup as GroupedExerciseWithCatalog | null)?.catalogExerciseId ||
    selectedGroup?.exerciseId;

  // Initialize
  useEffect(() => {
    const groups = WorkoutProgressionService.groupExercises(program);
    setGroupedExercises(groups);

    if (groups.length > 0) {
      if (
        !selectedGroup ||
        !groups.find((g: GroupedExercise) => g.exerciseId === selectedGroup.exerciseId)
      ) {
        const firstGroup = groups[0];
        if (firstGroup) setSelectedGroup(firstGroup);
      }
    }
  }, [program, selectedGroup]);

  // Handle selection change
  useEffect(() => {
    if (selectedGroup) {
      setSelectedIndices(new Set(selectedGroup.occurrences.map((_: unknown, i: number) => i)));
      setOverrides(new Map()); // Reset overrides on exercise switch

      const firstSet = selectedGroup.occurrences[0]?.exercise.setGroups[0]?.baseSet;
      let initialVal = 0;
      if (params.type === 'linear_weight') initialVal = firstSet?.weight || 0;
      else if (params.type === 'linear_reps') initialVal = firstSet?.reps || 0;
      else if (params.type === 'percentage') initialVal = firstSet?.intensityPercent || 0;
      else if (params.type === 'rpe') initialVal = firstSet?.rpe || 0;

      setParams((p: ProgressionParams) => ({ ...p, startValue: initialVal }));
      setOneRepMax(undefined);
      setUserOneRepMax(null);
      setUserOneRepMaxUpdatedAt(null);
      setOneRepStatus('idle');
      setOneRepNotFound(false);
      setOneRepError(null);
      setEditingIndex(null);
    }
  }, [params.type, selectedGroup]);

  // Fetch 1RM utente per l'esercizio selezionato
  useEffect(() => {
    if (!catalogExerciseId) return;
    let active = true;

    const loadOneRepMax = async () => {
      try {
        setOneRepStatus('loading');
        setOneRepError(null);
        const res = await fetch(`/api/profile/maxes/${catalogExerciseId}`);
        if (!active) return;

        if (res.status === 404) {
          setUserOneRepMax(null);
          setUserOneRepMaxUpdatedAt(null);
          setOneRepMax(undefined);
          setOneRepNotFound(true);
          setOneRepStatus('idle');
          return;
        }

        if (!res.ok) {
          throw new Error('Fetch 1RM fallito');
        }

        const data = await res.json();
        const value =
          data?.max?.oneRepMax !== undefined && data.max.oneRepMax !== null
            ? Number(data.max.oneRepMax)
            : undefined;
        const updatedAt = data?.max?.lastUpdated || data?.max?.createdAt || null;

        setUserOneRepMax(value ?? null);
        setUserOneRepMaxUpdatedAt(updatedAt);
        setOneRepMax(value ?? undefined);
        setOneRepNotFound(false);
        setOneRepStatus('idle');
      } catch (error) {
        logger.error('[ProgressionManager] Impossibile caricare 1RM', error);
        if (!active) return;
        setOneRepStatus('error');
        setOneRepError(t('errors.load1RM'));
      }
    };

    loadOneRepMax();

    return () => {
      active = false;
    };
  }, [catalogExerciseId]);

  // Calculate Preview + Apply Overrides
  useEffect(() => {
    if (!selectedGroup) return;

    // 1. Generate Base Progression
    const basePreview = WorkoutProgressionService.previewProgression(
      selectedGroup.occurrences,
      params,
      Array.from(selectedIndices).sort((a, b) => a - b),
      oneRepMax
    );

    // 2. Apply Manual Overrides
    // The override now stores the complete _setGroups array with all modifications
    const blendedPreview = basePreview.map((occ: ExerciseOccurrence, idx: number) => {
      if (overrides.has(idx)) {
        const overrideData = overrides.get(idx)!;
        const newOcc = JSON.parse(JSON.stringify(occ));

        // Apply SetGroups Override (entire setGroups array replacement)
        if (overrideData._setGroups) {
          newOcc.exercise.setGroups = JSON.parse(JSON.stringify(overrideData._setGroups));
        }

        // Re-sync with 1RM if context exists (ensure consistency after manual edit)
        if (oneRepMax) {
          return WorkoutProgressionService.syncOccurrenceWithOneRepMax(newOcc, oneRepMax);
        }
        return newOcc;
      }
      return occ;
    });

    setPreview(blendedPreview);
  }, [selectedGroup, params, selectedIndices, oneRepMax, overrides]);

  const handleApply = useCallback(() => {
    if (!preview.length) return;
    isApplyingRef.current = true;
    const updatedProgram = WorkoutProgressionService.applyToProgram(program, preview);
    onUpdate(updatedProgram);
    // Reset flag after a tick
    setTimeout(() => {
      isApplyingRef.current = false;
    }, 50);
  }, [preview, program, onUpdate]);

  // Auto-apply changes when overrides change (realtime persistence)
  useEffect(() => {
    // Skip if we're in the middle of applying or no overrides
    if (isApplyingRef.current || overrides.size === 0 || preview.length === 0) {
      return;
    }

    // Create a hash of current overrides to detect actual changes
    const overridesHash = JSON.stringify(Array.from(overrides.entries()));
    if (overridesHash === lastAppliedOverridesRef.current) {
      return; // No actual change
    }

    // Debounce the auto-apply
    const timer = setTimeout(() => {
      if (!isApplyingRef.current) {
        lastAppliedOverridesRef.current = overridesHash;
        isApplyingRef.current = true;
        const updatedProgram = WorkoutProgressionService.applyToProgram(program, preview);
        onUpdate(updatedProgram);
        setTimeout(() => {
          isApplyingRef.current = false;
        }, 50);
      }
    }, 500); // 500ms debounce for auto-save

    return () => clearTimeout(timer);
  }, [overrides, preview, program, onUpdate]);

  const toggleSelection = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const handleSaveOneRepMax = useCallback(async () => {
    if (!catalogExerciseId) {
      setOneRepError('Seleziona un esercizio per salvare il 1RM');
      return;
    }
    if (!oneRepMax || oneRepMax <= 0) {
      setOneRepError('Inserisci un 1RM valido (> 0)');
      return;
    }

    try {
      setOneRepStatus('saving');
      setOneRepError(null);
      const method = oneRepNotFound ? 'POST' : 'PATCH';
      const res = await fetch(`/api/profile/maxes/${catalogExerciseId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oneRepMax }),
      });

      if (!res.ok) {
        throw new Error(t('errors.save1RMFailed'));
      }

      const data = await res.json();
      const value =
        data?.max?.oneRepMax !== undefined && data.max.oneRepMax !== null
          ? Number(data.max.oneRepMax)
          : oneRepMax;
      const updatedAt = data?.max?.lastUpdated || new Date().toISOString();

      setUserOneRepMax(value);
      setUserOneRepMaxUpdatedAt(updatedAt);
      setOneRepMax(value);
      setOneRepNotFound(false);
      setOneRepStatus('idle');
    } catch (error) {
      logger.error('[ProgressionManager] Salvataggio 1RM fallito', error);
      setOneRepStatus('error');
      setOneRepError(t('errors.save1RM'));
    }
  }, [catalogExerciseId, oneRepMax, oneRepNotFound]);

  const handleDeleteOneRepMax = useCallback(async () => {
    if (!catalogExerciseId) return;
    try {
      setOneRepStatus('saving');
      setOneRepError(null);
      const res = await fetch(`/api/profile/maxes/${catalogExerciseId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Delete 1RM fallito');
      }
      setUserOneRepMax(null);
      setUserOneRepMaxUpdatedAt(null);
      setOneRepMax(undefined);
      setOneRepNotFound(true);
      setOneRepStatus('idle');
    } catch (error) {
      logger.error('[ProgressionManager] Delete 1RM fallito', error);
      setOneRepStatus('error');
      setOneRepError('Errore nell’eliminazione del 1RM');
    }
  }, [catalogExerciseId]);

  // Handle Group Update
  const handleGroupUpdate = useCallback(
    (occurrenceIndex: number, updatedGroup: SetGroup) => {
      const currentOverride = overrides.get(occurrenceIndex) ?? ({} as SetGroupOverride);
      const occ = preview[occurrenceIndex];
      if (!occ) return;

      const currentSetGroups: SetGroup[] =
        currentOverride._setGroups || occ.exercise.setGroups.map(deepCloneSetGroup);

      const sgIndex = editingSetGroupIndex;

      if (currentSetGroups[sgIndex]) {
        const newSetGroups = [...currentSetGroups];
        newSetGroups[sgIndex] = updatedGroup;

        const next = new Map(overrides);
        next.set(occurrenceIndex, {
          ...currentOverride,
          _setGroups: newSetGroups,
        });
        setOverrides(next);
      }
    },
    [overrides, preview, editingSetGroupIndex]
  );

  // Handle Add SetGroup
  const handleAddSetGroup = useCallback(
    (occurrenceIndex: number) => {
      if (!preview[occurrenceIndex]) return;

      const occ = preview[occurrenceIndex];
      const currentSetGroups = overrides.get(occurrenceIndex)?._setGroups || occ.exercise.setGroups;

      // Create a new SetGroup based on the last one (with NEW ID)
      const lastSetGroup = currentSetGroups[currentSetGroups.length - 1];
      const newSetGroup: SetGroup = lastSetGroup
        ? cloneSetGroupWithNewId(lastSetGroup)
        : {
            id: generateUniqueId(),
            count: 3,
            baseSet: { reps: 8, weight: 0, weightLbs: 0, rpe: 0, rest: 60, intensityPercent: 0 },
            sets: [],
          };

      // Keep existing setGroups with their IDs, add new one
      const newSetGroups = [...currentSetGroups.map(deepCloneSetGroup), newSetGroup];

      // Store as override
      const currentOverride = overrides.get(occurrenceIndex) ?? ({} as SetGroupOverride);
      const next = new Map(overrides);
      next.set(occurrenceIndex, {
        ...currentOverride,
        _setGroups: newSetGroups,
      });
      setOverrides(next);

      // Navigate to the new SetGroup and ensure editing is active
      setEditingSetGroupIndex(newSetGroups.length - 1);
      setEditingIndex(occurrenceIndex);
    },
    [preview, overrides]
  );

  // Handle Duplicate SetGroup
  const handleDuplicateSetGroup = useCallback(
    (occurrenceIndex: number, setGroupIndex: number) => {
      if (!preview[occurrenceIndex]) return;

      const occ = preview[occurrenceIndex];
      const currentSetGroups = overrides.get(occurrenceIndex)?._setGroups || occ.exercise.setGroups;

      if (!currentSetGroups[setGroupIndex]) return;

      // Clone existing (preserve IDs) and duplicate selected (new ID)
      const newSetGroups = currentSetGroups.map(deepCloneSetGroup);
      const cloned = cloneSetGroupWithNewId(currentSetGroups[setGroupIndex]!);
      newSetGroups.splice(setGroupIndex + 1, 0, cloned);

      // Store as override
      const currentOverride = overrides.get(occurrenceIndex) || {};
      const next = new Map(overrides);
      next.set(occurrenceIndex, {
        ...currentOverride,
        _setGroups: newSetGroups,
      });
      setOverrides(next);
      setEditingSetGroupIndex(setGroupIndex + 1);
    },
    [preview, overrides]
  );

  // Handle Remove SetGroup
  const handleRemoveSetGroup = useCallback(
    (occurrenceIndex: number, setGroupIndex: number) => {
      if (!preview[occurrenceIndex]) return;

      const occ = preview[occurrenceIndex];
      const currentSetGroups =
        (overrides.get(occurrenceIndex)?._setGroups as SetGroup[]) || occ.exercise.setGroups;

      // Cannot remove last SetGroup
      if (currentSetGroups.length <= 1) return;

      // Remove the specified index (preserve IDs of remaining)
      const newSetGroups = currentSetGroups
        .filter((_, i) => i !== setGroupIndex)
        .map(deepCloneSetGroup);

      // Store as override
      const currentOverride = overrides.get(occurrenceIndex) ?? ({} as SetGroupOverride);
      const next = new Map(overrides);
      next.set(occurrenceIndex, {
        ...currentOverride,
        _setGroups: newSetGroups,
      });
      setOverrides(next);

      // Adjust editing index if needed
      if (editingSetGroupIndex >= newSetGroups.length) {
        setEditingSetGroupIndex(Math.max(0, newSetGroups.length - 1));
      }
    },
    [preview, overrides, editingSetGroupIndex]
  );

  if (!selectedGroup)
    return (
      <div className="flex h-full items-center justify-center text-neutral-500">{t('loading')}</div>
    );

  return (
    <div className="flex h-full flex-col gap-6 p-4 pb-24 lg:flex-row lg:p-6">
      {/* Sidebar: Exercise List */}
      <div
        className={cn(
          'flex h-auto w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-100 lg:h-full lg:w-80 lg:shrink-0 dark:border-white/5 dark:bg-neutral-900/40 dark:hover:border-white/10 dark:hover:bg-neutral-900/60'
        )}
      >
        <div className="border-b border-neutral-200 bg-neutral-100/50 px-4 py-3 dark:border-white/5 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <LayoutList size={18} className="text-neutral-500 dark:text-neutral-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">{t('exercises')}</h3>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto p-2 lg:flex-1 lg:flex-col lg:overflow-y-auto">
          <LayoutGroup>
            {groupedExercises.map((group: any) => (
              <motion.button
                layout
                key={group.exerciseId}
                onClick={() => setSelectedGroup(group)}
                className={cn(
                  'relative flex min-w-[200px] flex-col items-start gap-1 rounded-xl px-4 py-3 transition-colors lg:w-full lg:min-w-0',
                  selectedGroup.exerciseId === group.exerciseId
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200'
                )}
              >
                {selectedGroup.exerciseId === group.exerciseId && (
                  <motion.div
                    layoutId="activeExercise"
                    className="absolute inset-0 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/50 dark:bg-blue-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 w-full truncate text-left font-medium">
                  {group.name}
                </span>
                <span
                  className={cn(
                    'relative z-10 text-xs',
                    selectedGroup.exerciseId === group.exerciseId
                      ? 'text-blue-600 dark:text-blue-200'
                      : 'text-neutral-400 dark:text-neutral-500'
                  )}
                >
                  {group.occurrences.length} {t('sessions')}
                </span>
              </motion.button>
            ))}
          </LayoutGroup>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Configuration Panel */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <div
            className={cn(
              'rounded-2xl border border-neutral-200 bg-neutral-50 p-4 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-100 sm:p-6 dark:border-white/5 dark:bg-neutral-900/40 dark:hover:border-white/10 dark:hover:bg-neutral-900/60'
            )}
          >
            <div className="mb-4 flex flex-col gap-4 sm:gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-blue-500/10 p-1.5 ring-1 ring-blue-500/20">
                    <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {t('configure')}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-white/5 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">{t('load')}</span>
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-white/5 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10">
                    <Save size={14} />
                    <span className="hidden sm:inline">{t('save')}</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-white/5 dark:bg-neutral-900/50">
                  <div className="flex items-center gap-2">
                    <Scale size={16} className="text-neutral-500" />
                    <div className="leading-tight">
                      <p className="text-xs font-semibold text-neutral-500 uppercase">
                        {t('labels.userOneRm')}
                      </p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {userOneRepMax ? `${userOneRepMax} kg` : t('labels.notSet')}
                      </p>
                    </div>
                    {userOneRepMax && (
                      <button
                        onClick={handleDeleteOneRepMax}
                        className="ml-auto text-xs font-semibold text-red-400 underline-offset-4 hover:underline"
                        type="button"
                      >
                        {t('labels.remove')}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 ring-1 ring-transparent focus-within:ring-blue-500/50 dark:border-white/10 dark:bg-black/20">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        placeholder={t('labels.enterOneRm')}
                        value={oneRepMax ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          setOneRepMax(value);
                          setOneRepStatus('idle');
                          setOneRepError(null);
                        }}
                        className="w-full bg-transparent text-sm font-semibold text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-600"
                      />
                      <span className="text-xs text-neutral-500">kg</span>
                    </div>
                    <button
                      onClick={handleSaveOneRepMax}
                      disabled={oneRepStatus === 'saving' || oneRepStatus === 'loading'}
                      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                        oneRepStatus === 'saving' || oneRepStatus === 'loading'
                          ? 'cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                          : 'bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/50 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30'
                      }`}
                      type="button"
                    >
                      {oneRepStatus === 'saving'
                        ? t('labels.saving')
                        : oneRepNotFound
                          ? t('labels.createOneRm')
                          : t('labels.saveOneRm')}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {userOneRepMaxUpdatedAt && (
                      <span className="text-[11px] text-neutral-500">
                        Aggiornato{' '}
                        {new Date(userOneRepMaxUpdatedAt).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </span>
                    )}
                    {oneRepStatus === 'loading' && (
                      <span className="text-[11px] text-blue-400">{t('labels.loading')}</span>
                    )}
                    {oneRepError && (
                      <span className="text-[11px] font-semibold text-red-400">{oneRepError}</span>
                    )}
                    {oneRepNotFound && !oneRepError && (
                      <span className="text-[11px] text-neutral-500">{t('labels.noSaved')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-white/5 dark:bg-white/5">
                    <h4 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                      {t('savedTemplates')}
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {[
                        { id: 'linear', label: t('templates.linear') },
                        { id: 'volume', label: t('templates.volume') },
                        { id: 'undulating', label: t('templates.undulating') },
                      ].map((item: any) => (
                        <button
                          key={item.id}
                          className="group rounded-lg border border-neutral-200 bg-white p-3 text-left transition-all hover:border-blue-500/50 hover:bg-neutral-50 dark:border-white/5 dark:bg-neutral-900/50 dark:hover:bg-neutral-800"
                        >
                          <div className="font-medium text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            {item.label}
                          </div>
                          <div className="text-xs text-neutral-500">{t('labels.clickToApply')}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500 uppercase">
                  {t('labels.type')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {progressionTypes.map((typeOption: any) => (
                    <button
                      key={typeOption.id}
                      onClick={() =>
                        setParams((p: ProgressionParams) => ({ ...p, type: typeOption.id }))
                      }
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        params.type === typeOption.id
                          ? 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 dark:border-white/5 dark:bg-transparent dark:text-neutral-400 dark:hover:bg-white/5'
                      )}
                    >
                      <typeOption.icon size={16} /> {typeOption.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500 uppercase">
                  {t('labels.start')}
                </label>
                <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 dark:border-white/10 dark:bg-black/20">
                  <input
                    type="number"
                    value={params.startValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setParams((p: ProgressionParams) => ({
                        ...p,
                        startValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-transparent text-neutral-900 outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500 uppercase">
                  {t('labels.step')}
                </label>
                <div className="relative flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 dark:border-white/10 dark:bg-black/20">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <span className="text-sm font-bold text-neutral-500">+</span>
                  </div>
                  <input
                    type="number"
                    value={params.increment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setParams((p: ProgressionParams) => ({
                        ...p,
                        increment: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-transparent pl-4 text-neutral-900 outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-500 uppercase">
                  {t('labels.freq')}
                </label>
                <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 dark:border-white/10 dark:bg-black/20">
                  <select
                    value={params.frequency}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setParams((p: ProgressionParams) => ({
                        ...p,
                        frequency: parseInt(e.target.value),
                      }))
                    }
                    className="w-full bg-transparent text-neutral-900 outline-none dark:text-white [&>option]:text-neutral-900 dark:[&>option]:bg-neutral-900 dark:[&>option]:text-white"
                  >
                    <option value={1}>{t('frequency.everySession')}</option>
                    <option value={2}>{t('frequency.every2Sessions')}</option>
                    <option value={3}>{t('frequency.every3Sessions')}</option>
                    <option value={4}>{t('frequency.every4Sessions')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline / Preview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 backdrop-blur-md transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-100 dark:border-white/5 dark:bg-neutral-900/40 dark:hover:border-white/10 dark:hover:bg-neutral-900/60"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100/50 px-6 py-4 dark:border-white/5 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900 dark:text-white">{t('timeline')}</h3>
              {oneRepMax && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-400">
                  1RM {oneRepMax} kg
                </span>
              )}
              <button
                onClick={() => handleAddSetGroup(editingIndex ?? 0)}
                disabled={editingIndex === null}
                className={cn(
                  'ml-4 flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                  editingIndex !== null
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                    : 'cursor-not-allowed border-neutral-200 bg-transparent text-neutral-400 dark:border-white/5 dark:text-neutral-600'
                )}
              >
                <Plus size={12} />
                {t('addSetGroup')}
              </button>
            </div>
            <div className="text-sm text-neutral-500">
              {t('instruction')}{' '}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {t('green')}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {preview.map((occ, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  const isEditing = editingIndex === idx;
                  const isOverridden = overrides.has(idx);

                  // Get effective SetGroups (from override or original)
                  const overrideSetGroups = overrides.get(idx)?._setGroups;
                  const effectiveSetGroups = overrideSetGroups || occ.exercise.setGroups;
                  const totalSetGroups = effectiveSetGroups.length;

                  // For display, show first SetGroup
                  const setGroup = effectiveSetGroups[0];
                  const baseSet = setGroup?.baseSet;

                  // Display value summary
                  const displaySummary = [];
                  if (baseSet?.weight) displaySummary.push(`${baseSet.weight}kg`);
                  if (baseSet?.reps) displaySummary.push(`${baseSet.reps}reps`);
                  if (baseSet?.rpe) displaySummary.push(`RPE${baseSet.rpe}`);

                  if (isEditing && baseSet) {
                    // Use already calculated effectiveSetGroups
                    const currentSetGroup = effectiveSetGroups[editingSetGroupIndex] || setGroup;

                    return (
                      <div
                        key={`edit-${idx}`}
                        className="rounded-xl border border-blue-500 bg-white p-4 shadow-lg dark:border-blue-500 dark:bg-neutral-800"
                      >
                        {/* Header with Navigation */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {t('session', { number: idx + 1 })}
                            </span>
                            {totalSetGroups > 1 && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                                    e.stopPropagation();
                                    setEditingSetGroupIndex(Math.max(0, editingSetGroupIndex - 1));
                                  }}
                                  disabled={editingSetGroupIndex === 0}
                                  className="p-1 text-neutral-400 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-blue-400"
                                  title="SetGroup precedente"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <span className="min-w-[60px] text-center text-xs text-neutral-500">
                                  SetGroup {editingSetGroupIndex + 1}/{totalSetGroups}
                                </span>
                                <button
                                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                                    e.stopPropagation();
                                    setEditingSetGroupIndex(
                                      Math.min(totalSetGroups - 1, editingSetGroupIndex + 1)
                                    );
                                  }}
                                  disabled={editingSetGroupIndex >= totalSetGroups - 1}
                                  className="p-1 text-neutral-400 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-blue-400"
                                  title="SetGroup successivo"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                            aria-label="Chiudi"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <SetGroupEditor
                          group={currentSetGroup}
                          onGroupChange={(updated) =>
                            handleGroupUpdate(idx, toDomainSetGroup(updated as any))
                          }
                          onGroupDelete={() => handleRemoveSetGroup(idx, editingSetGroupIndex)}
                          onGroupDuplicate={() =>
                            handleDuplicateSetGroup(idx, editingSetGroupIndex)
                          }
                          isExpanded={true}
                        />
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={`${occ.weekIndex}-${occ.dayIndex}-${occ.exerciseIndex}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                        isSelected
                          ? isOverridden
                            ? 'border-purple-200 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-900/10'
                            : 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10'
                          : 'border-neutral-200 bg-white opacity-60 hover:opacity-100 dark:border-neutral-800 dark:bg-neutral-900'
                      }`}
                      onClick={() => toggleSelection(idx)}
                    >
                      {/* Edit Button (Absolute) */}
                      <button
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                          e.stopPropagation();
                          setEditingIndex(idx);
                        }}
                        className="absolute top-2 right-2 p-2 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-blue-600"
                      >
                        <Edit2 size={16} />
                      </button>

                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-neutral-300 bg-transparent text-transparent dark:border-neutral-600'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 font-mono text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        W{occ.weekNumber}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {occ.dayName}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {t('day', { number: occ.dayNumber })}
                          </span>
                          {totalSetGroups > 1 && (
                            <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              {totalSetGroups} {t('groups')}
                            </span>
                          )}
                          {isOverridden && (
                            <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                              {t('modified')}
                            </span>
                          )}
                        </div>

                        {/* Comprehensive Set Summary */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">{setGroup?.count}</span>
                            <span className="text-xs text-neutral-400">x</span>
                            <span className="font-bold">
                              {setGroup?.baseSet.reps}
                              {setGroup?.baseSet.repsMax && `-${setGroup.baseSet.repsMax}`}
                            </span>
                          </div>

                          <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700"></div>

                          {(setGroup?.baseSet.weight || setGroup?.baseSet.intensityPercent) && (
                            <div className="font-medium">
                              {setGroup?.baseSet.weight && `${setGroup.baseSet.weight}kg`}
                              {setGroup?.baseSet.weightMax && `-${setGroup.baseSet.weightMax}kg`}
                              {setGroup?.baseSet.intensityPercent && (
                                <span className="ml-1.5 text-xs text-neutral-400">
                                  ({setGroup.baseSet.intensityPercent}%)
                                </span>
                              )}
                            </div>
                          )}

                          {setGroup?.baseSet.rpe && (
                            <>
                              <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700"></div>
                              <div className="text-xs">
                                <span className="font-medium text-neutral-500 dark:text-neutral-400">
                                  RPE
                                </span>{' '}
                                {setGroup.baseSet.rpe}
                              </div>
                            </>
                          )}

                          {setGroup?.baseSet.rest && (
                            <>
                              <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700"></div>
                              <div className="text-xs text-neutral-400">
                                {setGroup.baseSet.rest}s
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <ArrowRight size={16} className="text-neutral-300 dark:text-neutral-600" />
                        <motion.div
                          key={displaySummary.join('-')}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            'hidden min-w-[80px] rounded-lg px-3 py-1.5 text-center font-mono font-bold transition-colors sm:block',
                            isSelected
                              ? 'bg-white text-blue-600 shadow-sm dark:bg-neutral-800 dark:text-blue-400'
                              : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
                          )}
                        >
                          {/* Simplified display for quick glance, detailed view on left */}
                          {params.type === 'linear_weight'
                            ? `${baseSet?.weight}kg`
                            : params.type === 'percentage'
                              ? `${baseSet?.intensityPercent}%`
                              : params.type === 'rpe'
                                ? `RPE ${baseSet?.rpe}`
                                : `${baseSet?.reps} reps`}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="border-t border-neutral-200 bg-white/80 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
            <Button
              variant="gradient-primary"
              icon={<Play size={18} className="fill-white text-white" />}
              onPress={handleApply}
              className="w-full"
            >
              {t('applyFrom', { count: selectedIndices.size })}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
