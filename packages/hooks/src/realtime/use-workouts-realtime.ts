/**
 * useWorkoutsRealtime Hook
 *
 * Hook per sincronizzazione TRUE realtime dei workout programs.
 * Aggiorna direttamente il cache di React Query invece di invalidare.
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSync, useRealtimeSyncSingle } from '@giulio-leone/lib-stores';
import { useAuthStore } from '@giulio-leone/lib-stores';

import { workoutKeys } from '@giulio-leone/features/workout';
export { workoutKeys };

// Tipi per i record del database
interface WorkoutProgramRecord {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal?: string;
  level?: string;
  duration_weeks?: number;
  days_per_week?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface WorkoutSessionRecord {
  id: string;
  workout_program_id: string;
  user_id: string;
  week_number: number;
  day_number: number;
  status?: string;
  started_at?: string;
  completed_at?: string;
  [key: string]: unknown;
}

interface ExercisePerformanceRecord {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  user_id: string;
  sets_completed?: number;
  reps?: number[];
  weight?: number[];
  [key: string]: unknown;
}

/**
 * Hook per sincronizzazione realtime della lista workout programs.
 *
 * @example
 * ```tsx
 * function WorkoutsList() {
 *   const { data } = useWorkouts();
 *   useWorkoutsListRealtime(); // Abilita realtime sync
 *   return <>{data.programs.map(...)}</>;
 * }
 * ```
 */
export function useWorkoutsListRealtime() {
  // const queryClient = useQueryClient(); // queryClient not used here
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeSync<WorkoutProgramRecord>({
    table: 'workout_programs',
    queryKey: workoutKeys.lists(),
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
  });
}

/**
 * Hook per sincronizzazione realtime di un singolo workout program.
 *
 * @param programId - ID del programma da osservare
 *
 * @example
 * ```tsx
 * function WorkoutDetail({ programId }) {
 *   const { data } = useWorkout(programId);
 *   useWorkoutDetailRealtime(programId);
 *   return <>{data.name}</>;
 * }
 * ```
 */
export function useWorkoutDetailRealtime(programId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<WorkoutProgramRecord>({
    table: 'workout_programs',
    recordId: programId!,
    queryKey: workoutKeys.detail(programId!),
    queryClient,
    enabled: !!programId,
  });
}

/**
 * Hook per sincronizzazione realtime delle sessioni di workout.
 *
 * @param programId - ID del programma per filtrare le sessioni (opzionale)
 */
export function useWorkoutSessionsRealtime(programId?: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeSync<WorkoutSessionRecord>({
    table: 'workout_sessions',
    queryKey: workoutKeys.sessions(),
    filter: programId
      ? `workout_program_id=eq.${programId}`
      : userId
        ? `user_id=eq.${userId}`
        : undefined,
    enabled: !!userId,
    onSynced: (event, record) => {
      // Se è un INSERT/UPDATE, invalida anche il detail del programma correlato
      if (event === 'INSERT' || event === 'UPDATE') {
        queryClient.invalidateQueries({
          queryKey: workoutKeys.detail(record.workout_program_id),
        });
      }
    },
  });
}

/**
 * Hook per sincronizzazione realtime di una singola sessione.
 *
 * @param sessionId - ID della sessione da osservare
 */
export function useWorkoutSessionRealtime(sessionId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<WorkoutSessionRecord>({
    table: 'workout_sessions',
    recordId: sessionId!,
    queryKey: workoutKeys.session(sessionId!),
    queryClient,
    enabled: !!sessionId,
  });
}

/**
 * Hook per sincronizzazione realtime delle performance degli esercizi.
 * Utile nella pagina di live workout.
 *
 * @param sessionId - ID della sessione per filtrare le performance
 */
export function useExercisePerformanceRealtime(sessionId?: string) {
  const queryClient = useQueryClient();

  useRealtimeSync<ExercisePerformanceRecord>({
    table: 'exercise_performance_records',
    queryKey: ['exercise-performance', sessionId],
    filter: sessionId ? `workout_session_id=eq.${sessionId}` : undefined,
    enabled: !!sessionId,
    onSynced: (_event, _record) => {
      // Invalida anche la sessione parent per aggiornare i totali
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: workoutKeys.session(sessionId),
        });
      }
    },
  });
}

/**
 * Hook combinato che abilita TUTTO il realtime per i workouts.
 * Usa questo nella pagina /workouts per abilitare tutte le sincronizzazioni.
 *
 * @example
 * ```tsx
 * function WorkoutsPage() {
 *   useAllWorkoutsRealtime();
 *   // ... rest of the component
 * }
 * ```
 */
export function useAllWorkoutsRealtime() {
  useWorkoutsListRealtime();
  useWorkoutSessionsRealtime();
}
