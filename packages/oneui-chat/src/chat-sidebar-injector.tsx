'use client';

/**
 * ChatSidebarInjector
 *
 * Inietta la ConversationList nella sidebar globale dell'app
 * quando l'utente è nella pagina chat.
 *
 * INTEGRAZIONE:
 * - Usa useSidebarStore.setExtraContent per iniettare contenuto
 * - Rimuove automaticamente il contenuto quando il componente viene smontato
 * - Fornisce la lista conversazioni con tutti i controlli CRUD
 * - Chiude la sidebar mobile dopo la selezione di una conversazione
 */

import { useEffect, memo, useMemo, useCallback, useState } from 'react';
import { useSidebarStore, useUIStore } from '@onecoach/lib-stores';
import { ConversationList, type ConversationListItem } from '@onecoach/ui';

import { logger } from '@onecoach/lib-shared';
interface ChatSidebarInjectorProps {
  conversations: ConversationListItem[];
  activeId: string | null;
  onSelect: (id: string) => Promise<void>;
  onNewChat: () => void;
  onDelete: (id: string) => Promise<void>;
  onDeleteSelected: (ids: string[]) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  isDeleting: boolean;
}

/**
 * Componente che inietta la lista conversazioni nella sidebar globale.
 * Usa memo per evitare re-render inutili.
 */
export const ChatSidebarInjector = memo(function ChatSidebarInjector({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onDeleteSelected,
  onDeleteAll,
  isDeleting,
}: ChatSidebarInjectorProps) {
  const setExtraContent = useSidebarStore((state) => state.setExtraContent);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Handler per la selezione della conversazione che chiude la sidebar mobile
  const handleSelect = useCallback(
    async (id: string) => {
      setIsLoadingConversation(true);
      try {
        // Prima chiudi la sidebar mobile per feedback immediato
        setMobileMenuOpen(false);
        // Poi carica la conversazione
        await onSelect(id);
      } catch (error) {
        logger.error('Error loading conversation:', error);
      } finally {
        setIsLoadingConversation(false);
      }
    },
    [onSelect, setMobileMenuOpen]
  );

  // Handler per nuova chat che chiude la sidebar mobile
  const handleNewChat = useCallback(() => {
    setMobileMenuOpen(false);
    onNewChat();
  }, [onNewChat, setMobileMenuOpen]);

  // Memoizza il contenuto per evitare re-render della sidebar
  const sidebarContent = useMemo(
    () => (
      <div className="flex h-full flex-col overflow-hidden pt-2">
        <div className="min-h-0 flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
            onDelete={(id) => {
              void onDelete(id);
            }}
            onDeleteSelected={(ids) => {
              void onDeleteSelected(ids);
            }}
            onDeleteAll={() => {
              void onDeleteAll();
            }}
            isDeleting={isDeleting}
            isLoading={isLoadingConversation}
          />
        </div>
      </div>
    ),
    [
      conversations,
      activeId,
      handleSelect,
      handleNewChat,
      onDelete,
      onDeleteSelected,
      onDeleteAll,
      isDeleting,
      isLoadingConversation,
    ]
  );

  useEffect(() => {
    setExtraContent(sidebarContent);
    return () => setExtraContent(null);
  }, [sidebarContent, setExtraContent]);

  return null;
});
