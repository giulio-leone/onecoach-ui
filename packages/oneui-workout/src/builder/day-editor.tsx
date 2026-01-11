'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { Dumbbell, ClipboardPaste, MoreVertical } from 'lucide-react';
import { DayEditorShell } from '@onecoach/ui/visual-builder';
import { SortableExerciseCard } from './sortable-exercise-card';
import { ExerciseSelector } from './exercise-selector';
import { useExerciseClipboard, cloneExerciseWithNewIds } from './workout-clipboard-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { WorkoutDay, Exercise } from '@onecoach/types-workout';

interface DayEditorProps {
  day: WorkoutDay;
  onUpdate: (day: WorkoutDay) => void;
  referenceMaxes?: Record<string, number>;
}

export function DayEditor({ day, onUpdate, referenceMaxes = {} }: DayEditorProps) {
  const t = useTranslations('workouts.builder.dayEditor');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const exerciseClipboard = useExerciseClipboard();
  const exerciseCount = day.exercises?.length || 0;
  const totalDuration = day.totalDuration || 0;

  const handlePasteExercise = () => {
    const pastedExercise = exerciseClipboard.paste();
    if (!pastedExercise) return;

    const newExercise = cloneExerciseWithNewIds(pastedExercise);
    const newExercises = [...(day.exercises || []), newExercise];
    onUpdate({ ...day, exercises: newExercises });
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newExercises = [...(day.exercises || []), exercise];
    onUpdate({ ...day, exercises: newExercises });
    setIsSelectorOpen(false);
  };

  const handleUpdateExercise = (index: number, updatedExercise: Exercise) => {
    const newExercises = [...(day.exercises || [])];
    newExercises[index] = updatedExercise;
    onUpdate({ ...day, exercises: newExercises });
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = [...(day.exercises || [])];
    newExercises.splice(index, 1);
    onUpdate({ ...day, exercises: newExercises });
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && day.exercises) {
      const oldIndex = day.exercises.findIndex(
        (e: Exercise, idx: number) => (e.id || `exercise-${idx}`) === active.id
      );
      const newIndex = day.exercises.findIndex(
        (e: Exercise, idx: number) => (e.id || `exercise-${idx}`) === over?.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        onUpdate({
          ...day,
          exercises: arrayMove(day.exercises, oldIndex, newIndex),
        });
      }
    }
  }

  return (
    <>
      <DayEditorShell
        title={day.name}
        itemCount={exerciseCount}
        itemLabel={t('exercises')}
        additionalStats={`${totalDuration} ${t('estimatedMin')}`}
        emptyIcon={<Dumbbell size={24} />}
        emptyMessage={t('noExercises')}
        emptySubMessage={t('tapToAdd')}
        addButtonLabel={t('addExercise')}
        onAdd={() => setIsSelectorOpen(true)}
        onDragEnd={handleDragEnd}
        themeColor="primary"
        headerActions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white">
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-neutral-200 bg-white text-neutral-900 shadow-xl dark:border-white/10 dark:bg-neutral-950/95 dark:text-white dark:backdrop-blur-xl"
            >
              {exerciseClipboard.hasItem() ? (
                <DropdownMenuItem
                  onClick={handlePasteExercise}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <ClipboardPaste size={16} />
                  <span>{t('pasteExercise')}</span>
                </DropdownMenuItem>
              ) : (
                <div className="px-3 py-2 text-xs text-neutral-500">{t('noActions')}</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      >
        {() => (
          <SortableContext
            items={day.exercises?.map((e, idx) => e.id || `exercise-${idx}`) || []}
            strategy={verticalListSortingStrategy}
          >
            {day.exercises?.map((exercise, index) => (
              <SortableExerciseCard
                key={exercise.id || `exercise-${index}`}
                exercise={exercise}
                index={index}
                onUpdate={(updated: Exercise) => handleUpdateExercise(index, updated)}
                onRemove={() => handleRemoveExercise(index)}
                referenceOneRm={
                  exercise.catalogExerciseId
                    ? referenceMaxes[exercise.catalogExerciseId]
                    : undefined
                }
              />
            ))}
          </SortableContext>
        )}
      </DayEditorShell>

      <ExerciseSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleAddExercise}
      />
    </>
  );
}
