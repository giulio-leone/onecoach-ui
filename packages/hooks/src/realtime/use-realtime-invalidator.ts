'use client';

import { useCallback } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@giulio-leone/lib-stores';

interface UseRealtimeInvalidatorOptions {
  /** Filtro PostgREST opzionale (es: "userId=eq.123") */
  filter?: string;
  /** Abilita/disabilita l'invalidazione (default: true) */
  enabled?: boolean;
}

/**
 * Hook per invalidare automaticamente cache React Query quando cambiano dati Realtime.
 * Usa lo store Zustand centralizzato per evitare sottoscrizioni duplicate.
 *
 * @example
 * ```tsx
 * // Invalida la cache quando cambiano i workout
 * useRealtimeInvalidator(
 *   'workout_sessions',
 *   [['workouts', userId], ['workout-stats']],
 *   { filter: `user_id=eq.${userId}`, enabled: !!userId }
 * );
 * ```
 */
export function useRealtimeInvalidator(
  table: string,
  queryKeys: QueryKey[],
  options?: UseRealtimeInvalidatorOptions
) {
  const { filter, enabled = true } = options ?? {};
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryKeys.forEach((key: QueryKey) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, queryKeys]);

  useRealtimeSubscription({
    table,
    filter,
    enabled,
    onInsert: invalidate,
    onUpdate: invalidate,
    onDelete: invalidate,
  });
}
