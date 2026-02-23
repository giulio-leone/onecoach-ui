/**
 * useAnalyticsRealtime Hook
 *
 * Hook per sincronizzazione TRUE realtime di body_measurements, user_progress_snapshots, daily_metrics.
 * Aggiorna direttamente il cache di React Query invece di invalidare.
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@giulio-leone/lib-shared';
import { useAuthStore, useRealtimeSyncSingle, useRealtimeListSync } from '@giulio-leone/lib-stores';

// Query keys per analytics
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (period?: string) => [...analyticsKeys.all, 'overview', period] as const,
  bodyMeasurements: {
    all: () => [...analyticsKeys.all, 'body-measurements'] as const,
    lists: () => [...analyticsKeys.all, 'body-measurements', 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...analyticsKeys.all, 'body-measurements', 'list', filters] as const,
    detail: (id: string) => [...analyticsKeys.all, 'body-measurements', 'detail', id] as const,
    latest: () => [...analyticsKeys.all, 'body-measurements', 'latest'] as const,
  },
  progressSnapshots: {
    all: () => [...analyticsKeys.all, 'progress-snapshots'] as const,
    lists: () => [...analyticsKeys.all, 'progress-snapshots', 'list'] as const,
    list: (dateRange?: { from?: string; to?: string }) =>
      [...analyticsKeys.all, 'progress-snapshots', 'list', dateRange] as const,
    detail: (id: string) => [...analyticsKeys.all, 'progress-snapshots', 'detail', id] as const,
  },
  dailyMetrics: {
    all: () => [...analyticsKeys.all, 'daily-metrics'] as const,
    lists: () => [...analyticsKeys.all, 'daily-metrics', 'list'] as const,
    list: (dateRange?: { from?: string; to?: string }) =>
      [...analyticsKeys.all, 'daily-metrics', 'list', dateRange] as const,
    byDate: (date: string) => [...analyticsKeys.all, 'daily-metrics', date] as const,
  },
  goals: {
    all: () => [...analyticsKeys.all, 'goals'] as const,
    lists: () => [...analyticsKeys.all, 'goals', 'list'] as const,
    list: () => [...analyticsKeys.all, 'goals', 'list'] as const,
    detail: (id: string) => [...analyticsKeys.all, 'goals', 'detail', id] as const,
  },
} as const;

// Tipi per i record del database
interface BodyMeasurementRecord {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  waist_cm?: number;
  chest_cm?: number;
  arms_cm?: number;
  thighs_cm?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface UserProgressSnapshotRecord {
  id: string;
  user_id: string;
  date: string;
  type: string;
  value: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
  [key: string]: unknown;
}

interface DailyMetricRecord {
  id: string;
  user_id: string;
  date: string;
  calories_consumed?: number;
  calories_burned?: number;
  steps?: number;
  sleep_hours?: number;
  water_ml?: number;
  mood_score?: number;
  energy_level?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface UserGoalRecord {
  id: string;
  user_id: string;
  name: string;
  type?: string;
  target_value?: number;
  current_value?: number;
  deadline?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ============================================================================
// BODY MEASUREMENTS
// ============================================================================

/**
 * Hook per sincronizzazione realtime delle misurazioni corporee.
 *
 * @example
 * ```tsx
 * function BodyMeasurementsChart() {
 *   const { data } = useBodyMeasurements();
 *   useBodyMeasurementsRealtime();
 *   return <Chart data={data} />;
 * }
 * ```
 */
export function useBodyMeasurementsRealtime() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeListSync<BodyMeasurementRecord>({
    table: 'body_measurements',
    queryKey: analyticsKeys.bodyMeasurements.lists(),
    queryClient,
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Body measurement ${event}:`, { id: record.id, date: record.date });
      // Invalida anche latest e overview quando ci sono nuovi dati
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.bodyMeasurements.latest(),
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.overview(),
      });
    },
    onError: (error) => {
      logger.error('[Realtime] Body measurements error:', error);
    },
  });
}

/**
 * Hook per sincronizzazione realtime di una singola misurazione.
 */
export function useBodyMeasurementDetailRealtime(measurementId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<BodyMeasurementRecord>({
    table: 'body_measurements',
    recordId: measurementId!,
    queryKey: analyticsKeys.bodyMeasurements.detail(measurementId!),
    queryClient,
    enabled: !!measurementId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Body measurement detail ${event}:`, record.id);
    },
  });
}

// ============================================================================
// PROGRESS SNAPSHOTS
// ============================================================================

/**
 * Hook per sincronizzazione realtime dei progress snapshots.
 */
export function useProgressSnapshotsRealtime() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeListSync<UserProgressSnapshotRecord>({
    table: 'user_progress_snapshots',
    queryKey: analyticsKeys.progressSnapshots.lists(),
    queryClient,
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Progress snapshot ${event}:`, { id: record.id, type: record.type });
      // Invalida overview per aggiornare i grafici
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.overview(),
      });
    },
  });
}

// ============================================================================
// DAILY METRICS
// ============================================================================

/**
 * Hook per sincronizzazione realtime delle metriche giornaliere.
 * Include: calorie, passi, sonno, acqua, mood, energy.
 */
export function useDailyMetricsRealtime() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeListSync<DailyMetricRecord>({
    table: 'daily_metrics',
    queryKey: analyticsKeys.dailyMetrics.lists(),
    queryClient,
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Daily metric ${event}:`, { id: record.id, date: record.date });
      // Invalida anche la specifica data e l'overview
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.dailyMetrics.byDate(record.date),
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.overview(),
      });
    },
  });
}

// ============================================================================
// USER GOALS
// ============================================================================

/**
 * Hook per sincronizzazione realtime degli obiettivi utente.
 */
export function useUserGoalsRealtime() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeListSync<UserGoalRecord>({
    table: 'user_goals',
    queryKey: analyticsKeys.goals.lists(),
    queryClient,
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] User goal ${event}:`, { id: record.id, name: record.name });
    },
  });
}

/**
 * Hook per sincronizzazione realtime di un singolo goal.
 */
export function useUserGoalDetailRealtime(goalId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<UserGoalRecord>({
    table: 'user_goals',
    recordId: goalId!,
    queryKey: analyticsKeys.goals.detail(goalId!),
    queryClient,
    enabled: !!goalId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Goal detail ${event}:`, record.id);
    },
  });
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook combinato per sincronizzare TUTTE le metriche analytics.
 * Usa nella pagina /analytics o /dashboard.
 *
 * @example
 * ```tsx
 * function AnalyticsDashboard() {
 *   useAllAnalyticsRealtime();
 *   // ... charts, stats, etc.
 * }
 * ```
 */
export function useAllAnalyticsRealtime() {
  useBodyMeasurementsRealtime();
  useProgressSnapshotsRealtime();
  useDailyMetricsRealtime();
  useUserGoalsRealtime();
}

/**
 * Hook per sincronizzare solo le metriche del dashboard.
 * Versione leggera per la home/dashboard.
 */
export function useDashboardMetricsRealtime() {
  useBodyMeasurementsRealtime();
  useDailyMetricsRealtime();
}
