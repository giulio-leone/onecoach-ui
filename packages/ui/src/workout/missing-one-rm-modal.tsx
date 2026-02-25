/**
 * MissingOneRMModal Component
 *
 * Modal per inserimento rapido di 1RM mancanti per esercizi nel programma
 * Supporta sia input diretto che stima da reps × peso
 *
 * Features:
 * - Auto-save con debounce e shimmer feedback
 * - Supabase Realtime per aggiornamenti istantanei
 */
'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { AlertCircle, Check, Calculator, Edit3, Info, Loader2 } from 'lucide-react';
import { Button } from '../button';
import { Modal, ModalFooter } from '../dialog';
import { Tooltip } from '../tooltip';
import { ExerciseCombobox } from '@giulio-leone/ui/workout';
import { useOneRepMax, type MissingOneRM } from '@giulio-leone/features/workout/hooks';
import { useWeightUnit } from '@giulio-leone/lib-api/hooks';
import { estimateOneRMFromReps } from '@giulio-leone/lib-workout/intensity-calculator';
import { kgToLbs, lbsToKg } from '@giulio-leone/lib-shared';
import { logger } from '@giulio-leone/lib-shared';
import { useMagicAnimation } from '@giulio-leone/lib-stores';
import { useMaxesListRealtime } from '@giulio-leone/hooks';
import { useTranslations } from 'next-intl';
import type { LocalizedExercise } from '@giulio-leone/one-workout';

