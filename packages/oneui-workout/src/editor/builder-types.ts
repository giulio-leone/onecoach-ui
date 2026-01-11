export interface BuilderExerciseSet {
  id?: string;
  setNumber?: number;
  reps?: number | null;
  repsMax?: number | null;
  weight?: number | null; // Nullable for builder UI
  weightLbs?: number | null;
  weightMax?: number | null;
  intensityPercent?: number | null;
  intensityPercentMax?: number | null;
  rpe?: number | null;
  rpeMax?: number | null;
  rest?: number | null; // seconds
  duration?: number | null;
  notes?: string | null;
  tempo?: string | null;
  // Additional fields for compatibility
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
  id?: string;
  exerciseId?: string;
  exerciseName?: string;
  count: number;
  order: number;
  sets: BuilderExerciseSet[];
  baseSet: BuilderExerciseSet;
  progression?: BuilderSetProgression;
  notes?: string;
  technicalCues?: string[];
}
