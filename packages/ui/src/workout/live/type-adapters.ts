/**
 * Type adapters for live workout components.
 *
 * Schema Exercise (from @giulio-leone/schemas) and Types Exercise
 * (from @giulio-leone/types) are structurally compatible but differently typed.
 * These adapters centralise the single cast so every call-site stays type-safe.
 */
import type { Exercise as TypesExercise } from '@giulio-leone/types';
import type { Exercise as SchemaExercise } from '@giulio-leone/schemas';
import type { WorkoutSession } from '@giulio-leone/types/workout';

/** Adapt a single schema exercise to the types exercise expected by one-workout utils */
export function toTypesExercise(exercise: SchemaExercise): TypesExercise {
  return exercise as unknown as TypesExercise;
}

/** Adapt an array of schema exercises */
export function toTypesExercises(exercises: SchemaExercise[]): TypesExercise[] {
  return exercises as unknown as TypesExercise[];
}

/** Extract exercises from a WorkoutSession as schema Exercise[] */
export function sessionExercises(session: WorkoutSession): SchemaExercise[] {
  return (session.exercises as unknown as SchemaExercise[]) || [];
}
