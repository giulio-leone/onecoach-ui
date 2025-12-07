'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ActivityLevel, Sex, WeightUnit } from '@prisma/client';

export type UserProfileData = {
  age: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  weightUnit: WeightUnit;
  activityLevel: ActivityLevel | null;
  trainingFrequency: number | null;
  dailyCalories: number | null;
  nutritionGoals: string[]; // Array of NutritionGoal IDs (CUIDs)
  workoutGoals: string[]; // Array of WorkoutGoal IDs
  equipment: string[];
  dietaryRestrictions: string[];
  dietaryPreferences: string[];
  dietType: string | null;
  healthNotes: string | null;
};

const EMPTY_PROFILE: UserProfileData = {
  age: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  weightUnit: 'KG',
  activityLevel: null,
  trainingFrequency: null,
  dailyCalories: null,
  nutritionGoals: [],
  workoutGoals: [],
  equipment: [],
  dietaryRestrictions: [],
  dietaryPreferences: [],
  dietType: null,
  healthNotes: null,
};

export type UserProfilePayload = Partial<UserProfileData>;

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfileData>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/profile', {
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        // Utente non autenticato: resetta stato e interrompe senza errore visibile
        setProfile(EMPTY_PROFILE);
        setError(null);
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          (payload && typeof payload === 'object' && 'error' in payload
            ? (payload as { error?: string }).error
            : null) || 'Impossibile recuperare il profilo';
        throw new Error(message);
      }

      const payload = await response.json();
      const data = (payload as { profile?: Partial<UserProfileData> & Record<string, unknown> })
        .profile;
      if (!data) {
        setProfile(EMPTY_PROFILE);
        return;
      }
      setProfile({
        age: data.age ?? null,
        sex: data.sex ?? null,
        heightCm: data.heightCm ?? null,
        weightKg: data.weightKg ? Number(data.weightKg) : null,
        weightUnit: (data.weightUnit as WeightUnit) ?? 'KG',
        activityLevel: data.activityLevel ?? null,
        trainingFrequency: data.trainingFrequency ?? null,
        dailyCalories: data.dailyCalories ?? null,
        nutritionGoals: Array.isArray(data.nutritionGoals) ? data.nutritionGoals : [],
        workoutGoals: Array.isArray(data.workoutGoals) ? data.workoutGoals : [],
        equipment: data.equipment ?? [],
        dietaryRestrictions: data.dietaryRestrictions ?? [],
        dietaryPreferences: data.dietaryPreferences ?? [],
        dietType: data.dietType ?? null,
        healthNotes: data.healthNotes ?? null,
      });
    } catch (error: unknown) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Errore caricamento profilo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (payload: UserProfilePayload) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Errore aggiornamento profilo');
    }

    const { profile: updated } = await response.json();
    setProfile({
      age: updated.age ?? null,
      sex: updated.sex ?? null,
      heightCm: updated.heightCm ?? null,
      weightKg: updated.weightKg ? Number(updated.weightKg) : null,
      weightUnit: (updated.weightUnit as WeightUnit) ?? 'KG',
      activityLevel: updated.activityLevel ?? null,
      trainingFrequency: updated.trainingFrequency ?? null,
      dailyCalories: updated.dailyCalories ?? null,
      nutritionGoals: Array.isArray(updated.nutritionGoals) ? updated.nutritionGoals : [],
      workoutGoals: Array.isArray(updated.workoutGoals) ? updated.workoutGoals : [],
      equipment: updated.equipment ?? [],
      dietaryRestrictions: updated.dietaryRestrictions ?? [],
      dietaryPreferences: updated.dietaryPreferences ?? [],
      dietType: updated.dietType ?? null,
      healthNotes: updated.healthNotes ?? null,
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    profile,
    isLoading,
    error,
    refresh,
    update,
  };
}

/**
 * Hook per ottenere la preferenza unità peso dell'utente
 * @returns 'KG' o 'LBS' (default: 'KG')
 */
export function useWeightUnit(): WeightUnit {
  const { profile } = useUserProfile();
  return profile.weightUnit ?? 'KG';
}
