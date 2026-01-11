import { ActivityLevel, DifficultyLevel, Sex, WorkoutGoal } from '@onecoach/types/client';
import type { WorkoutGenerationInput } from '@onecoach/schemas';

export function csvFromArray(values?: string[]): string {
  return (values || []).join(', ');
}

export function arrayFromCsv(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function mapActivityLevel(input?: string | ActivityLevel): ActivityLevel | undefined {
  const v = (input || '').toString().toUpperCase();
  if (v === 'SEDENTARY' || v === 'SEDENTARIO') return ActivityLevel.SEDENTARY;
  if (v === 'LIGHT' || v === 'LEGGERO') return ActivityLevel.LIGHT;
  if (v === 'MODERATE' || v === 'MODERATO') return ActivityLevel.MODERATE;
  if (v === 'ACTIVE' || v === 'ATTIVO') return ActivityLevel.ACTIVE;
  if (v === 'VERY_ACTIVE' || v === 'VERY ACTIVE' || v === 'MOLTO ATTIVO')
    return ActivityLevel.VERY_ACTIVE;
  return undefined;
}

export function mapGender(input?: string | Sex): Sex {
  const v = (input || '').toString().toUpperCase();
  if (['M', 'MALE', 'MASCHILE'].includes(v)) return Sex.MALE;
  if (['F', 'FEMALE', 'FEMMINILE'].includes(v)) return Sex.FEMALE;
  return Sex.OTHER;
}

export function mapActivityToExperience(input?: string | ActivityLevel): DifficultyLevel {
  const v = (input || '').toString().toUpperCase();
  if (v === 'SEDENTARY' || v === 'SEDENTARIO') return DifficultyLevel.BEGINNER;
  if (v === 'LIGHT' || v === 'LEGGERO') return DifficultyLevel.BEGINNER;
  if (v === 'MODERATE' || v === 'MODERATO') return DifficultyLevel.INTERMEDIATE;
  if (v === 'ACTIVE' || v === 'ATTIVO') return DifficultyLevel.ADVANCED;
  if (v === 'VERY_ACTIVE' || v === 'VERY ACTIVE' || v === 'MOLTO ATTIVO')
    return DifficultyLevel.ADVANCED;
  return DifficultyLevel.INTERMEDIATE;
}

export function mapGoalToAgentValue(goal: WorkoutGoal): WorkoutGenerationInput['goals']['primary'] {
  switch (goal) {
    case WorkoutGoal.STRENGTH:
      return 'strength';
    case WorkoutGoal.HYPERTROPHY:
      return 'hypertrophy';
    case WorkoutGoal.ENDURANCE:
      return 'endurance';
    case WorkoutGoal.MOBILITY:
      return 'general_fitness'; // 'athletic_performance' not supported
    case WorkoutGoal.GENERAL_FITNESS:
    default:
      return 'general_fitness';
  }
}
