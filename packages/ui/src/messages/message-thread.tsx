/**
 * Message Thread Component
 *
 * Display messages in a conversation with infinite scroll
 */

'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useDirectMessages, useMarkMessageAsRead } from '@giulio-leone/lib-api/hooks';
import { useDirectMessagesSync } from '@giulio-leone/lib-stores';
import { useQueryClient } from '@tanstack/react-query';
import { LoadingState, ErrorState } from '@giulio-leone/ui/components';
import { Avatar } from '@giulio-leone/ui';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { directMessagingKeys } from '@giulio-leone/lib-api';
import { MessageActions } from './message-actions';
import { Star, CheckCheck } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
}

export function MessageThread({ conversationId, currentUserId }: MessageThreadProps) {
  const t = useTranslations('directMessages');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const markAsRead = useMarkMessageAsRead();

  const { data: messagesData, isLoading, error } = useDirectMessages(conversationId, 1, 50);

  // Sync messages with realtime
  useDirectMessagesSync({
    conversationId,
    queryKey: directMessagingKeys.messages(conversationId, 1, 50),
    queryClient,
    enabled: !!conversationId,
  });

  const messages = useMemo(() => messagesData?.messages ?? [], [messagesData?.messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (!conversationId || !messages.length) return;

    // Mark unread messages as read
    const unreadMessages = messages.filter((msg: any) => msg.senderId !== currentUserId && !msg.isRead);

    unreadMessages.forEach((msg: any) => {
      markAsRead.mutate({
        messageId: msg.id,
        conversationId,
      });
    });
  }, [conversationId, messages, currentUserId, markAsRead]);

  const dateLocale = locale === 'it' ? it : enUS;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingState message={t('loading')} size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <ErrorState error={error} title={t('errorLoading')} message={t('errorLoadingDetails')} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('emptyState.noMessages')}
          </p>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            {t('emptyState.startConversation')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message: any) => {
          const isOwn = message.senderId === currentUserId;
          const isImportant = message.isImportant;

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isOwn && (
                <Avatar
                  src={message.sender.image}
                  fallback={message.sender.name?.[0] || 'U'}
                  size="sm"
                />
              )}
              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                {!isOwn && (
                  <span className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {message.sender.name || tCommon('header.user')}
                  </span>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-900 dark:bg-white/[0.04] dark:text-neutral-100'
                  } ${isImportant ? 'ring-2 ring-yellow-500' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {isImportant && <Star size={14} className="fill-yellow-500 text-yellow-500" />}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span className="text-xs opacity-70">
                      {format(new Date(message.createdAt), 'HH:mm', { locale: dateLocale })}
                    </span>
                    {isOwn && message.isRead && <CheckCheck size={14} className="opacity-70" />}
                  </div>
                </div>
                <MessageActions message={message} isOwn={isOwn} conversationId={conversationId} />
              </div>
            </div>
          );
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
