/**
 * Set Editor Component
 *
 * Componente per editare un singolo set di esercizio
 * Include supporto per intensity%, RPE e calcolo automatico peso
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Clock, Calculator } from 'lucide-react';
import { kgToLbs, lbsToKg, getWeightValue } from '@giulio-leone/lib-shared';
import { useBidirectionalWeightCalc } from '../hooks/use-bidirectional-weight-calc';
import type { BuilderExerciseSet as ExerciseSet } from './builder-types';

interface SetEditorProps {
  setIndex: number;
  set: ExerciseSet;
  exerciseId?: string;
  onSetChange: (set: ExerciseSet) => void;
  groupId?: string; // ID del gruppo se questa serie fa parte di un gruppo
  onGroupAction?: (action: 'remove-from-group' | 'split-group') => void; // Azioni sul gruppo
  editMode?: 'individual' | 'block'; // Modalità modifica (blocco = disabilita modifica individuale)
  className?: string;
  oneRepMax?: number | null;
  weightUnit?: 'KG' | 'LBS';
}

export function SetEditor({
  setIndex,
  set,
  exerciseId,
  onSetChange,
  groupId,
  onGroupAction: _onGroupAction,
  editMode,
  className,
  oneRepMax = null,
  weightUnit = 'KG',
}: SetEditorProps) {
  const [intensityPercentInputFocused, setIntensityInputFocused] = useState(false);
  const [weightInputFocused, setWeightInputFocused] = useState(false);
  const rpeString = (set.rpe ?? '').toString();
  const isInternalUpdate = useRef(false);

  // Memoizzare i handler per evitare ricreazioni ad ogni render
  const handleWeightChange = useCallback(
    (newWeight: number | undefined, newWeightLbs?: number | undefined) => {
      // Marca come aggiornamento interno per evitare loop
      isInternalUpdate.current = true;
      // Calcola weightLbs se necessario (usa quello passato o calcola da kg)
      const weightLbs =
        newWeightLbs ?? (newWeight !== null && newWeight !== undefined ? kgToLbs(newWeight) : null);
      // Aggiorna il set (converti undefined in null)
      onSetChange({
        ...set,
        weight: newWeight ?? null,
        weightLbs: weightLbs ?? null,
      });
    },
    [set, onSetChange]
  );

  const handleIntensityChange = useCallback(
    (newIntensity: number | undefined) => {
      // Marca come aggiornamento interno per evitare loop
      isInternalUpdate.current = true;
      // Aggiorna il set (converti undefined in null)
      onSetChange({
        ...set,
        intensityPercent: newIntensity ?? null,
      });
    },
    [set, onSetChange]
  );

  useBidirectionalWeightCalc({
    intensityPercent: set.intensityPercent,
    weight: set.weight,
    oneRepMax,
    onWeightChange: handleWeightChange,
    onIntensityChange: handleIntensityChange,
    weightInputFocused,
    intensityInputFocused: intensityPercentInputFocused,
  });

  const hasOneRM = oneRepMax !== null && oneRepMax > 0;

  const handleIntensityPercentChange = useCallback(
    (value: string) => {
      const numValue = value === '' ? undefined : parseFloat(value);
      isInternalUpdate.current = true;
      if (numValue !== undefined && !isNaN(numValue)) {
        const newSet = {
          ...set,
          intensityPercent: numValue,
        };
        onSetChange(newSet);
      } else if (value === '') {
        const newSet = {
          ...set,
          intensityPercent: null,
        };
        onSetChange(newSet);
      }
    },
    [set, onSetChange]
  );

  const handleWeightChangeInput = useCallback(
    (value: string) => {
      const numValue = value === '' ? undefined : parseFloat(value);
      isInternalUpdate.current = true;
      if (numValue !== undefined && !isNaN(numValue)) {
        // Se l'utente inserisce peso nell'unità preferita, converti in kg
        let weightKg = numValue;
        let weightLbs = set.weightLbs;
        if (weightUnit === 'LBS') {
          // L'utente ha inserito libbre, converti in kg
          weightKg = lbsToKg(numValue);
          weightLbs = numValue;
        } else {
          // L'utente ha inserito kg
          weightKg = numValue;
          weightLbs = kgToLbs(numValue);
        }
        const newSet = {
          ...set,
          weight: weightKg,
          weightLbs,
        };
        onSetChange(newSet);
      } else if (value === '') {
        const newSet = {
          ...set,
          weight: null,
          weightLbs: null,
        };
        onSetChange(newSet);
      }
    },
    [set, weightUnit, onSetChange]
  );

  const handleRpeChange = (value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    onSetChange({
      ...set,
      rpe: numValue && !isNaN(numValue) && numValue >= 1 && numValue <= 10 ? numValue : null,
    });
  };

  const isDisabled = editMode === 'block' && !!groupId; // Disabilita se in modalità blocco e fa parte di un gruppo

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm transition-all ${
        groupId
          ? 'border-primary-300 bg-primary-50'
          : 'border-neutral-200/60 bg-neutral-50 dark:border-white/[0.08] dark:bg-neutral-800/50'
      } ${isDisabled ? 'opacity-60' : ''} ${className || ''}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Serie {setIndex + 1}
        </div>
        {groupId && (
          <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
            Gruppo
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Reps */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Ripetizioni (Min - Max)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={set.reps || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newSet = {
                  ...set,
                  reps: e.target.value === '' ? undefined : Number(e.target.value),
                };
                onSetChange(newSet);
              }}
              disabled={isDisabled}
              className={`w-full rounded border px-2 py-2 text-sm focus:ring-2 focus:outline-none ${
                isDisabled
                  ? 'cursor-not-allowed border-neutral-200/60 bg-neutral-100 text-neutral-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-600'
                  : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200 dark:border-white/[0.1]'
              }`}
              placeholder="Min"
              min="0"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              value={set.repsMax || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newSet = {
                  ...set,
                  repsMax: e.target.value === '' ? undefined : Number(e.target.value),
                };
                onSetChange(newSet);
              }}
              disabled={isDisabled}
              className={`w-full rounded border px-2 py-2 text-sm focus:ring-2 focus:outline-none ${
                isDisabled
                  ? 'cursor-not-allowed border-neutral-200/60 bg-neutral-100 text-neutral-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-600'
                  : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200 dark:border-white/[0.1]'
              }`}
              placeholder="Max"
              min="0"
            />
          </div>
        </div>

        {/* Weight */}
        <div className="flex flex-col">
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <span>Peso ({weightUnit === 'LBS' ? 'lbs' : 'kg'})</span>
            {hasOneRM && exerciseId && (
              <span className="text-green-600" title="1RM disponibile">
                ✓
              </span>
            )}
            {!weightInputFocused && set.intensityPercent && hasOneRM && (
              <Calculator className="h-3 w-3 text-primary-600" aria-label="Calcolato da intensità" />
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={getWeightValue(set.weight, set.weightLbs, weightUnit)?.toString() || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleWeightChangeInput(e.target.value)
              }
              onFocus={() => setWeightInputFocused(true)}
              onBlur={() => setWeightInputFocused(false)}
              disabled={isDisabled}
              className={`w-full rounded border px-2 py-2 text-sm focus:ring-2 focus:outline-none ${
                isDisabled
                  ? 'cursor-not-allowed border-neutral-200/60 bg-neutral-100 text-neutral-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-600'
                  : !weightInputFocused && set.intensityPercent && hasOneRM
                    ? 'border-primary-300 bg-primary-50 text-primary-900'
                    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200 dark:border-white/[0.1]'
              }`}
              placeholder="Min"
              min="0"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              step="0.1"
              value={getWeightValue(set.weightMax, null, weightUnit)?.toString() || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                // Simple update for max weight, no complex logic for now
                onSetChange({ ...set, weightMax: val ?? null });
              }}
              disabled={isDisabled}
              className={`w-full rounded border px-2 py-2 text-sm focus:ring-2 focus:outline-none ${
                isDisabled
                  ? 'cursor-not-allowed border-neutral-200/60 bg-neutral-100 text-neutral-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-600'
                  : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200 dark:border-white/[0.1]'
              }`}
              placeholder="Max"
              min="0"
            />
          </div>
        </div>

        {/* Intensità % */}
        <div className="flex flex-col">
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <span>Intensità %</span>
            {hasOneRM && exerciseId && (
              <span className="text-green-600" title="1RM disponibile">
                ✓
              </span>
            )}
            {!intensityPercentInputFocused && set.weight && hasOneRM && (
              <Calculator className="h-3 w-3 text-primary-600" aria-label="Calcolato da peso" />
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={set.intensityPercent?.toString() || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleIntensityPercentChange(e.target.value)
              }
              onFocus={() => setIntensityInputFocused(true)}
              onBlur={() => setIntensityInputFocused(false)}
              disabled={isDisabled}
              className={`w-full rounded border px-2 py-2 text-sm focus:ring-2 focus:outline-none ${
                isDisabled
                  ? 'cursor-not-allowed border-neutral-200/60 bg-neutral-100 text-neutral-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-600'
                  : !intensityPercentInputFocused && set.weight && hasOneRM
                    ? 'border-primary-300 bg-primary-50 text-primary-900'
                    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200 dark:border-white/[0.1]'
              }`}
              placeholder="Min"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={set.intensityPercentMax?.toString() || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                onSetChange({ ...set, intensityPercentMax: val ?? null });
              }}
              disabled={isDisabled}
              className={`w-full rounded border px-2 py-2 text-sm focus:ring-2 focus:outline-none ${
                isDisabled
                  ? 'cursor-not-allowed border-neutral-200/60 bg-neutral-100 text-neutral-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-600'
                  : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200 dark:border-white/[0.1]'
              }`}
              placeholder="Max"
            />
          </div>
        </div>

        {/* RPE */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            RPE
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="10"
              value={rpeString}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRpeChange(e.target.value)}
              disabled={isDisabled}
              className={`w-full rounded border px-2 py-2 text-sm focus:ring-2 focus:outline-none ${
                isDisabled
                  ? 'cursor-not-allowed border-neutral-200/60 bg-neutral-100 text-neutral-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-600'
                  : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200 dark:border-white/[0.1]'
              }`}
              placeholder="Min"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              min="1"
              max="10"
              value={set.rpeMax?.toString() || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                onSetChange({ ...set, rpeMax: val && !isNaN(val) ? val : null });
              }}
              disabled={isDisabled}
              className={`w-full rounded border px-2 py-2 text-sm focus:ring-2 focus:outline-none ${
                isDisabled
                  ? 'cursor-not-allowed border-neutral-200/60 bg-neutral-100 text-neutral-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-600'
                  : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200 dark:border-white/[0.1]'
              }`}
              placeholder="Max"
            />
          </div>
        </div>

        {/* Rest */}
        <div className="flex flex-col">
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <Clock className="h-3 w-3 text-neutral-500 dark:text-neutral-500" />
            Rest (sec)
          </label>
          <input
            type="number"
            value={set.rest ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newSet = {
                ...set,
                rest: Number(e.target.value) || 60,
              };
              onSetChange(newSet);
            }}
            disabled={isDisabled}
            className={`w-full rounded border px-2 py-2 text-sm focus:ring-2 focus:outline-none ${
              isDisabled
                ? 'cursor-not-allowed border-neutral-200/60 bg-neutral-100 text-neutral-400 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-600'
                : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200 dark:border-white/[0.1]'
            }`}
            placeholder="60"
            min="0"
          />
        </div>
      </div>

      {/* 1RM Info */}
      {hasOneRM && oneRepMax && (
        <div className="mt-3 rounded bg-primary-50 p-2 text-xs text-primary-700">
          💡 1RM: {oneRepMax.toFixed(1)} {weightUnit === 'LBS' ? 'lbs' : 'kg'}
          {set.intensityPercent && !isNaN(parseFloat(set.intensityPercent.toString())) && (
            <span>
              {' • '}
              {set.intensityPercent}% ={' '}
              {((parseFloat(set.intensityPercent.toString()) / 100) * oneRepMax).toFixed(1)}{' '}
              {weightUnit === 'LBS' ? 'lbs' : 'kg'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
