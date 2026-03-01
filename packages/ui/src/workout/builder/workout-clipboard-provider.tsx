'use client';

import { createClipboardContext } from '@giulio-leone/ui';
import type { Exercise } from '@giulio-leone/types/workout';

const {
  Provider: ExerciseClipboardProvider,
  useClipboard: useExerciseClipboard,
  Context: ExerciseClipboardContext,
} = createClipboardContext<Exercise>();

export { ExerciseClipboardProvider, useExerciseClipboard, ExerciseClipboardContext };

// Helper for deep cloning exercises with new IDs (used in drag-and-drop/duplication)
export const cloneExerciseWithNewIds = (exercise: Exercise): Exercise => {
  const newSetGroups =
    exercise.setGroups?.map((sg) => ({
      ...sg,
      id: Math.random().toString(36).substring(2, 11),
      sets: sg.sets?.map((s) => ({ ...s })) || [],
    })) || [];

  return {
    ...exercise,
    id: Math.random().toString(36).substring(2, 11),
    setGroups: newSetGroups,
  };
};
