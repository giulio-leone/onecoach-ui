'use client';

/**
 * Admin Users Realtime Hook
 *
 * Hook per sincronizzazione realtime degli utenti nell'admin panel.
 * Aggiorna il cache React Query quando ci sono modifiche nel database.
 *
 * NOTA: Questo hook sincronizza anche i crediti dell'utente corrente
 * nello Zustand auth store, evitando la necessità di una sottoscrizione
 * separata per `users:id=eq.XXX`.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription, useAuthStore } from '@giulio-leone/lib-stores';

// Tipo per User dalla nostra app
interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  credits?: number | null;
  subscription_status?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  [key: string]: unknown;
}

// Query keys per users admin
export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  list: (filters?: Record<string, unknown>) => [...adminUserKeys.all, 'list', filters] as const,
  detail: (id: string) => [...adminUserKeys.all, 'detail', id] as const,
  profiles: ['admin', 'user_profiles'] as const,
  subscriptions: ['admin', 'subscriptions'] as const,
};

/**
 * Hook per sincronizzare la lista utenti in admin.
 *
 * Sottoscrive a `users:*` (tutti gli utenti) e:
 * 1. Aggiorna il cache React Query per la tabella admin
 * 2. Se l'utente aggiornato è quello corrente, sincronizza anche i crediti nello Zustand store
 */
export function useAdminUsersRealtime() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const updateUser = useAuthStore((state) => state.updateUser);

  useRealtimeSubscription<User>({
    table: 'users',
    onInsert: () => {
      queryClient.invalidateQueries({
        queryKey: adminUserKeys.all,
        exact: false,
      });
    },
    onUpdate: (record) => {
      // 1. Aggiorna cache React Query per admin
      queryClient.setQueryData(adminUserKeys.detail(record.id), record);

      queryClient.setQueriesData<{ users: User[]; total: number }>(
        { queryKey: adminUserKeys.all },
        (old) => {
          if (!old?.users) return old;
          return {
            ...old,
            users: old.users.map((u: any) => (u.id === record.id ? record : u)),
          };
        }
      );

      // 2. Se è l'utente corrente, sincronizza anche lo Zustand auth store
      if (record.id === currentUserId) {
        if (typeof record.credits === 'number') {
          updateUser({ credits: record.credits });
        }
        if (record.name) {
          updateUser({ name: record.name });
        }
      }
    },
    onDelete: (record) => {
      queryClient.removeQueries({
        queryKey: adminUserKeys.detail(record.id),
      });

      queryClient.setQueriesData<{ users: User[]; total: number }>(
        { queryKey: adminUserKeys.all },
        (old) => {
          if (!old?.users) return old;
          return {
            ...old,
            users: old.users.filter((u: any) => u.id !== record.id),
            total: old.total - 1,
          };
        }
      );
    },
  });
}

/**
 * Hook per sincronizzare i profili utente in admin
 */
export function useAdminUserProfilesRealtime() {
  const queryClient = useQueryClient();

  useRealtimeSubscription<UserProfile>({
    table: 'user_profiles',
    onInsert: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.profiles });
    },
    onUpdate: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.profiles });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
    onDelete: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.profiles });
    },
  });
}

/**
 * Hook per sincronizzare le subscription in admin
 */
export function useAdminSubscriptionsRealtime() {
  const queryClient = useQueryClient();

  useRealtimeSubscription({
    table: 'subscriptions',
    onInsert: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
    onUpdate: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
    onDelete: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.subscriptions });
    },
  });
}

/**
 * Hook combinato per tutto il Realtime admin users
 */
export function useAllAdminUsersRealtime() {
  useAdminUsersRealtime();
  useAdminUserProfilesRealtime();
  useAdminSubscriptionsRealtime();
}
