/**
 * useUsersRealtime Hook
 *
 * Hook per sincronizzazione TRUE realtime degli utenti e transazioni crediti.
 * Include user profile updates, credit transactions, subscriptions.
 *
 * NOTA: useSyncCreditsRealtime è in use-sync-credits-realtime.ts (legacy, manteniamo per compatibilità)
 */

'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useRealtimeListSync,
  useRealtimeSyncSingle,
  useRealtimeSubscription,
} from '@giulio-leone/lib-stores';
import { useAuthStore } from '@giulio-leone/lib-stores';

import { logger } from '@giulio-leone/lib-shared';
// Query keys per users
export const userKeys = {
  all: ['users'] as const,
  current: () => [...userKeys.all, 'current'] as const,
  profile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
  credits: (userId: string) => [...userKeys.all, 'credits', userId] as const,
  transactions: {
    all: () => [...userKeys.all, 'transactions'] as const,
    lists: () => [...userKeys.all, 'transactions', 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...userKeys.all, 'transactions', 'list', filters] as const,
    detail: (id: string) => [...userKeys.all, 'transactions', 'detail', id] as const,
  },
  subscriptions: {
    all: () => [...userKeys.all, 'subscriptions'] as const,
    current: (userId: string) => [...userKeys.all, 'subscriptions', userId, 'current'] as const,
    history: (userId: string) => [...userKeys.all, 'subscriptions', userId, 'history'] as const,
  },
} as const;

// Tipi per i record del database
interface UserRecord {
  id: string;
  email: string;
  name?: string;
  credits: number;
  role?: string;
  avatar_url?: string;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface UserProfileRecord {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  fitness_goal?: string;
  experience_level?: string;
  [key: string]: unknown;
}

interface CreditTransactionRecord {
  id: string;
  userId: string; // camelCase in DB
  amount: number;
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'subscription';
  description?: string;
  metadata?: Record<string, unknown>;
  balanceAfter?: number;
  createdAt?: string;
  [key: string]: unknown;
}

interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_id?: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start?: string;
  current_period_end?: string;
  canceled_at?: string;
  created_at?: string;
  [key: string]: unknown;
}

// ============================================================================
// USER PROFILE
// ============================================================================

/**
 * Hook per sincronizzare gli aggiornamenti del profilo utente.
 * Aggiorna lo Zustand store quando il profilo cambia.
 */
export function useSyncUserProfileRealtime() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const userId = user?.id;

  useRealtimeSubscription<UserRecord>({
    table: 'users',
    filter: userId ? `id=eq.${userId}` : undefined,
    enabled: !!userId,
    onUpdate: useCallback(
      (record: UserRecord) => {
        logger.warn('[Realtime] User profile updated:', record.id);
        // Aggiorna solo i campi esistenti nel tipo User
        updateUser({
          name: record.name || '',
          email: record.email,
          profileImage: record.avatar_url,
        });
      },
      [updateUser]
    ),
  });
}

/**
 * Hook per sincronizzare il profilo esteso dell'utente (user_profiles table).
 */
export function useUserProfileRealtime(userId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<UserProfileRecord>({
    table: 'user_profiles',
    recordId: userId!,
    queryKey: userKeys.profile(userId!),
    queryClient,
    enabled: !!userId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] User profile ${event}:`, record.id);
    },
  });
}

// ============================================================================
// CREDIT TRANSACTIONS
// ============================================================================

/**
 * Hook per sincronizzazione realtime delle transazioni crediti.
 * Utile per mostrare lo storico acquisti/utilizzi in tempo reale.
 */
export function useCreditTransactionsRealtime() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeListSync<CreditTransactionRecord>({
    table: 'credit_transactions',
    queryKey: userKeys.transactions.lists(),
    queryClient,
    filter: userId ? `userId=eq.${userId}` : undefined, // Note: column is camelCase in DB
    enabled: !!userId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Credit transaction ${event}:`, {
        id: record.id,
        type: record.type,
        amount: record.amount,
      });
      // Quando c'è una nuova transazione, invalida le query credits
      if (event === 'INSERT') {
        queryClient.invalidateQueries({
          queryKey: userKeys.credits(record.userId), // Fixed: use camelCase
        });
      }
    },
    onError: (error) => {
      // L'errore vuoto {} indica tipicamente che Realtime non è abilitato sulla tabella
      // o che le RLS policy bloccano l'accesso SELECT per l'utente
      const errorMessage =
        error?.message ||
        'Unknown error (check if Realtime is enabled on credit_transactions table)';
      logger.error('[Realtime] Credit transactions error:', {
        message: errorMessage,
        userId,
        hint: 'Verify: 1) Realtime enabled in Supabase Dashboard > Table > Realtime 2) RLS SELECT policy exists for authenticated users',
      });
    },
  });
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

/**
 * Hook per sincronizzazione realtime delle subscription.
 */
export function useSubscriptionRealtime() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeSubscription<SubscriptionRecord>({
    table: 'subscriptions',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onInsert: useCallback(
      (record: SubscriptionRecord) => {
        logger.warn('[Realtime] New subscription:', { id: record.id, status: record.status });
        queryClient.invalidateQueries({
          queryKey: userKeys.subscriptions.current(record.user_id),
        });
      },
      [queryClient]
    ),
    onUpdate: useCallback(
      (record: SubscriptionRecord) => {
        logger.warn('[Realtime] Subscription updated:', { id: record.id, status: record.status });
        queryClient.invalidateQueries({
          queryKey: userKeys.subscriptions.current(record.user_id),
        });
      },
      [queryClient]
    ),
  });
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook combinato per sincronizzare TUTTO ciò che riguarda l'utente corrente.
 * Usa nel layout principale dell'app.
 *
 * NOTA: useSyncCreditsRealtime va importato separatamente da use-sync-credits-realtime.ts
 *
 * @example
 * ```tsx
 * import { useSyncCreditsRealtime } from '@/hooks/use-sync-credits-realtime';
 * import { useAllUserRealtime } from '@/hooks/use-users-realtime';
 *
 * function RootLayout({ children }) {
 *   useSyncCreditsRealtime(); // Per i crediti nello store
 *   useAllUserRealtime();     // Per tutto il resto
 *   return <>{children}</>;
 * }
 * ```
 */
export function useAllUserRealtime() {
  useSyncUserProfileRealtime();
  useSubscriptionRealtime();
}

/**
 * Hook per la pagina profilo/account.
 * Include anche le transazioni crediti.
 */
export function useProfilePageRealtime() {
  useSyncUserProfileRealtime();
  useCreditTransactionsRealtime();
  useSubscriptionRealtime();
}
