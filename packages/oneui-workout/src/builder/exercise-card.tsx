'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Trash2,
  MoreVertical,
  GripVertical,
  ChevronDown,
  RefreshCw,
  Copy,
  Scissors,
} from 'lucide-react';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { cn } from '@giulio-leone/lib-design-system';
import { useCopilotContextReporter } from '@giulio-leone/one-agent';
import { SetGroupEditor } from '../editor/set-group-editor';
import { ExerciseSelector } from './exercise-selector';
import { useExerciseClipboard } from './workout-clipboard-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@giulio-leone/ui';
import type { Exercise, SetGroup } from '@giulio-leone/types/workout';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onUpdate: (exercise: Exercise) => void;
  onRemove: () => void;
  referenceOneRm?: number;
  /** Drag handle attributes (aria, role, tabIndex) */
  dragAttributes?: DraggableAttributes;
  /** Drag handle event listeners */
  dragListeners?: DraggableSyntheticListeners;
  isDragging?: boolean;
  weightUnit?: 'KG' | 'LBS';
}

const toDomainSetGroup = (group: Partial<SetGroup> & Pick<SetGroup, 'baseSet'>): SetGroup => {
  const sanitizeSet = (s: Partial<SetGroup['baseSet']>) => ({
    ...s,
    weight: s.weight ?? null,
    rest: s.rest ?? 90, // Default to 90s if missing
    intensityPercent: s.intensityPercent ?? null,
    rpe: s.rpe ?? null,
  });

  return {
    ...group,
    baseSet: sanitizeSet(group.baseSet),
    sets: group.sets?.map(sanitizeSet) || [],
  } as SetGroup;
};

