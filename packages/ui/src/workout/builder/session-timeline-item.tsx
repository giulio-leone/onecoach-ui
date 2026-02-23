/**
 * Session Timeline Item Component
 *
 * Individual timeline item for workout session display.
 * Extracted for SOLID compliance (Single Responsibility).
 *
 * @module features/workouts/components/builder/session-timeline-item
 */

'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Pen } from 'lucide-react';
import type { ExerciseOccurrence, ProgressionType } from '@giulio-leone/lib-workout';
import type { SetGroup } from '@giulio-leone/types/workout';

// =====================================================
// Types
// =====================================================

interface SessionTimelineItemProps {
  occurrence: ExerciseOccurrence;
  index: number;
  isSelected: boolean;
  isOverridden: boolean;
  showRanges: boolean;
  progressionType: ProgressionType;
  onToggleSelect: (index: number) => void;
  onEdit: (index: number) => void;
}

// =====================================================
// Component
// =====================================================

export function SessionTimelineItem({
  occurrence,
  index,
  isSelected,
  isOverridden,
  showRanges,
  progressionType,
  onToggleSelect,
  onEdit,
}: SessionTimelineItemProps) {
  const setGroup = occurrence.exercise.setGroups[0];
  const baseSet = setGroup?.baseSet;

  // Generate display summary
  const displaySummary: string[] = [];
  if (baseSet?.weight) displaySummary.push(`${baseSet.weight}kg`);
  if (baseSet?.reps) displaySummary.push(`${baseSet.reps}reps`);
  if (baseSet?.rpe) displaySummary.push(`RPE${baseSet.rpe}`);

  // Dynamic value based on progression type
  const dynamicValue = getDynamicDisplayValue(baseSet, progressionType);

  return (
    <motion.div
      key={`${occurrence.weekIndex}-${occurrence.dayIndex}-${occurrence.exerciseIndex}`}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${getCardClassName(
        isSelected,
        isOverridden
      )}`}
      onClick={() => onToggleSelect(index)}
    >
      {/* Edit Button */}
      <button
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          e.stopPropagation();
          onEdit(index);
        }}
        className="absolute top-2 right-2 p-2 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-blue-600"
        aria-label="Modifica sessione"
      >
        <Pen size={16} />
      </button>

      {/* Selection Checkbox */}
      <SelectionIndicator isSelected={isSelected} />

      {/* Week Badge */}
      <WeekBadge weekNumber={occurrence.weekNumber} />

      {/* Session Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-900 dark:text-white">{occurrence.dayName}</span>
          <span className="text-xs text-neutral-400">Giorno {occurrence.dayNumber}</span>
          {isOverridden && <OverrideBadge />}
        </div>

        {/* Set Summary */}
        {setGroup && <SetSummary setGroup={setGroup} showRanges={showRanges} />}
      </div>

      {/* Value Display */}
      <div className="flex items-center justify-center">
        <ArrowRight size={16} className="text-neutral-300 dark:text-neutral-600" />
        <DynamicValueBadge value={dynamicValue} isSelected={isSelected} />
      </div>
    </motion.div>
  );
}

// =====================================================
// Sub-components (DRY)
// =====================================================

function SelectionIndicator({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-neutral-300 bg-transparent text-transparent dark:border-neutral-600'
      }`}
    >
      <CheckCircle2 size={14} />
    </div>
  );
}

function WeekBadge({ weekNumber }: { weekNumber: number }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 font-mono text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
      W{weekNumber}
    </div>
  );
}

function OverrideBadge() {
  return (
    <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
      MODIFICATO
    </span>
  );
}

interface SetSummaryProps {
  setGroup: SetGroup;
  showRanges: boolean;
}

function SetSummary({ setGroup, showRanges }: SetSummaryProps) {
  if (!setGroup) return null;
  const { baseSet } = setGroup;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600 dark:text-neutral-300">
      {/* Sets x Reps */}
      <div className="flex items-center gap-1">
        <span className="font-bold">{setGroup.count}</span>
        <span className="text-xs text-neutral-400">x</span>
        <span className="font-bold">
          {baseSet.reps}
          {showRanges && baseSet.repsMax && `-${baseSet.repsMax}`}
        </span>
      </div>

      <Divider />

      {/* Weight/Intensity */}
      {(baseSet.weight || baseSet.intensityPercent) && (
        <div className="font-medium">
          {baseSet.weight && `${baseSet.weight}kg`}
          {showRanges && baseSet.weightMax && `-${baseSet.weightMax}kg`}
          {baseSet.intensityPercent && (
            <span className="ml-1.5 text-xs text-neutral-400">({baseSet.intensityPercent}%)</span>
          )}
        </div>
      )}

      {/* RPE */}
      {baseSet.rpe && (
        <>
          <Divider />
          <div className="text-xs">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">RPE</span>{' '}
            {baseSet.rpe}
          </div>
        </>
      )}

      {/* Rest */}
      {baseSet.rest && (
        <>
          <Divider />
          <div className="text-xs text-neutral-400">{baseSet.rest}s</div>
        </>
      )}
    </div>
  );
}

function Divider() {
  return <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700" />;
}

interface DynamicValueBadgeProps {
  value: string;
  isSelected: boolean;
}

function DynamicValueBadge({ value, isSelected }: DynamicValueBadgeProps) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className={`hidden min-w-[80px] rounded-lg px-3 py-1.5 text-center font-mono font-bold transition-colors sm:block ${
        isSelected
          ? 'bg-white text-blue-600 shadow-sm dark:bg-neutral-800 dark:text-blue-400'
          : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
      }`}
    >
      {value}
    </motion.div>
  );
}

// =====================================================
// Utilities
// =====================================================

function getCardClassName(isSelected: boolean, isOverridden: boolean): string {
  if (!isSelected) {
    return 'border-neutral-200 bg-white opacity-60 hover:opacity-100 dark:border-neutral-800 dark:bg-neutral-900';
  }

  if (isOverridden) {
    return 'border-purple-200 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-900/10';
  }

  return 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10';
}

function getDynamicDisplayValue(
  baseSet:
    | {
        weight?: number | null;
        intensityPercent?: number | null;
        rpe?: number | null;
        reps?: number;
      }
    | undefined,
  type: ProgressionType
): string {
  if (!baseSet) return '-';

  switch (type) {
    case 'linear_weight':
      return `${baseSet.weight}kg`;
    case 'percentage':
      return `${baseSet.intensityPercent}%`;
    case 'rpe':
      return `RPE ${baseSet.rpe}`;
    default:
      return `${baseSet.reps} reps`;
  }
}

export default SessionTimelineItem;