interface MissingOneRMModalProps {
  missing: MissingOneRM[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: (catalogExerciseId?: string) => Promise<void> | void;
}

export function MissingOneRMModal({ missing, isOpen, onClose, onSaved }: MissingOneRMModalProps) {
  const t = useTranslations('common.oneRm');
  const tActions = useTranslations('common.actions');
  const { upsert } = useOneRepMax();
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Abilita Supabase Realtime per aggiornamenti istantanei
  useMaxesListRealtime();

  const handleSave = useCallback(
    async (catalogExerciseId: string, oneRepMax: number, notes?: string) => {
      if (!oneRepMax || oneRepMax <= 0) {
        return;
      }

      // Mark as saving
      setSavingIds((prev) => new Set(prev).add(catalogExerciseId));

      try {
        const success = await upsert({
          catalogExerciseId,
          oneRepMax,
          notes: notes ?? null,
        });
        if (success) {
          // Notifichiamo il componente superiore per ricalcolare i pesi esplicitamente
          // Attendiamo che il ricalcolo sia completato prima di marcare come salvato nel UI
          await onSaved(catalogExerciseId);

          setSavedIds((prev) => new Set(prev).add(catalogExerciseId));
        }
      } catch (error: unknown) {
        logger.error('Error saving 1RM', error);
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(catalogExerciseId);
          return next;
        });
      }
    },
    [upsert, onSaved]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('missingTitle')}
      size="lg"
      className="glass-strong flex max-h-[90vh] flex-col border border-white/20 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/80"
    >
      <div className="mb-6 flex items-start gap-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 backdrop-blur-sm">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{t('missingDesc')}</p>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1 pb-4">
        {missing.map((item: MissingOneRM, index) => {
          if (!item.catalogExerciseId) {
            return null;
          }
          const isSaved = savedIds.has(item.catalogExerciseId);
          const isSaving = savingIds.has(item.catalogExerciseId);
          return (
            <OneRMEntry
              key={item.catalogExerciseId || index}
              catalogExerciseId={item.catalogExerciseId}
              exerciseName={item.exerciseName}
              isSaved={isSaved}
              isSaving={isSaving}
              onSave={handleSave}
            />
          );
        })}
      </div>

      {missing.length === 0 && (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-8">
          <div className="shadow-glow-sm mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <Check className="h-6 w-6" />
          </div>
          <p className="text-lg font-medium text-neutral-900 dark:text-white">{t('allReady')}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('allReadyDesc')}</p>
        </div>
      )}

      <ModalFooter className="mt-auto border-t border-neutral-200/50 pt-4 dark:border-white/10">
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-neutral-500 hover:bg-neutral-100 sm:w-auto dark:text-neutral-400 dark:hover:bg-white/5"
        >
          {savedIds.size > 0 ? tActions('close') : tActions('cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface OneRMEntryProps {
  catalogExerciseId: string;
  exerciseName: string;
  isSaved: boolean;
  isSaving: boolean;
  onSave: (catalogExerciseId: string, oneRepMax: number, notes?: string) => void;
}

type InputMode = 'direct' | 'estimate';

// Debounce delay per auto-save (ms)
const AUTO_SAVE_DELAY = 800;

function OneRMEntry({
  catalogExerciseId,
  exerciseName,
  isSaved,
  isSaving,
  onSave,
}: OneRMEntryProps) {
  const t = useTranslations('common.oneRm');
  const tWorkout = useTranslations('common.workout');
  const tCommon = useTranslations('common');
  const weightUnit = useWeightUnit();
  const [inputMode, setInputMode] = useState<InputMode>('estimate');
  const [oneRepMax, setOneRepMax] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<LocalizedExercise | null>(null);

  // Estimate mode state
  const [estWeight, setEstWeight] = useState<string>('');
  const [estReps, setEstReps] = useState<string>('');
  const [estRpe, setEstRpe] = useState<string>('8');

  // Auto-save debounce refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedValueRef = useRef<number | null>(null);

  // Shimmer animation for save feedback
  const { animationClass, trigger: triggerShimmer } = useMagicAnimation({
    type: 'shimmer',
    duration: 1000,
  });

  // Trigger shimmer when saving starts
  useEffect(() => {
    if (isSaving) {
      triggerShimmer();
    }
  }, [isSaving, triggerShimmer]);

  const handleExerciseSelect = (exercise: LocalizedExercise) => {
    setSelectedExercise(exercise);
  };

  // Calculate estimated 1RM from reps × weight
  const calculatedOneRM = (() => {
    if (inputMode !== 'estimate') return null;
    const weightNum = parseFloat(estWeight);
    const repsNum = parseInt(estReps, 10);
    const rpeNum = parseFloat(estRpe);

    if (isNaN(weightNum) || isNaN(repsNum) || isNaN(rpeNum)) return null;
    if (weightNum <= 0 || repsNum <= 0 || repsNum > 30 || rpeNum < 1 || rpeNum > 10) return null;

    try {
      const weightKg = weightUnit === 'LBS' ? lbsToKg(weightNum) : weightNum;
      return estimateOneRMFromReps(repsNum, weightKg, rpeNum);
    } catch {
      return null;
    }
  })();

  const displayCalculatedOneRM = (() => {
    if (calculatedOneRM === null) return null;
    if (weightUnit === 'LBS') {
      return kgToLbs(calculatedOneRM).toFixed(1);
    }
    return calculatedOneRM.toFixed(1);
  })();

  // Auto-save function with debounce
  const triggerAutoSave = useCallback(
    (value: number, noteText?: string) => {
      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Skip if value hasn't changed
      if (lastSavedValueRef.current === value) {
        return;
      }

      debounceRef.current = setTimeout(() => {
        lastSavedValueRef.current = value;
        onSave(catalogExerciseId, value, noteText);
      }, AUTO_SAVE_DELAY);
    },
    [catalogExerciseId, onSave]
  );

  // Auto-save when estimate mode has valid value
  useEffect(() => {
    if (inputMode === 'estimate' && calculatedOneRM !== null && calculatedOneRM > 0) {
      const unit = weightUnit === 'LBS' ? 'lbs' : 'kg';
      const noteText = t('estimatedFrom', {
        weight: estWeight,
        unit,
        reps: estReps,
        rpe: estRpe,
      });
      triggerAutoSave(calculatedOneRM, notes ? `${noteText}. ${notes}` : noteText);
    }
  }, [
    calculatedOneRM,
    inputMode,
    estWeight,
    estReps,
    estRpe,
    notes,
    weightUnit,
    triggerAutoSave,
    t,
  ]);

  // Auto-save when direct mode has valid value (on blur)
  const handleDirectInputBlur = useCallback(() => {
    const value = parseFloat(oneRepMax);
    if (!isNaN(value) && value > 0) {
      let finalValue = value;
      if (weightUnit === 'LBS') {
        finalValue = lbsToKg(value);
      }
      triggerAutoSave(finalValue, notes || undefined);
    }
  }, [oneRepMax, weightUnit, notes, triggerAutoSave]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const getRpeDescription = (rpeValue: number): string => {
    if (rpeValue >= 10) return t('repsInReserve', { count: 0 });
    if (rpeValue >= 9) return t('repsInReserve', { count: 1 });
    if (rpeValue >= 8) return t('repsInReserve', { count: 2 });
    if (rpeValue >= 7) return t('repsInReserve', { count: 3 });
    return t('repsInReservePlus', { count: 4 });
  };

  if (isSaved) {
    return (
      <div className="glass flex items-center gap-3 rounded-xl border-l-4 border-l-green-500 bg-green-500/10 p-4 transition-all dark:bg-green-500/5">
        <div className="shadow-glow-sm flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-medium text-green-900 dark:text-green-100">{exerciseName}</p>
          <p className="text-xs text-green-700 dark:text-green-300">{t('savedSuccess')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass hover:shadow-glow-sm relative overflow-hidden rounded-xl border border-white/20 p-5 transition-all hover:bg-white/40 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10 ${animationClass}`}
    >
      {/* Shimmer overlay during save */}
      {isSaving && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px] dark:bg-neutral-900/50">
          <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-blue-600 backdrop-blur-md">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">{t('saving')}</span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {exerciseName}
        </label>
        <div className="relative">
          <ExerciseCombobox
            onSelect={handleExerciseSelect}
            placeholder={t('changeExercise')}
            className="w-full border-white/20 bg-white/50 backdrop-blur-sm focus:ring-blue-500/30 dark:border-white/10 dark:bg-black/20"
          />
        </div>
        {selectedExercise && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
            <Check className="h-3 w-3" />
            <span>
              {t('selected')}: {selectedExercise.translation?.name ?? selectedExercise.slug}
            </span>
          </p>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 rounded-lg bg-neutral-100/50 p-1 backdrop-blur-sm dark:bg-white/5">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setInputMode('estimate')}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              inputMode === 'estimate'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-neutral-800 dark:text-blue-400'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Calculator className="h-4 w-4" />
            {t('estimateMode')}
          </button>
          <button
            onClick={() => setInputMode('direct')}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              inputMode === 'direct'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-neutral-800 dark:text-blue-400'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            {t('directMode')}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {inputMode === 'estimate' ? (
          /* Estimate Mode */
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="mb-4 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3 text-xs text-blue-700 dark:text-blue-300">
              {t('estimateInfo')}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {tWorkout('weight')} ({weightUnit === 'LBS' ? 'lbs' : 'kg'})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={estWeight}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEstWeight(e.target.value)
                    }
                    placeholder={weightUnit === 'LBS' ? '176' : '80'}
                    className="w-full rounded-lg border border-white/20 bg-white/50 px-3 py-2.5 text-sm font-medium transition-all placeholder:text-neutral-400 focus:border-blue-500/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:focus:bg-black/40"
                    disabled={isSaving}
                  />
                  <span className="absolute top-2.5 right-3 text-xs font-medium text-neutral-400">
                    {weightUnit === 'LBS' ? 'lbs' : 'kg'}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {tWorkout('reps')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={estReps}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEstReps(e.target.value)}
                  placeholder="8"
                  className="w-full rounded-lg border border-white/20 bg-white/50 px-3 py-2.5 text-sm font-medium transition-all placeholder:text-neutral-400 focus:border-blue-500/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:focus:bg-black/40"
                  disabled={isSaving}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {t('rpe')} ({tCommon('input')})
                  </label>
                  <Tooltip
                    content={estRpe ? getRpeDescription(parseFloat(estRpe)) : t('rpePlaceholder')}
                  >
                    <Info className="h-3 w-3 cursor-help text-neutral-400 hover:text-neutral-600" />
                  </Tooltip>
                </div>
                <select
                  value={estRpe}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEstRpe(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-white/20 bg-white/50 px-3 py-2.5 text-sm font-medium transition-all focus:border-blue-500/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:focus:bg-black/40"
                  disabled={isSaving}
                >
                  <option value="10">{t('rpe10')}</option>
                  <option value="9.5">{t('rpe95')}</option>
                  <option value="9">{t('rpe9')}</option>
                  <option value="8.5">{t('rpe85')}</option>
                  <option value="8">{t('rpe8')}</option>
                  <option value="7.5">{t('rpe75')}</option>
                  <option value="7">{t('rpe7')}</option>
                  <option value="6">{t('rpe6')}</option>
                </select>
              </div>
            </div>

            {calculatedOneRM !== null && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg ring-1 shadow-blue-500/20 ring-white/20">
                <div>
                  <p className="text-xs font-medium text-blue-100">{t('estimated')}</p>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                    {displayCalculatedOneRM}{' '}
                    <span className="text-sm font-normal opacity-80">
                      {weightUnit === 'LBS' ? 'lbs' : 'kg'}
                    </span>
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Calculator className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Direct Input Mode */
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="mb-4 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3 text-xs text-blue-700 dark:text-blue-300">
              {t('directInfo')}
            </div>
            <label
              htmlFor={`1rm-${catalogExerciseId}`}
              className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              1RM ({weightUnit === 'LBS' ? 'lbs' : 'kg'})
            </label>
            <div className="relative">
              <input
                id={`1rm-${catalogExerciseId}`}
                type="number"
                step="0.1"
                min={weightUnit === 'LBS' ? '0.2' : '0.1'}
                max={weightUnit === 'LBS' ? '2205' : '1000'}
                value={oneRepMax}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOneRepMax(e.target.value)}
                onBlur={handleDirectInputBlur}
                placeholder={t('placeholderEx', { value: weightUnit === 'LBS' ? '225' : '100' })}
                className="w-full rounded-lg border border-white/20 bg-white/50 px-3 py-2.5 text-lg font-medium transition-all placeholder:text-neutral-400 focus:border-blue-500/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:focus:bg-black/40"
                disabled={isSaving}
              />
              <span className="absolute top-3 right-3 text-sm font-medium text-neutral-400">
                {weightUnit === 'LBS' ? 'lbs' : 'kg'}
              </span>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor={`notes-${catalogExerciseId}`}
            className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
          >
            {tCommon('measurements.notes')}
          </label>
          <textarea
            id={`notes-${catalogExerciseId}`}
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            rows={2}
            className="w-full resize-none rounded-lg border border-white/20 bg-white/50 px-3 py-2.5 text-sm transition-all placeholder:text-neutral-400 focus:border-blue-500/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:focus:bg-black/40"
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
