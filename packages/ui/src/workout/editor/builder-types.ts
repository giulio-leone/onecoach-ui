import type { SetGroup as TypesSetGroup } from '@giulio-leone/types';

/** Type-safe adapter: BuilderSetGroup → TypesSetGroup for utility functions */
export function toTypesSetGroup(group: BuilderSetGroup): TypesSetGroup {
  return group as unknown as TypesSetGroup;
}

export type BuilderSetType = 'straight' | 'drop_set' | 'rest_pause' | 'amrap' | 'timed' | 'warmup';

export interface BuilderTempo {
  eccentric: number;
  pause1: number;
  concentric: number;
  pause2: number;
}

export interface BuilderExerciseSet {
  id?: string;
  setNumber?: number;
  setType?: BuilderSetType;
  reps?: number;
  repsMax?: number;
  weight?: number | null;
  weightLbs?: number | null;
  weightMax?: number | null;
  intensityPercent?: number | null;
  intensityPercentMax?: number | null;
  rpe?: number | null;
  rpeMax?: number | null;
  rir?: number | null;
  rirMax?: number | null;
  tempo?: BuilderTempo | null;
  rest?: number | null;
  duration?: number;
  notes?: string | null;
  isWarmup?: boolean;
}

export interface BuilderSetProgression {
  type: 'linear' | 'percentage' | 'rpe';
  steps: {
    fromSet: number;
    toSet: number;
    adjustment: number;
  }[];
}

export interface BuilderSetGroup {
  id: string;
  exerciseId?: string;
  exerciseName?: string;
  count: number;
  order?: number;
  sets: BuilderExerciseSet[];
  baseSet: BuilderExerciseSet;
  progression?: BuilderSetProgression;
  notes?: string;
  technicalCues?: string[];
}
