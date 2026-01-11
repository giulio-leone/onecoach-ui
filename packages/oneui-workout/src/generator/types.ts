import { ActivityLevel, DifficultyLevel, Sex, WorkoutGoal } from '@onecoach/types/client';
import type { SplitType, TierAI } from './constants';
export type { SplitType, TierAI };
import type { StreamEvent as UIStreamEvent } from '@onecoach/ui';
import type { WorkoutGenerationInput as DomainWorkoutGenerationInput, WorkoutGenerationOutput as DomainWorkoutGenerationOutput } from "@onecoach/types-ai";

export interface UserProfileState {
  weight?: number;
  height?: number;
  age?: number;
  gender: Sex;
  experienceLevel: DifficultyLevel;
  fitnessLevel?: ActivityLevel;
}

/**
 * Profile data structure from API
 */
export interface ApiProfileData {
  weightKg?: number;
  heightCm?: number;
  age?: number;
  sex?: string;
  activityLevel?: string;
  trainingFrequency?: number;
  sessionDurationMinutes?: number;
  equipment?: string[];
  healthNotes?: string;
  data?: ApiProfileData;
  profile?: ApiProfileData;
}

export interface WorkoutGoalsState {
  primaryGoal: WorkoutGoal;
  daysPerWeek: number;
  durationWeeks: number;
  sessionDurationMinutes: number;
  splitType: SplitType;
}

export interface ConstraintsState {
  availableEquipment: string[];
  injuriesLimitations: string[];
  preferredExercises: string[];
  excludedExercises: string[];
}

export interface WorkoutFormData {
  userProfile: UserProfileState;
  goals: WorkoutGoalsState;
  constraints: ConstraintsState;
  tierAI: TierAI;
  additionalNotes: string;
}

export type StreamEvent = UIStreamEvent;
export type WorkoutGenerationInput = DomainWorkoutGenerationInput;
export type WorkoutGenerationOutput = DomainWorkoutGenerationOutput;

// Explicitly define the hook type instead of dynamic import
export type UseWorkoutGenerationHook = (params?: {
  onSuccess?: (programId: string) => void;
  onError?: (error: Error) => void;
}) => {
  generate: (input: WorkoutGenerationInput) => Promise<string | null>;
  isGenerating: boolean;
  progress: StreamEvent | null;
  error: Error | null;
  reset: () => void;
};
