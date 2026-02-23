/**
 * useChatRealtime Hook - Consolidated
 *
 * Hook UNICO per sincronizzazione TRUE realtime delle conversazioni e messaggi chat.
 * Aggiorna direttamente lo store Zustand (SSOT) invece di React Query.
 *
 * PRINCIPI:
 * - KISS: Un solo hook per tutto il realtime chat
 * - SOLID: Single Responsibility - solo sync realtime verso store
 * - DRY: Evita listener duplicati usando un unico hook
 *
 * ARCHITETTURA:
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    Supabase Realtime                        │
 * │  ┌───────────────────┐  ┌───────────────────────────────┐  │
 * │  │ conversations     │  │ conversation_messages         │  │
 * │  │ user_id=eq.xxx    │  │ conversation_id=eq.xxx        │  │
 * │  └─────────┬─────────┘  └─────────────┬─────────────────┘  │
 * └────────────┼──────────────────────────┼────────────────────┘
 *              │                          │
 *              v                          v
 * ┌────────────────────────────────────────────────────────────┐
 * │                    useChatStore (Zustand)                   │
 * │  conversations[] | currentConversationId | messages[]      │
 * └────────────────────────────────────────────────────────────┘
 * ```
 */

'use client';

import { useCallback } from 'react';
import { useRealtimeSubscription, useChatStore } from '@giulio-leone/lib-stores';

import { logger } from '@giulio-leone/lib-shared';
// ============================================================================
// Types
// ============================================================================

/** Record dal database conversations */
interface ConversationRecord {
  id: string;
  user_id: string;
  title?: string;
  domain?: string;
  preview?: string;
  last_message_at?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/** Record dal database conversation_messages */
interface ConversationMessageRecord {
  id: string;
  conversation_id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
  content: string;
  sequence?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ============================================================================
// Query Keys (per compatibilità con React Query se necessario)
// ============================================================================

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...chatKeys.conversations(), id] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
} as const;

// ============================================================================
// Helpers
// ============================================================================

/** Trasforma record DB in formato store per conversazioni */
function transformConversation(record: ConversationRecord) {
  return {
    id: record.id,
    title: record.title || 'Nuova conversazione',
    preview: record.preview || '',
    updatedAt: record.updated_at ? new Date(record.updated_at) : new Date(),
    domain: record.domain,
  };
}

/** Trasforma record DB in formato store per messaggi */
function transformMessage(record: ConversationMessageRecord) {
  return {
    id: record.id,
    role: record.role.toLowerCase() as 'user' | 'assistant' | 'system' | 'tool',
    content: record.content,
    createdAt: record.created_at ? new Date(record.created_at) : new Date(),
  };
}

// ============================================================================
// Main Hook - Conversations Realtime
// ============================================================================

/**
 * Hook per sincronizzazione realtime della lista conversazioni.
 * Aggiorna direttamente useChatStore.
 *
 * @param userId - ID dell'utente corrente
 */
export function useConversationsRealtimeStore(userId: string | null | undefined) {
  const addConversation = useChatStore((state) => state.addConversation);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const removeConversation = useChatStore((state) => state.removeConversation);

  // Stable callbacks con useCallback
  const handleInsert = useCallback(
    (record: ConversationRecord) => {
      logger.warn('[ChatRealtime] Conversation INSERT:', record.id);
      addConversation(transformConversation(record));
    },
    [addConversation]
  );

  const handleUpdate = useCallback(
    (record: ConversationRecord) => {
      logger.warn('[ChatRealtime] Conversation UPDATE:', record.id);
      updateConversation(record.id, transformConversation(record));
    },
    [updateConversation]
  );

  const handleDelete = useCallback(
    (record: ConversationRecord) => {
      logger.warn('[ChatRealtime] Conversation DELETE:', record.id);
      removeConversation(record.id);
    },
    [removeConversation]
  );

  useRealtimeSubscription<ConversationRecord>({
    table: 'conversations',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onError: (error) => {
      logger.error('[ChatRealtime] Conversations error:', error);
    },
  });
}

// ============================================================================
// Main Hook - Messages Realtime
// ============================================================================

/**
 * Hook per sincronizzazione realtime dei messaggi della conversazione corrente.
 * Aggiorna direttamente useChatStore.
 *
 * @param conversationId - ID della conversazione corrente
 */
export function useMessagesRealtimeStore(conversationId: string | null | undefined) {
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const removeMessage = useChatStore((state) => state.removeMessage);
  const updateConversation = useChatStore((state) => state.updateConversation);

  // Stable callbacks con useCallback
  const handleInsert = useCallback(
    (record: ConversationMessageRecord) => {
      logger.warn(`[ChatRealtime] Message INSERT: ${record.id} ${record.role}`);
      addMessage(transformMessage(record));

      // Aggiorna anche il preview della conversazione
      if (record.conversation_id) {
        updateConversation(record.conversation_id, {
          preview: record.content.substring(0, 100),
          updatedAt: record.created_at ? new Date(record.created_at) : new Date(),
        });
      }
    },
    [addMessage, updateConversation]
  );

  const handleUpdate = useCallback(
    (record: ConversationMessageRecord) => {
      logger.warn('[ChatRealtime] Message UPDATE:', record.id);
      updateMessage(record.id, transformMessage(record));
    },
    [updateMessage]
  );

  const handleDelete = useCallback(
    (record: ConversationMessageRecord) => {
      logger.warn('[ChatRealtime] Message DELETE:', record.id);
      removeMessage(record.id);
    },
    [removeMessage]
  );

  useRealtimeSubscription<ConversationMessageRecord>({
    table: 'conversation_messages',
    filter: conversationId ? `conversation_id=eq.${conversationId}` : undefined,
    enabled: !!conversationId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onError: (error) => {
      logger.error('[ChatRealtime] Messages error:', error);
    },
  });
}

// ============================================================================
// Combined Hook - All Chat Realtime
// ============================================================================

/**
 * Hook MASTER che abilita TUTTO il realtime per la chat.
 * UN SOLO hook da usare nella pagina /chat.
 *
 * IMPORTANTE: Questo sostituisce tutti i vecchi hook separati:
 * - useConversationsRealtime (deprecato)
 * - useConversationMessagesRealtime (deprecato)
 * - useChatRealtimeCallbacks (deprecato)
 *
 * @param userId - ID dell'utente corrente
 * @param conversationId - ID della conversazione corrente (opzionale)
 *
 * @example
 * ```tsx
 * function ChatPage() {
 *   const userId = useAuthStore(state => state.user?.id);
 *   const conversationId = useChatStore(state => state.currentConversationId);
 *
 *   // UN SOLO hook per tutto il realtime chat
 *   useChatRealtimeStore(userId, conversationId);
 *
 *   // ... rest of the component
 * }
 * ```
 */
export function useChatRealtimeStore(
  userId: string | null | undefined,
  conversationId?: string | null
) {
  // Sottoscrizione alle conversazioni dell'utente
  useConversationsRealtimeStore(userId);

  // Sottoscrizione ai messaggi della conversazione corrente
  useMessagesRealtimeStore(conversationId);
}
