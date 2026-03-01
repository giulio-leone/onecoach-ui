'use client';

/**
 * Maxes (1RM) Realtime Hook
 *
 * Hook per sincronizzazione realtime dei massimali (one rep max) utente.
 * Aggiorna il cache React Query E lo store Zustand quando ci sono modifiche nel database.
 *
 * SSOT: I tipi sono importati da @giulio-leone/types
 */

import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription, useMaxesStore } from '@giulio-leone/lib-stores';
import type { MaxRealtimePayload } from '@giulio-leone/types';
import { realtimePayloadToMax } from '@giulio-leone/types';

// Query keys per massimali utente
export const maxesKeys = {
  all: ['profile', 'maxes'] as const,
  list: () => [...maxesKeys.all, 'list'] as const,
  detail: (exerciseId: string) => [...maxesKeys.all, 'detail', exerciseId] as const,
  versions: (exerciseId: string) => [...maxesKeys.all, 'versions', exerciseId] as const,
};

/**
 * Hook per sincronizzare la lista massimali dell'utente corrente
 * Aggiorna sia React Query cache che Zustand store
 */
export function useMaxesListRealtime() {
  const queryClient = useQueryClient();
  const { handleRealtimeInsert, handleRealtimeUpdate, handleRealtimeDelete } = useMaxesStore();

  useRealtimeSubscription<MaxRealtimePayload>({
    table: 'user_one_rep_max',
    onInsert: (record) => {
      // Aggiorna React Query cache
      queryClient.setQueryData<{ maxes: MaxRealtimePayload[] }>(maxesKeys.list(), (old) => {
        if (!old?.maxes) return { maxes: [record] };
        const exists = old.maxes.some((m) => m.id === record.id);
        if (exists) return old;
        return { maxes: [record, ...old.maxes] };
      });

      // Aggiorna Zustand store usando la utility SSOT
      handleRealtimeInsert(realtimePayloadToMax(record));
    },
    onUpdate: (record) => {
      // Aggiorna React Query cache
      queryClient.setQueryData<{ maxes: MaxRealtimePayload[] }>(maxesKeys.list(), (old) => {
        if (!old?.maxes) return old;
        return {
          maxes: old.maxes.map((m) => (m.exerciseId === record.exerciseId ? record : m)),
        };
      });
      queryClient.setQueryData(maxesKeys.detail(record.exerciseId), record);

      // Aggiorna Zustand store usando la utility SSOT
      handleRealtimeUpdate(realtimePayloadToMax(record));
    },
    onDelete: (record) => {
      // Aggiorna React Query cache
      queryClient.setQueryData<{ maxes: MaxRealtimePayload[] }>(maxesKeys.list(), (old) => {
        if (!old?.maxes) return old;
        return {
          maxes: old.maxes.filter((m) => m.exerciseId !== record.exerciseId),
        };
      });
      queryClient.removeQueries({
        queryKey: maxesKeys.detail(record.exerciseId),
      });

      // Aggiorna Zustand store
      handleRealtimeDelete({ exerciseId: record.exerciseId });
    },
  });
}

/**
 * Hook per sincronizzare un massimale specifico per exerciseId
 */
export function useMaxDetailRealtime(exerciseId: string) {
  const queryClient = useQueryClient();

  useRealtimeSubscription<MaxRealtimePayload>({
    table: 'user_one_rep_max',
    filter: `exerciseId=eq.${exerciseId}`,
    onUpdate: (record) => {
      queryClient.setQueryData(maxesKeys.detail(exerciseId), record);
      // Aggiorna anche nella lista
      queryClient.setQueryData<{ maxes: MaxRealtimePayload[] }>(maxesKeys.list(), (old) => {
        if (!old?.maxes) return old;
        return {
          maxes: old.maxes.map((m) => (m.exerciseId === exerciseId ? record : m)),
        };
      });
    },
    onDelete: () => {
      queryClient.removeQueries({
        queryKey: maxesKeys.detail(exerciseId),
      });
      // Rimuovi dalla lista
      queryClient.setQueryData<{ maxes: MaxRealtimePayload[] }>(maxesKeys.list(), (old) => {
        if (!old?.maxes) return old;
        return {
          maxes: old.maxes.filter((m) => m.exerciseId !== exerciseId),
        };
      });
    },
  });
}

/**
 * Hook per sincronizzare lo storico versioni di un massimale
 */
export function useMaxVersionsRealtime(exerciseId: string) {
  const queryClient = useQueryClient();

  useRealtimeSubscription({
    table: 'user_one_rep_max_versions',
    filter: `exerciseId=eq.${exerciseId}`,
    onInsert: () => {
      queryClient.invalidateQueries({
        queryKey: maxesKeys.versions(exerciseId),
      });
    },
    onDelete: () => {
      queryClient.invalidateQueries({
        queryKey: maxesKeys.versions(exerciseId),
      });
    },
  });
}

/**
 * Hook combinato per tutto il Realtime massimali
 */
export function useAllMaxesRealtime() {
  useMaxesListRealtime();
}
