import { ActivityLevel, DifficultyLevel, Sex, WorkoutGoal } from '@onecoach/types/client';

export type SplitType =
  | 'full_body'
  | 'upper_lower'
  | 'push_pull_legs'
  | 'body_part_split'
  | 'custom';
export type TierAI = 'balanced' | 'fast' | 'accurate';

export const SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
  { value: 'full_body', label: 'Full Body' },
  { value: 'upper_lower', label: 'Upper / Lower' },
  { value: 'push_pull_legs', label: 'Push / Pull / Legs' },
  { value: 'body_part_split', label: 'Body Part Split' },
  { value: 'custom', label: 'Personalizzato' },
];

export const TIER_OPTIONS: { value: TierAI; label: string }[] = [
  { value: 'balanced', label: 'Bilanciato' },
  { value: 'fast', label: 'Veloce' },
  { value: 'accurate', label: 'Accurato' },
];

export const GOAL_LABELS: Record<WorkoutGoal, string> = {
  [WorkoutGoal.STRENGTH]: 'Forza',
  [WorkoutGoal.HYPERTROPHY]: 'Ipertrofia',
  [WorkoutGoal.ENDURANCE]: 'Endurance',
  [WorkoutGoal.MOBILITY]: 'Mobilità',
  [WorkoutGoal.GENERAL_FITNESS]: 'Fitness Generale',
};

export const EXPERIENCE_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.BEGINNER]: 'Beginner',
  [DifficultyLevel.INTERMEDIATE]: 'Intermediate',
  [DifficultyLevel.ADVANCED]: 'Advanced',
};

export const FITNESS_LABELS: Record<ActivityLevel, string> = {
  [ActivityLevel.SEDENTARY]: 'Sedentario',
  [ActivityLevel.LIGHT]: 'Leggero',
  [ActivityLevel.MODERATE]: 'Moderato',
  [ActivityLevel.ACTIVE]: 'Attivo',
  [ActivityLevel.VERY_ACTIVE]: 'Molto attivo',
};

export const GENDER_OPTIONS = [
  { value: Sex.MALE, label: 'Maschile' },
  { value: Sex.FEMALE, label: 'Femminile' },
  { value: Sex.OTHER, label: 'Altro' },
];
