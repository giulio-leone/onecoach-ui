/**
 * Set Group Editor Component
 *
 * Componente per creare e modificare gruppi di serie con progressione opzionale
 */

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Copy, Trash2, Pen, X, Plus } from 'lucide-react';
import {
  generateSetsFromGroup,
  calculateGroupSummary,
  isUniformGroup,
} from '@giulio-leone/one-workout/utils/progression-calculator';
import type { SetGroup as TypesSetGroup } from '@giulio-leone/types';
import { SetEditor } from './set-editor';
import type {
  BuilderSetGroup as SetGroup,
  BuilderSetProgression as SetProgression,
  BuilderExerciseSet as ExerciseSet,
} from './builder-types';

interface SetGroupEditorProps {
  group: SetGroup;
  exerciseId?: string;
  onGroupChange: (group: SetGroup) => void;
  onGroupDelete?: () => void;
  onGroupDuplicate?: () => void;
  onGroupSplit?: () => void; // Separa il gruppo in serie individuali
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  editMode?: 'individual' | 'block'; // Modifica singola vs blocco
  onEditModeChange?: (mode: 'individual' | 'block') => void;
  oneRepMax?: number | null;
  weightUnit?: 'KG' | 'LBS';
}

export function SetGroupEditor({
  group,
  exerciseId,
  onGroupChange,
  onGroupDelete,
  onGroupDuplicate,
  onGroupSplit,
  isExpanded: controlledExpanded,
  onToggleExpand,
  editMode: controlledEditMode,
  onEditModeChange,
  oneRepMax,
  weightUnit = 'KG',
}: SetGroupEditorProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [internalEditMode, setInternalEditMode] = useState<'individual' | 'block'>('block');
  const [isEditing, setIsEditing] = useState(false);
  const lastGeneratedRef = useRef<string>('');

  // Local state for series count input - syncs with prop for undo/redo reactivity
  const [countInputValue, setCountInputValue] = useState<string>(String(group.count));

  // Sync local input when prop changes (e.g., from undo/redo)
  useEffect(() => {
    setCountInputValue(String(group.count));
  }, [group.count]);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const editMode = controlledEditMode !== undefined ? controlledEditMode : internalEditMode;

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const handleEditModeChange = (mode: 'individual' | 'block') => {
    if (onEditModeChange) {
      onEditModeChange(mode);
    } else {
      setInternalEditMode(mode);
    }
  };

  // Genera serie se mancanti - usa useMemo solo per calcolare, useEffect per aggiornare
  const displaySets = useMemo<ExerciseSet[]>(() => {
    if (group.sets.length === 0 || group.sets.length !== group.count) {
      return generateSetsFromGroup(group as unknown as TypesSetGroup);
    }
    return group.sets;
  }, [group]);

  // Aggiorna il gruppo quando le serie devono essere rigenerate (dopo il rendering)
  useEffect(() => {
    // Solo se le serie sono mancanti o non corrispondono al count
    if (group.sets.length === 0 || group.sets.length !== group.count) {
      const newSets = generateSetsFromGroup(group as unknown as TypesSetGroup);
      // Crea una chiave univoca per lo stato del gruppo
      const groupKey = `${group.count}-${JSON.stringify(group.baseSet)}-${JSON.stringify(group.progression)}`;

      // Evita chiamate multiple se abbiamo già generato per questa configurazione
      if (lastGeneratedRef.current !== groupKey) {
        lastGeneratedRef.current = groupKey;
        onGroupChange({ ...group, sets: newSets });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.count, group.baseSet, group.progression, group.sets.length]);

  const handleBaseSetChange = (updatedSet: ExerciseSet) => {
    const newGroup: SetGroup = {
      ...group,
      baseSet: updatedSet,
    };
    // Rigenera tutte le serie dal nuovo baseSet
    const newSets = generateSetsFromGroup(newGroup as unknown as TypesSetGroup);
    newGroup.sets = newSets;
    onGroupChange(newGroup);
  };

  const handleSetChange = (setIndex: number, updatedSet: ExerciseSet) => {
    if (editMode === 'block') {
      // Modifica blocco: aggiorna baseSet e rigenera tutte le serie
      const newBaseSet = { ...updatedSet };
      const newGroup: SetGroup = {
        ...group,
        baseSet: newBaseSet,
      };
      const newSets = generateSetsFromGroup(newGroup as unknown as TypesSetGroup);
      newGroup.sets = newSets;
      onGroupChange(newGroup);
    } else {
      // Modifica individuale: aggiorna solo quella serie
      const newSets = [...displaySets];
      newSets[setIndex] = updatedSet;
      onGroupChange({
        ...group,
        sets: newSets,
      });
    }
  };

  const handleCountChange = (value: string) => {
    // Allow empty input for editing
    if (value === '') return;
    const newCount = parseInt(value, 10);
    // Guard against NaN and invalid values
    if (Number.isNaN(newCount) || newCount < 1) return;
    const newGroup: SetGroup = {
      ...group,
      count: newCount,
    };
    const newSets = generateSetsFromGroup(newGroup as unknown as TypesSetGroup);
    newGroup.sets = newSets;
    onGroupChange(newGroup);
  };

  const handleAddProgression = () => {
    const newProgression: SetProgression = {
      type: 'linear',
      steps: [
        {
          fromSet: 1,
          toSet: group.count,
          adjustment: 0,
        },
      ],
    };
    const newGroup: SetGroup = {
      ...group,
      progression: newProgression,
    };
    const newSets = generateSetsFromGroup(newGroup as unknown as TypesSetGroup);
    newGroup.sets = newSets;
    onGroupChange(newGroup);
    setIsEditing(true);
  };

  const handleRemoveProgression = () => {
    const newGroup: SetGroup = {
      ...group,
      progression: undefined,
    };
    const newSets = generateSetsFromGroup(newGroup as unknown as TypesSetGroup);
    newGroup.sets = newSets;
    onGroupChange(newGroup);
  };

  const handleProgressionChange = (progression: SetProgression) => {
    const newGroup: SetGroup = {
      ...group,
      progression,
    };
    const newSets = generateSetsFromGroup(newGroup as unknown as TypesSetGroup);
    newGroup.sets = newSets;
    onGroupChange(newGroup);
  };

  const summary = calculateGroupSummary(group as unknown as TypesSetGroup);
  const isUniform = isUniformGroup(group as unknown as TypesSetGroup);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      {/* Header compatta */}
      <div className="flex items-center justify-between p-3">
        <div className="flex flex-1 items-center gap-2">
          <button
            onClick={toggleExpand}
            className="flex flex-1 items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-neutral-50 dark:bg-neutral-800/50"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-neutral-500 dark:text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500 dark:text-neutral-500" />
            )}
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {Number.isNaN(group.count) ? 0 : group.count}x {summary}
            </span>
            {!isUniform && group.progression && (
              <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-700">
                Progressione {group.progression.type}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded p-1.5 transition-colors hover:bg-neutral-100 dark:bg-neutral-800"
            title="Modifica gruppo"
          >
            <Pen className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </button>
          {onGroupDuplicate && (
            <button
              onClick={onGroupDuplicate}
              className="rounded p-1.5 transition-colors hover:bg-neutral-100 dark:bg-neutral-800"
              title="Duplica gruppo"
            >
              <Copy className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          )}
          {onGroupSplit && (
            <button
              onClick={onGroupSplit}
              className="rounded p-1.5 transition-colors hover:bg-neutral-100 dark:bg-neutral-800"
              title="Separa in serie individuali"
            >
              <X className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          )}
          {onGroupDelete && (
            <button
              onClick={onGroupDelete}
              className="rounded p-1.5 transition-colors hover:bg-red-100"
              title="Elimina gruppo"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Contenuto espanso */}
      {isExpanded && (
        <div className="space-y-4 border-t border-neutral-200 p-4 dark:border-neutral-700">
          {/* Modalità modifica */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-600 dark:text-neutral-400">Modifica:</span>
            <button
              onClick={() => handleEditModeChange('block')}
              className={`rounded px-3 py-1 transition-colors ${
                editMode === 'block'
                  ? 'bg-primary-100 font-medium text-primary-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              Blocco
            </button>
            <button
              onClick={() => handleEditModeChange('individual')}
              className={`rounded px-3 py-1 transition-colors ${
                editMode === 'individual'
                  ? 'bg-primary-100 font-medium text-primary-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              Singole
            </button>
          </div>

          {/* Editor parametri base */}
          {editMode === 'block' && (
            <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
              <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Parametri base (applicati a tutte le serie)
              </label>
              <div className="mb-2 flex items-center gap-2">
                <label className="text-xs text-neutral-600 dark:text-neutral-400">
                  Numero serie:
                </label>
                <input
                  type="number"
                  min="1"
                  value={countInputValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCountInputValue(e.target.value)
                  }
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleCountChange(e.target.value)
                  }
                  className="w-20 rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600"
                />
              </div>
              <SetEditor
                setIndex={0}
                set={group.baseSet}
                exerciseId={exerciseId}
                onSetChange={handleBaseSetChange}
                oneRepMax={oneRepMax}
                weightUnit={weightUnit}
              />
            </div>
          )}

          {/* Progressione */}
          {!group.progression ? (
            <button
              onClick={handleAddProgression}
              className="flex items-center gap-2 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-3 w-3" />
              Aggiungi progressione
            </button>
          ) : (
            <div className="space-y-2 rounded-lg bg-primary-50 p-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-primary-700">Progressione</label>
                <button
                  onClick={handleRemoveProgression}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Rimuovi
                </button>
              </div>
              <div className="space-y-2">
                <select
                  value={group.progression.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleProgressionChange({
                      ...group.progression!,
                      type: e.target.value as 'linear' | 'percentage' | 'rpe',
                    })
                  }
                  className="w-full rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600"
                >
                  <option value="linear">Lineare (kg/peso)</option>
                  <option value="percentage">Percentuale 1RM</option>
                  <option value="rpe">RPE</option>
                </select>
                {group.progression.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Serie {step.fromSet}-{step.toSet}:
                    </span>
                    <input
                      type="number"
                      value={step.adjustment}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newSteps = [...group.progression!.steps];
                        newSteps[idx] = { ...step, adjustment: parseFloat(e.target.value) || 0 };
                        handleProgressionChange({
                          ...group.progression!,
                          steps: newSteps,
                        });
                      }}
                      className="w-24 rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600"
                      placeholder="Aggiustamento"
                    />
                    <span className="text-neutral-500 dark:text-neutral-500">
                      {group.progression!.type === 'linear'
                        ? 'kg'
                        : group.progression!.type === 'percentage'
                          ? '%'
                          : 'punti'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista serie (solo in modalità individuale o quando espanso) */}
          {(editMode === 'individual' || isExpanded) && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Serie ({displaySets.length})
              </label>
              {displaySets.map((set, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-neutral-200 p-2 dark:border-neutral-700"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Serie {idx + 1}/{displaySets.length}
                    </span>
                    {!isUniform && (
                      <span className="text-xs text-primary-600">(Progressione applicata)</span>
                    )}
                  </div>
                  <SetEditor
                    setIndex={idx}
                    set={set}
                    exerciseId={exerciseId}
                    onSetChange={(updatedSet) => handleSetChange(idx, updatedSet)}
                    className="border-0 bg-transparent p-0 shadow-none"
                    oneRepMax={oneRepMax}
                    weightUnit={weightUnit}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
