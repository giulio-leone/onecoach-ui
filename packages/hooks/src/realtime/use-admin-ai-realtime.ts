'use client';

/**
 * Admin AI Realtime Hook
 *
 * Sincronizza le configurazioni AI (modelli, feature flags, ecc.)
 * Usa router.refresh() perché la pagina usa Server Components + Props
 * invece di React Query per il data fetching iniziale.
 */

import { useRouter } from 'next/navigation';
import { useRealtimeSubscription } from '@giulio-leone/lib-stores';

export function useAdminAIRealtime() {
  const router = useRouter();

  // Sincronizzazione Modelli AI
  useRealtimeSubscription({
    table: 'ai_chat_models',
    onInsert: () => router.refresh(),
    onUpdate: () => router.refresh(),
    onDelete: () => router.refresh(),
  });

  // Sincronizzazione Configurazioni Feature
  useRealtimeSubscription({
    table: 'ai_chat_feature_configs',
    onInsert: () => router.refresh(),
    onUpdate: () => router.refresh(),
    onDelete: () => router.refresh(),
  });

  // Sincronizzazione Accessi Modelli
  useRealtimeSubscription({
    table: 'ai_chat_model_access',
    onInsert: () => router.refresh(),
    onUpdate: () => router.refresh(),
    onDelete: () => router.refresh(),
  });
}