export function ExerciseCard({
  exercise,
  index,
  onUpdate,
  onRemove,
  referenceOneRm,
  dragAttributes,
  dragListeners,
  isDragging,
  weightUnit = 'KG',
}: ExerciseCardProps) {
  const t = useTranslations('workouts.builder.exerciseCard');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const exerciseClipboard = useExerciseClipboard();

  // Report exercise selection to Copilot context
  const { reportSelection } = useCopilotContextReporter('workout');

  // Handle expand with context reporting
  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    // Report selection when expanding, clear when collapsing
    if (newExpanded) {
      reportSelection({
        type: 'exercise',
        data: {
          index,
          id: exercise.id,
          name: exercise.name,
          catalogExerciseId: exercise.catalogExerciseId,
        },
      });
    } else {
      reportSelection(null);
    }
  };

  const primaryGroup = exercise.setGroups?.[0];
  const summary: string[] = [];

  if (primaryGroup?.count) summary.push(`${primaryGroup.count}x`);
  if (primaryGroup?.baseSet?.reps) {
    const repRange =
      primaryGroup.baseSet.repsMax && primaryGroup.baseSet.repsMax > primaryGroup.baseSet.reps
        ? `${primaryGroup.baseSet.reps}-${primaryGroup.baseSet.repsMax}`
        : `${primaryGroup.baseSet.reps}`;
    summary.push(`${repRange} reps`);
  }
  if (primaryGroup?.baseSet?.weight) {
    const weightRange =
      primaryGroup.baseSet.weightMax && primaryGroup.baseSet.weightMax > primaryGroup.baseSet.weight
        ? `${primaryGroup.baseSet.weight}-${primaryGroup.baseSet.weightMax} kg`
        : `${primaryGroup.baseSet.weight} kg`;
    summary.push(weightRange);
  }
  if (primaryGroup?.baseSet?.intensityPercent) {
    let intensityText = `${primaryGroup.baseSet.intensityPercent}%`;
    if (referenceOneRm) {
      const calculatedWeight = Math.round(
        (referenceOneRm * primaryGroup.baseSet.intensityPercent) / 100
      );
      intensityText += ` (${calculatedWeight}kg)`;
    }
    summary.push(intensityText);
  }
  if (primaryGroup?.baseSet?.rpe) summary.push(`RPE ${primaryGroup.baseSet.rpe}`);
  if (primaryGroup?.baseSet?.rest) summary.push(`${primaryGroup.baseSet.rest}s rest`);

  const handleSetGroupsChange = (newSetGroups: SetGroup[]) => {
    onUpdate({ ...exercise, setGroups: newSetGroups });
  };

  /**
   * Swap exercise: preserves setGroups but updates exercise identity.
   * The new catalogExerciseId triggers weight recalculation via 1RM lookup.
   */
  const handleSwapExercise = (newExercise: Exercise) => {
    onUpdate({
      ...newExercise,
      // Preserve existing set groups configuration
      setGroups: exercise.setGroups,
    });
    setIsSelectorOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          'group/card relative mb-4 rounded-2xl border transition-all duration-300',
          isExpanded
            ? 'glass border-primary-500/30 shadow-primary-500/5 dark:glass-strong shadow-lg dark:border-white/10 dark:shadow-black/20'
            : 'hover:border-primary-500/30 dark:hover:glass border-neutral-200 bg-white hover:shadow-md dark:border-white/[0.06] dark:bg-neutral-900/40 dark:hover:border-white/20',
          isDragging &&
            'shadow-glow ring-primary-500/50 z-50 scale-[1.02] bg-white ring-2 backdrop-blur-xl dark:bg-neutral-900/95'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'relative flex items-center gap-4 px-4 py-4 transition-colors',
            !isExpanded && 'cursor-pointer'
          )}
          onClick={(e) => {
            // Toggle expand on row click if not targeting interactive elements
            if (!(e.target as HTMLElement).closest('button, [role="button"]')) {
              handleToggleExpand();
            }
          }}
        >
          {/* Drag Handle & Index */}
          <div className="flex items-center gap-3">
            <div
              {...dragAttributes}
              {...dragListeners}
              className="hover:text-primary-500 dark:hover:text-primary-400 flex h-8 w-6 cursor-grab touch-none items-center justify-center text-neutral-400 opacity-0 transition-all group-hover/card:opacity-100 active:cursor-grabbing dark:text-neutral-600"
            >
              <GripVertical size={16} />
            </div>

            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg font-mono text-sm font-bold tabular-nums transition-colors',
                isExpanded
                  ? 'bg-primary-50 text-primary-600 ring-primary-500/20 dark:bg-primary-500/20 dark:text-primary-400 shadow-sm ring-1 dark:shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                  : 'group-hover/card:bg-primary-50 group-hover/card:text-primary-600 dark:group-hover/card:bg-primary-500/10 dark:group-hover/card:text-primary-400 bg-neutral-100 text-neutral-500 dark:bg-neutral-800/50 dark:text-neutral-500'
              )}
            >
              {index + 1}
            </span>
          </div>

          {/* Main Info */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'truncate text-base font-semibold tracking-tight transition-colors sm:text-lg',
                  isExpanded
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-700 group-hover/card:text-neutral-900 dark:text-neutral-200 dark:group-hover/card:text-white'
                )}
              >
                {exercise.name}
              </span>

              {/* Primary Tag Pills - Premium */}
              {exercise.muscleGroups?.[0] && (
                <span className="from-primary-500/10 to-secondary-500/10 text-primary-600 ring-primary-500/20 dark:text-primary-300/80 hidden rounded-full bg-gradient-to-r px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase shadow-sm ring-1 sm:inline-flex">
                  {exercise.muscleGroups[0]}
                </span>
              )}
            </div>

            {/* Metadata Line */}
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              {summary.length > 0 ? (
                <span className="truncate">{summary.join(' · ')}</span>
              ) : (
                <span className="italic opacity-50">{t('noSets')}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/card:opacity-100 focus-within:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <ChevronDown
                size={16}
                className={cn('transition-transform duration-300', isExpanded && 'rotate-180')}
              />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/5 dark:hover:text-white"
                  aria-label="Options"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-neutral-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-neutral-950/95 dark:text-white dark:backdrop-blur-xl"
              >
                <DropdownMenuItem
                  onClick={() => setIsSelectorOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-md text-neutral-700 focus:bg-blue-50 focus:text-blue-700 dark:text-blue-400 dark:focus:bg-blue-500/10 dark:focus:text-blue-300"
                >
                  <RefreshCw size={16} />
                  <span>{t('swap')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exerciseClipboard.copy(exercise, exercise.id)}
                  className="flex cursor-pointer items-center gap-2 rounded-md text-neutral-700 focus:bg-neutral-100 focus:text-neutral-900 dark:text-neutral-300 dark:focus:bg-neutral-500/10 dark:focus:text-white"
                >
                  <Copy size={16} />
                  <span>{t('copy')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exerciseClipboard.cut(exercise, exercise.id)}
                  className="flex cursor-pointer items-center gap-2 rounded-md text-neutral-700 focus:bg-amber-50 focus:text-amber-700 dark:text-amber-400 dark:focus:bg-amber-500/10 dark:focus:text-amber-300"
                >
                  <Scissors size={16} />
                  <span>{t('cut')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onRemove}
                  className="flex cursor-pointer items-center gap-2 rounded-md text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-300"
                >
                  <Trash2 size={16} />
                  <span>{t('remove')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expanded Content */}
        <div
          className={cn(
            'transition-all duration-300 ease-out',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'
          )}
        >
          <div className="space-y-0 px-4 pt-2 pb-6">
            {exercise.setGroups?.map((group, groupIndex) => (
              <div key={group.id || `fallback-${exercise.id}-${groupIndex}`} className="py-2">
                <SetGroupEditor
                  group={group}
                  exerciseId={exercise.catalogExerciseId}
                  onGroupChange={(updatedGroup) => {
                    const newGroups = [...(exercise.setGroups || [])];
                    newGroups[groupIndex] = toDomainSetGroup(updatedGroup);
                    handleSetGroupsChange(newGroups);
                  }}
                  onGroupDelete={() => {
                    const newGroups = [...(exercise.setGroups || [])];
                    newGroups.splice(groupIndex, 1);
                    handleSetGroupsChange(newGroups);
                  }}
                  onGroupDuplicate={() => {
                    const newGroups = [...(exercise.setGroups || [])];
                    const duplicate: SetGroup = {
                      ...group,
                      id: `sg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    };
                    newGroups.splice(groupIndex + 1, 0, duplicate);
                    handleSetGroupsChange(newGroups);
                  }}
                  oneRepMax={referenceOneRm}
                  weightUnit={weightUnit}
                />
              </div>
            ))}

            <div className="pt-2">
              <button
                onClick={() => {
                  const newGroup: SetGroup = {
                    id: `sg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    count: 3,
                    baseSet: {
                      reps: 10,
                      weight: 0,
                      weightLbs: 0,
                      rest: 60,
                      intensityPercent: 0,
                      rpe: 8,
                    },
                    sets: [],
                  };
                  handleSetGroupsChange([...(exercise.setGroups || []), newGroup]);
                }}
                className={cn(
                  'group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed py-4 transition-all',
                  'hover:border-primary-300 hover:text-primary-600 border-neutral-200 bg-neutral-50/50 text-neutral-500',
                  'dark:hover:border-primary-500/30 dark:hover:text-primary-400 dark:border-neutral-800 dark:bg-transparent dark:text-neutral-500'
                )}
                type="button"
              >
                <div className="from-primary-500/0 via-primary-500/5 to-primary-500/0 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="z-10 text-sm font-medium">{t('addSetGroup')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Swap Selector */}
      <ExerciseSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleSwapExercise}
      />
    </>
  );
}
