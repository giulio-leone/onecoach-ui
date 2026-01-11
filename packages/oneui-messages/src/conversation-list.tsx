/**
 * Conversation List Component
 *
 * Display list of conversations with unread badges and priority indicators
 */
'use client';
import { Avatar, Badge, Card } from '@onecoach/ui';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import type { DirectConversationWithUser } from '@onecoach/lib-core';
import { BellOff, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface ConversationListProps {
  conversations: DirectConversationWithUser[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUserId: string;
  role: 'COACH' | 'USER';
}
export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  role,
}: ConversationListProps) {
  const tCommon = useTranslations('common');
  const getOtherUser = (conversation: DirectConversationWithUser) => {
    if (conversation.coach?.id === currentUserId) {
      return conversation.athlete;
    }
    if (conversation.athlete?.id === currentUserId) {
      return conversation.coach;
    }
    return role === 'COACH' ? conversation.athlete : conversation.coach;
  };
  const getLastMessagePreview = (conversation: DirectConversationWithUser) => {
    if (!conversation.lastMessage) {
      return tCommon('ui.noMessage');
    }
    return (
      conversation.lastMessage.content.substring(0, 50) +
      (conversation.lastMessage.content.length > 50 ? '...' : '')
    );
  };
  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {tCommon('ui.noConversation')}
          </p>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            {role === 'COACH'
              ? 'Inizia una conversazione con un atleta'
              : 'Il tuo coach ti contatterà qui'}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const otherUser = getOtherUser(conversation);
        const isSelected = conversation.id === selectedConversationId;
        const unreadCount = conversation.unreadCount || 0;
        const lastMessage = conversation.lastMessage;
        return (
          <Card
            key={conversation.id}
            variant={isSelected ? 'default' : 'hover'}
            className={`cursor-pointer border-l-4 ${
              isSelected
                ? 'border-l-primary-500 bg-primary-50 dark:bg-primary-950'
                : conversation.priority === 'HIGH'
                  ? 'border-l-red-500'
                  : conversation.priority === 'MEDIUM'
                    ? 'border-l-yellow-500'
                    : 'border-l-transparent'
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-start gap-3 p-4">
              <Avatar src={otherUser.image} fallback={otherUser.name?.[0] || 'U'} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-semibold">{otherUser.name || 'Utente'}</h3>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    {conversation.isMuted && <BellOff size={14} className="text-neutral-400" />}
                    {conversation.priority === 'HIGH' && (
                      <Star size={14} className="fill-yellow-500 text-yellow-500" />
                    )}
                    {lastMessage && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1 truncate text-sm text-neutral-600 dark:text-neutral-400">
                  {getLastMessagePreview(conversation)}
                </p>
                {unreadCount > 0 && (
                  <div className="mt-2">
                    <Badge variant="default" size="sm">
                      {unreadCount} {tCommon('conversation_list.non_letti')}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
