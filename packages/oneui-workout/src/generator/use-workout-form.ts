import { useState, useEffect, useCallback } from 'react';
import { ActivityLevel, DifficultyLevel, Sex, WorkoutGoal } from '@onecoach/types/client';
import type { WorkoutGenerationInput } from '@onecoach/schemas';
import type { WorkoutFormData, ApiProfileData } from './types';
import { mapActivityLevel, mapActivityToExperience, mapGender, mapGoalToAgentValue } from './utils';

import { logger } from '@onecoach/lib-shared';
const DEFAULT_FORM_DATA: WorkoutFormData = {
  userProfile: {
    weight: undefined,
    height: undefined,
    age: undefined,
    gender: Sex.OTHER,
    experienceLevel: DifficultyLevel.INTERMEDIATE,
    fitnessLevel: ActivityLevel.MODERATE,
  },
  goals: {
    primaryGoal: WorkoutGoal.GENERAL_FITNESS,
    daysPerWeek: 4,
    durationWeeks: 4,
    sessionDurationMinutes: 60,
    splitType: 'upper_lower',
  },
  constraints: {
    availableEquipment: [],
    injuriesLimitations: [],
    preferredExercises: [],
    excludedExercises: [],
  },
  tierAI: 'balanced',
  additionalNotes: '',
};

export function useWorkoutForm(profileLoader?: () => Promise<ApiProfileData | null>) {
  const [formData, setFormData] = useState<WorkoutFormData>(DEFAULT_FORM_DATA);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!profileLoader) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const profileData = await profileLoader();
        const profile = profileData?.data || profileData?.profile || profileData;

        if (!profile || cancelled) return;

        setFormData((prev) => ({
          ...prev,
          userProfile: {
            weight: profile?.weightKg ?? prev.userProfile?.weight,
            height: profile?.heightCm ?? prev.userProfile?.height,
            age: profile?.age ?? prev.userProfile?.age,
            gender: mapGender(profile?.sex) || prev.userProfile?.gender || Sex.OTHER,
            experienceLevel:
              mapActivityToExperience(profile?.activityLevel) ||
              prev.userProfile?.experienceLevel ||
              DifficultyLevel.INTERMEDIATE,
            fitnessLevel:
              mapActivityLevel(profile?.activityLevel) ||
              prev.userProfile?.fitnessLevel ||
              ActivityLevel.MODERATE,
          },
          goals: {
            ...prev.goals,
            daysPerWeek: profile?.trainingFrequency ?? prev.goals.daysPerWeek ?? 4,
            sessionDurationMinutes:
              profile?.sessionDurationMinutes ?? prev.goals.sessionDurationMinutes ?? 60,
          },
          constraints: {
            ...prev.constraints,
            availableEquipment: Array.isArray(profile?.equipment)
              ? profile.equipment
              : (prev.constraints.availableEquipment ?? []),
          },
          additionalNotes: profile?.healthNotes ?? prev.additionalNotes ?? '',
        }));
      } catch (err: unknown) {
        logger.warn('[WorkoutGenerator] Unable to load profile, fallback to defaults', err);
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profileLoader]);

  const updateField = useCallback(
    <K extends keyof WorkoutFormData>(
      section: K,
      value: Partial<WorkoutFormData[K]> | WorkoutFormData[K]
    ) => {
      setFormData((prev) => {
        // If section is an object (userProfile, goals, constraints), merge it
        if (section === 'userProfile' || section === 'goals' || section === 'constraints') {
          return {
            ...prev,
            [section]: { ...(prev[section] as object), ...(value as object) },
          } as WorkoutFormData;
        }

        // Otherwise it's a primitive (tierAI, additionalNotes), replace it
        return {
          ...prev,
          [section]: value,
        };
      });
    },
    []
  );

  const getGenerationInput = useCallback((): WorkoutGenerationInput | null => {
    if (!formData.userProfile || !formData.goals || !formData.constraints) {
      return null;
    }

    return {
      userId: '',
      userProfile: {
        age: formData.userProfile.age ?? 30,
        gender: formData.userProfile.gender.toLowerCase() as 'male' | 'female' | 'other',
        experienceLevel: formData.userProfile.experienceLevel.toLowerCase() as
          | 'beginner'
          | 'intermediate'
          | 'advanced',
        weight: formData.userProfile.weight ?? 70,
        height: formData.userProfile.height ?? 175,
        fitnessLevel:
          (formData.userProfile.fitnessLevel?.toLowerCase() as
            | 'sedentary'
            | 'light'
            | 'moderate'
            | 'active'
            | 'very_active') ?? 'moderate',
      },
      goals: {
        primary: mapGoalToAgentValue(formData.goals.primaryGoal),
        targetMuscles: [],
        daysPerWeek: formData.goals.daysPerWeek,
        duration: formData.goals.durationWeeks,
        sessionDuration: formData.goals.sessionDurationMinutes ?? 60,
      },
      preferences: {
        preferredExercises: formData.constraints.preferredExercises,
        dislikedExercises: formData.constraints.excludedExercises,
        workoutTime: undefined,
      },
      constraints: {
        equipment: formData.constraints.availableEquipment,
        location: 'gym',
        timePerSession: formData.goals.sessionDurationMinutes ?? 60,
      },
      additionalNotes: formData.additionalNotes || '',
    };
  }, [formData]);

  return {
    formData,
    isLoadingProfile,
    updateField,
    getGenerationInput,
  };
}
