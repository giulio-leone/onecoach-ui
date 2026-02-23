'use client';

/**
 * Sync dei crediti utente tra Supabase Realtime e lo store Auth del client.
 *
 * - Ascolta gli UPDATE sulla tabella `users` per l'utente corrente
 * - Quando cambiano i crediti, aggiorna `useAuthStore.user.credits`
 * - Questo rende reattivi header, sidebar, dashboard, ecc.
 *
 * NOTA: Usa lo store Zustand centralizzato per Realtime.
 */

import { useCallback } from 'react';
import { useAuthStore, useSyncField } from '@giulio-leone/lib-stores';

import { logger } from '@giulio-leone/lib-shared';
interface UserRecord {
  credits: number | null;
  [key: string]: unknown;
}

export function useSyncCreditsRealtime() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const userId = user?.id;
  const currentCredits = user?.credits;

  // Callback memoizzato per aggiornare lo store
  const handleCreditsUpdate = useCallback(
    (newCredits: number | null) => {
      if (typeof newCredits === 'number' && newCredits !== currentCredits) {
        logger.warn(`[Realtime] Credits updated: ${currentCredits} -> ${newCredits}`);
        updateUser({ credits: newCredits });
      }
    },
    [currentCredits, updateUser]
  );

  useSyncField<UserRecord, 'credits'>({
    table: 'users',
    filter: userId ? `id=eq.${userId}` : undefined,
    enabled: !!userId,
    field: 'credits',
    currentValue: currentCredits ?? undefined,
    onSync: handleCreditsUpdate,
    onError: (error) => {
      logger.error('[Realtime] Credits sync error:', error);
    },
  });
}
