'use client';

/**
 * Admin Exercises Realtime Hook
 *
 * Hook per sincronizzazione realtime degli esercizi nell'admin panel.
 * Aggiorna direttamente il cache React Query invece di invalidare.
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@giulio-leone/lib-stores';
// Importa le query keys da lib-api per garantire corrispondenza esatta
import { exerciseKeys } from '@giulio-leone/lib-api';
import type { ExercisesResponse } from '@giulio-leone/lib-api';

import { logger } from '@giulio-leone/lib-shared';
// Tipo per ExerciseRecord dal database (struttura reale)
interface ExerciseRecord {
  id: string;
  slug: string;
  exerciseTypeId?: string | null;
  approvalStatus?: string | null;
  approvedAt?: string | Date | null;
  isUserGenerated?: boolean | null;
  version?: number | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  overview?: string | null;
  keywords?: string[] | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

// Re-export per compatibilità
export const adminExerciseKeys = exerciseKeys;
type ExerciseItem = ExercisesResponse['data'][number];

/**
 * Hook per sincronizzare la lista esercizi in admin
 * Usa le stesse query keys di useExercises per garantire sincronizzazione corretta
 * SSR-safe: no-op on server or when QueryClient is not available
 */
export function useAdminExercisesRealtime() {
  // SSR guard: skip on server
  const isClient = typeof window !== 'undefined';

  // Try to get queryClient, but don't crash if not available
  let queryClient: ReturnType<typeof useQueryClient> | null = null;
  try {
    if (isClient) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      queryClient = useQueryClient();
    }
  } catch {
    // QueryClient not available, skip realtime sync
  }

  const handleInsert = useCallback(
    (rawRecord: Record<string, unknown>) => {
      if (!queryClient) return;

      const record = rawRecord as ExerciseRecord;
      // Trasforma il record del database in formato Exercise
      const exercise: ExerciseItem = {
        id: record.id,
        name: record.slug || record.id, // Fallback a slug o id se name non disponibile
        description: record.overview || undefined,
        category: record.exerciseTypeId || undefined,
      };

      // Aggiorna tutte le query che corrispondono a exerciseKeys.lists()
      queryClient.setQueriesData<ExercisesResponse>(
        { queryKey: exerciseKeys.lists(), exact: false },
        (oldData) => {
          if (!oldData) return { data: [exercise], total: 1 };
          // Evita duplicati
          if (oldData.data.some((item) => item.id === exercise.id)) return oldData;
          return {
            ...oldData,
            data: [...oldData.data, exercise],
            total: (oldData.total ?? oldData.data.length) + 1,
          };
        }
      );
      logger.warn(`[Realtime] Exercise INSERT:`, exercise.id);
    },
    [queryClient]
  );

  const handleUpdate = useCallback(
    (rawRecord: Record<string, unknown>) => {
      if (!queryClient) return;

      const record = rawRecord as ExerciseRecord;
      // Trasforma il record del database in formato Exercise
      const exercise: ExerciseItem = {
        id: record.id,
        name: record.slug || record.id,
        description: record.overview || undefined,
        category: record.exerciseTypeId || undefined,
      };

      // Aggiorna tutte le query che corrispondono a exerciseKeys.lists()
      queryClient.setQueriesData<ExercisesResponse>(
        { queryKey: exerciseKeys.lists(), exact: false },
        (oldData) => {
          if (!oldData) return { data: [exercise], total: 1 };
          return {
            ...oldData,
            data: oldData.data.map((item: any) => (item.id === exercise.id ? exercise : item)),
          };
        }
      );
      logger.warn(`[Realtime] Exercise UPDATE:`, exercise.id);
    },
    [queryClient]
  );

  const handleDelete = useCallback(
    (rawRecord: Record<string, unknown>) => {
      if (!queryClient) return;

      const record = rawRecord as ExerciseRecord;

      // Aggiorna tutte le query che corrispondono a exerciseKeys.lists()
      queryClient.setQueriesData<ExercisesResponse>(
        { queryKey: exerciseKeys.lists(), exact: false },
        (oldData) => {
          if (!oldData) return { data: [], total: 0 };
          const newData = oldData.data.filter((item: any) => item.id !== record.id);
          return {
            ...oldData,
            data: newData,
            total: Math.max(0, (oldData.total ?? oldData.data.length) - 1),
          };
        }
      );
      logger.warn(`[Realtime] Exercise DELETE:`, record.id);
    },
    [queryClient]
  );

  useRealtimeSubscription<ExerciseRecord>({
    table: 'exercises',
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onError: (error) => {
      logger.error('[Realtime] Exercises error:', error);
    },
  });
}

/**
 * Hook per sincronizzare i gruppi muscolari
 * SSR-safe: no-op on server or when QueryClient is not available
 */
export function useAdminMuscleGroupsRealtime() {
  // SSR guard: skip on server
  const isClient = typeof window !== 'undefined';

  // Try to get queryClient, but don't crash if not available
  let queryClient: ReturnType<typeof useQueryClient> | null = null;
  try {
    if (isClient) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      queryClient = useQueryClient();
    }
  } catch {
    // QueryClient not available, skip realtime sync
  }

  useRealtimeSubscription({
    table: 'muscle_groups',
    onInsert: () => {
      if (queryClient) queryClient.invalidateQueries({ queryKey: ['admin', 'muscle_groups'] });
    },
    onUpdate: () => {
      if (queryClient) queryClient.invalidateQueries({ queryKey: ['admin', 'muscle_groups'] });
    },
    onDelete: () => {
      if (queryClient) queryClient.invalidateQueries({ queryKey: ['admin', 'muscle_groups'] });
    },
  });
}

/**
 * Hook combinato per tutto il Realtime admin exercises
 */
export function useAllAdminExercisesRealtime() {
  useAdminExercisesRealtime();
  useAdminMuscleGroupsRealtime();
}
