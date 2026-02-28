/**
 * Session Edit Card Component
 *
 * Inline editing card for workout session parameters.
 * Supports unified range inputs (e.g., "8-10") and automatic value sync.
 *
 * SOLID: Single Responsibility - solo editing di una sessione
 * DRY: Usa RangeInput per tutti i campi range
 * KISS: Logica semplice con callback
 *
 * @module features/workouts/components/builder/session-edit-card
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { X, Plus, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { RangeInput, type RangeFieldType } from './range-input';
import { syncSetValues, type FocusField, type SyncedValues } from '@giulio-leone/lib-workout';
import type { ExerciseSet, SetGroup } from '@giulio-leone/types/workout';

// =====================================================
// Types
// =====================================================

interface SessionEditCardProps {
  index: number;
  setGroup: SetGroup;
  baseSet: ExerciseSet;
  oneRepMax?: number;
  onClose: () => void;
  onSave: (index: number, data: Partial<ExerciseSet>, count?: number) => void;
  onAddSetGroup?: (index: number) => void;
  onDuplicateSetGroup?: (index: number, setGroupIndex: number) => void;
  onRemoveSetGroup?: (index: number, setGroupIndex: number) => void;
  setGroupIndex?: number;
  totalSetGroups?: number;
  onSetGroupIndexChange?: (newIndex: number) => void;
}

// =====================================================
// Component
// =====================================================

export function SessionEditCard({
  index,
  setGroup,
  baseSet,
  oneRepMax,
  onClose,
  onSave,
  onAddSetGroup,
  onDuplicateSetGroup,
  onRemoveSetGroup,
  setGroupIndex = 0,
  totalSetGroups = 1,
  onSetGroupIndexChange,
}: SessionEditCardProps) {
  // Track which field is being edited for sync priority
  const [focusField, setFocusField] = useState<FocusField | null>(null);

  // Local state for calculated values
  const [syncedValues, setSyncedValues] = useState<SyncedValues>({});

  // Get current reps for RPE calculations
  const currentReps = baseSet.reps || 8;

  // Memoize the displayed values (mix of base + synced)
  const displayValues = useMemo(() => {
    return {
      weight: syncedValues.weight ?? baseSet.weight,
      weightMax: syncedValues.weightMax ?? baseSet.weightMax,
      intensityPercent: syncedValues.intensityPercent ?? baseSet.intensityPercent,
      intensityPercentMax: syncedValues.intensityPercentMax ?? baseSet.intensityPercentMax,
      rpe: syncedValues.rpe ?? baseSet.rpe,
      rpeMax: syncedValues.rpeMax ?? baseSet.rpeMax,
    };
  }, [baseSet, syncedValues]);

  // Handle range change with sync
  const handleRangeChange = useCallback(
    (field: RangeFieldType, min: number, max?: number) => {
      // Build update object based on field type
      const update: Partial<ExerciseSet> = {};

      switch (field) {
        case 'reps':
          update.reps = min;
          if (max !== undefined) update.repsMax = max;
          break;
        case 'weight':
          update.weight = min;
          if (max !== undefined) update.weightMax = max;
          break;
        case 'intensity':
          update.intensityPercent = min;
          if (max !== undefined) update.intensityPercentMax = max;
          break;
        case 'rpe':
          update.rpe = min;
          if (max !== undefined) update.rpeMax = max;
          break;
        case 'rest':
          update.rest = min;
          break;
      }

      // For syncable fields (weight, intensity, rpe), calculate derived values
      const isSyncableField = field === 'weight' || field === 'intensity' || field === 'rpe';

      // Calculate synced values if 1RM is available and we're editing a syncable field
      if (oneRepMax && oneRepMax > 0 && isSyncableField) {
        // Use the field being edited as master, with the NEW values
        const masterField = field as FocusField;

        // Build input values with the NEW values for the field being edited
        const inputValues = {
          weight: field === 'weight' ? min : baseSet.weight,
          weightMax: field === 'weight' ? max : baseSet.weightMax,
          intensityPercent: field === 'intensity' ? min : baseSet.intensityPercent,
          intensityPercentMax: field === 'intensity' ? max : baseSet.intensityPercentMax,
          rpe: field === 'rpe' ? min : baseSet.rpe,
          rpeMax: field === 'rpe' ? max : baseSet.rpeMax,
        };

        const newSynced = syncSetValues(masterField, inputValues, oneRepMax, currentReps);
        setSyncedValues(newSynced);

        // ALWAYS merge synced values into update for non-master fields
        // This ensures derived values are persisted
        if (masterField !== 'weight' && newSynced.weight !== undefined) {
          update.weight = newSynced.weight;
          if (newSynced.weightMax !== undefined) update.weightMax = newSynced.weightMax;
        }
        if (masterField !== 'intensity' && newSynced.intensityPercent !== undefined) {
          update.intensityPercent = newSynced.intensityPercent;
          if (newSynced.intensityPercentMax !== undefined)
            update.intensityPercentMax = newSynced.intensityPercentMax;
        }
        if (masterField !== 'rpe' && newSynced.rpe !== undefined) {
          update.rpe = newSynced.rpe;
          if (newSynced.rpeMax !== undefined) update.rpeMax = newSynced.rpeMax;
        }
      }

      onSave(index, update);
    },
    [index, onSave, oneRepMax, baseSet, currentReps]
  );

  // Handle field focus - set as master for sync
  const handleFieldFocus = useCallback((field: FocusField) => {
    setFocusField(field);
  }, []);

  const handleCountChange = useCallback(
    (delta: number) => {
      const newCount = Math.max(1, (setGroup.count || 1) + delta);
      onSave(index, {}, newCount);
    },
    [index, onSave, setGroup.count]
  );

  const canRemoveSetGroup = totalSetGroups > 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl border border-primary-500 bg-white p-4 shadow-lg dark:border-primary-500 dark:bg-white/[0.04]"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-900 dark:text-white">Sessione {index + 1}</span>
          {totalSetGroups > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  onSetGroupIndexChange?.(Math.max(0, setGroupIndex - 1));
                }}
                disabled={setGroupIndex === 0}
                className="p-1 text-neutral-400 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-primary-400"
                title="SetGroup precedente"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-[60px] text-center text-xs text-neutral-500">
                SetGroup {setGroupIndex + 1}/{totalSetGroups}
              </span>
              <button
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  onSetGroupIndexChange?.(Math.min(totalSetGroups - 1, setGroupIndex + 1));
                }}
                disabled={setGroupIndex >= totalSetGroups - 1}
                className="p-1 text-neutral-400 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-primary-400"
                title="SetGroup successivo"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* SetGroup Actions */}
          {onAddSetGroup && (
            <button
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                onAddSetGroup(index);
              }}
              className="p-1.5 text-neutral-400 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              title="Aggiungi SetGroup"
            >
              <Plus size={16} />
            </button>
          )}
          {onDuplicateSetGroup && (
            <button
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                onDuplicateSetGroup(index, setGroupIndex);
              }}
              className="p-1.5 text-neutral-400 transition-colors hover:text-primary-600 dark:hover:text-primary-400"
              title="Duplica SetGroup"
            >
              <Copy size={16} />
            </button>
          )}
          {onRemoveSetGroup && canRemoveSetGroup && (
            <button
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                onRemoveSetGroup(index, setGroupIndex);
              }}
              className="p-1.5 text-neutral-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
              title="Rimuovi SetGroup"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            aria-label="Chiudi"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 1RM Display if available */}
      {oneRepMax && oneRepMax > 0 && (
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className="text-neutral-500 dark:text-neutral-400">1RM:</span>
          <span className="font-bold text-primary-600 dark:text-primary-400">{oneRepMax}kg</span>
          <span className="text-neutral-400">(valori calcolati in verde)</span>
        </div>
      )}

      {/* Fields Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {/* Sets Control */}
        <FieldGroup label="Serie">
          <div className="flex items-center gap-2">
            <CounterButton onClick={() => handleCountChange(-1)}>-</CounterButton>
            <span className="w-8 text-center font-medium text-neutral-900 dark:text-white">
              {setGroup.count}
            </span>
            <CounterButton onClick={() => handleCountChange(1)}>+</CounterButton>
          </div>
        </FieldGroup>

        {/* Reps */}
        <FieldGroup label="Reps">
          <RangeInput
            fieldType="reps"
            value={baseSet.reps}
            valueMax={baseSet.repsMax}
            onChange={(min, max) => handleRangeChange('reps', min, max)}
          />
        </FieldGroup>

        {/* Weight */}
        <FieldGroup label="Peso">
          <RangeInput
            fieldType="weight"
            value={displayValues.weight}
            valueMax={displayValues.weightMax}
            onChange={(min, max) => handleRangeChange('weight', min, max)}
            onFocus={() => handleFieldFocus('weight')}
            calculatedValue={focusField !== 'weight' ? syncedValues.weight : undefined}
            calculatedValueMax={focusField !== 'weight' ? syncedValues.weightMax : undefined}
          />
        </FieldGroup>

        {/* Intensity */}
        <FieldGroup label="% 1RM">
          <RangeInput
            fieldType="intensity"
            value={displayValues.intensityPercent}
            valueMax={displayValues.intensityPercentMax}
            onChange={(min, max) => handleRangeChange('intensity', min, max)}
            onFocus={() => handleFieldFocus('intensity')}
            calculatedValue={focusField !== 'intensity' ? syncedValues.intensityPercent : undefined}
            calculatedValueMax={
              focusField !== 'intensity' ? syncedValues.intensityPercentMax : undefined
            }
          />
        </FieldGroup>

        {/* RPE */}
        <FieldGroup label="RPE">
          <RangeInput
            fieldType="rpe"
            value={displayValues.rpe}
            valueMax={displayValues.rpeMax}
            onChange={(min, max) => handleRangeChange('rpe', min, max)}
            onFocus={() => handleFieldFocus('rpe')}
            calculatedValue={focusField !== 'rpe' ? syncedValues.rpe : undefined}
            calculatedValueMax={focusField !== 'rpe' ? syncedValues.rpeMax : undefined}
          />
        </FieldGroup>

        {/* Rest */}
        <FieldGroup label="Rest">
          <RangeInput
            fieldType="rest"
            value={baseSet.rest}
            onChange={(min: React.ChangeEvent<HTMLInputElement>) => handleRangeChange('rest', min)}
          />
        </FieldGroup>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
          💡 Usa formato range: 8-10 per min-max
        </div>
        <button
          onClick={onClose}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Chiudi
        </button>
      </div>
    </motion.div>
  );
}

// =====================================================
// Sub-components (DRY - extracted common patterns)
// =====================================================

interface FieldGroupProps {
  label: string;
  children: React.ReactNode;
}

function FieldGroup({ label, children }: FieldGroupProps) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-neutral-500 uppercase dark:text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}

interface CounterButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

function CounterButton({ onClick, children }: CounterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-white/[0.08]"
    >
      {children}
    </button>
  );
}

export default SessionEditCard;
