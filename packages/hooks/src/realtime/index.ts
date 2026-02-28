/**
 * Realtime Hooks Index
 *
 * Esportazione centralizzata di tutti gli hook Realtime per l'app.
 * Questi hook implementano TRUE realtime sync (aggiornamento diretto del cache)
 * invece di simple invalidation.
 */

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Legacy hook (usato anche altrove)
export { useSyncCreditsRealtime } from './use-sync-credits-realtime';

// Live Session
export { useLiveSessionRealtime } from './use-live-session';

// Workouts
export {
  useWorkoutsListRealtime,
  useWorkoutDetailRealtime,
  useWorkoutSessionsRealtime,
  useWorkoutSessionRealtime,
  useExercisePerformanceRealtime,
  useAllWorkoutsRealtime,
  workoutKeys,
} from './use-workouts-realtime';

// Nutrition
export {
  useNutritionPlansRealtime,
  useNutritionPlanDetailRealtime,
  useNutritionDayLogsRealtime,
  useNutritionDayLogRealtime,
  useNutritionAdherenceRealtime,
  useAllNutritionRealtime,
} from './use-nutrition-realtime';

// Chat
// NUOVO: useChatRealtimeStore è il hook consigliato (single subscription)
export {
  useChatRealtimeStore,
  useConversationsRealtimeStore,
  useMessagesRealtimeStore,
  chatKeys,
} from './use-chat-realtime';

// OneAgenda (Projects, Tasks, Habits)
export {
  useProjectsRealtime,
  useProjectDetailRealtime,
  useTasksRealtime,
  useTaskDetailRealtime,
  useMilestonesRealtime,
  useHabitsRealtime,
  useHabitDetailRealtime,
  useHabitLogsRealtime,
  useAllOneAgendaRealtime,
  useProjectFullRealtime,
  oneagendaKeys,
} from './use-oneagenda-realtime';

// Analytics
export {
  useBodyMeasurementsRealtime,
  useBodyMeasurementDetailRealtime,
  useProgressSnapshotsRealtime,
  useDailyMetricsRealtime,
  useUserGoalsRealtime,
  useUserGoalDetailRealtime,
  useAllAnalyticsRealtime,
  useDashboardMetricsRealtime,
  analyticsKeys,
} from './use-analytics-realtime';

// Users
export {
  useSyncUserProfileRealtime,
  useUserProfileRealtime,
  useCreditTransactionsRealtime,
  useSubscriptionRealtime,
  useAllUserRealtime,
  useProfilePageRealtime,
  userKeys,
} from './use-users-realtime';

// Maxes (1RM)
export {
  useMaxesListRealtime,
  useMaxDetailRealtime,
  useMaxVersionsRealtime,
  useAllMaxesRealtime,
  maxesKeys,
} from './use-maxes-realtime';

// ============================================================================
// ADMIN HOOKS
// ============================================================================

// Admin Exercises
export {
  useAdminExercisesRealtime,
  useAdminMuscleGroupsRealtime,
  useAllAdminExercisesRealtime,
  adminExerciseKeys,
} from './use-admin-exercises-realtime';

// Admin Foods
export {
  useAdminFoodsRealtime,
  useAdminFoodCategoriesRealtime,
  useAllAdminFoodsRealtime,
  adminFoodKeys,
} from './use-admin-foods-realtime';

// Admin Users
export {
  useAdminUsersRealtime,
  useAdminUserProfilesRealtime,
  useAdminSubscriptionsRealtime,
  useAllAdminUsersRealtime,
  adminUserKeys,
} from './use-admin-users-realtime';

// Admin AI
export { useAdminAIRealtime } from './use-admin-ai-realtime';

// ============================================================================
// COMBINED HOOKS
// ============================================================================

import { useSyncCreditsRealtime } from './use-sync-credits-realtime';
import { useAllUserRealtime } from './use-users-realtime';
import { useDashboardMetricsRealtime } from './use-analytics-realtime';
import { useWorkoutsListRealtime } from './use-workouts-realtime';
import { useTasksRealtime } from './use-oneagenda-realtime';
import { useAllAdminExercisesRealtime } from './use-admin-exercises-realtime';
import { useAllAdminFoodsRealtime } from './use-admin-foods-realtime';
import { useAllAdminUsersRealtime } from './use-admin-users-realtime';

/**
 * Hook MASTER per abilitare TUTTO il realtime nell'applicazione.
 * Da usare nel layout principale dell'app.
 *
 * Abilita:
 * - Crediti utente (sync con Zustand store)
 * - Profilo utente
 * - Subscription
 *
 * NOTA: Per performance, gli hook specifici per feature (workouts, nutrition, etc.)
 * vanno usati solo nelle pagine corrispondenti.
 *
 * @example
 * ```tsx
 * // In app/(protected)/layout.tsx
 * 'use client';
 *
 * import { useAppRealtime } from '@/hooks/realtime';
 *
 * export default function ProtectedLayout({ children }) {
 *   useAppRealtime();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useAppRealtime() {
  useSyncCreditsRealtime();
  useAllUserRealtime();
}

/**
 * Hook per la Dashboard principale.
 * Abilita realtime per le metriche mostrate nella dashboard.
 */
export function useDashboardRealtime() {
  useSyncCreditsRealtime();
  useDashboardMetricsRealtime();
  useWorkoutsListRealtime();
  useTasksRealtime();
}

/**
 * Hook MASTER per admin panel.
 * Abilita realtime per tutte le entità gestite dall'admin.
 *
 * NOTA: Non chiamiamo useSyncCreditsRealtime() o useAllUserRealtime() qui
 * perché useAllAdminUsersRealtime() già sottoscrive a `users:*` che copre
 * tutti gli utenti, incluso quello corrente. La logica di sync crediti
 * è integrata direttamente in useAdminUsersRealtime().
 */
export function useAdminRealtime() {
  useAllAdminExercisesRealtime();
  useAllAdminFoodsRealtime();
  useAllAdminUsersRealtime();
}
