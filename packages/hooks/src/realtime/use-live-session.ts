'use client';

import { useWorkoutSessionRealtime, useExercisePerformanceRealtime } from './use-workouts-realtime';

/**
 * Hook standardizzato per la sincronizzazione realtime di una Live Session.
 * Incapsula:
 * 1. Sincronizzazione della sessione (update status, completamento, note)
 * 2. Sincronizzazione delle performance (set completati, reps, pesi)
 *
 * @param sessionId - ID della sessione attiva
 */
export function useLiveSessionRealtime(sessionId: string) {
  // 1. Session Sync (Single record)
  useWorkoutSessionRealtime(sessionId);

  // 2. Exercise Performance Sync (List linked to session)
  // Questo gestisce automaticamente l'invalidazione della sessione quando cambiano le performance
  useExercisePerformanceRealtime(sessionId);

  return {
    isRealtimeEnabled: !!sessionId,
  };
}
