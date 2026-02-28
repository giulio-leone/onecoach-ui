/**
 * Conversation Header Component
 *
 * Header with user info and action menu (mute, priority, report, delete)
 */
'use client';
import { Avatar, Button } from '@giulio-leone/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import {
  useUpdateConversationSettings,
  useDeleteDirectConversation,
} from '@giulio-leone/lib-api/hooks';
import { useRouter } from 'app/navigation';
import { MoreVertical, BellOff, Bell, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { DirectConversationWithUser } from '@giulio-leone/lib-core';
import type { ConversationPriority } from '@prisma/client';

export interface ConversationHeaderProps {
  conversation: DirectConversationWithUser;
  currentUserId: string;
}

export function ConversationHeader({ conversation, currentUserId }: ConversationHeaderProps) {
  const t = useTranslations('directMessages');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const updateSettings = useUpdateConversationSettings();
  const deleteConversation = useDeleteDirectConversation();

  const otherUser =
    conversation.coachId === currentUserId ? conversation.athlete : conversation.coach;

  const handleToggleMute = async () => {
    try {
      await updateSettings.mutateAsync({
        conversationId: conversation.id,
        data: { isMuted: !conversation.isMuted },
      });
      toast.success(conversation.isMuted ? t('toasts.unmuted') : t('toasts.muted'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.updateFailed');
      toast.error(message);
    }
  };

  const handleSetPriority = async (priority: ConversationPriority) => {
    try {
      await updateSettings.mutateAsync({
        conversationId: conversation.id,
        data: { priority },
      });
      toast.success(t('toasts.prioritySet', { priority: t(`priority.${priority}`) }));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.updateFailed');
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmations.deleteConversation'))) return;
    try {
      await deleteConversation.mutateAsync(conversation.id);
      toast.success(t('toasts.conversationDeleted'));
      router.push('/messages');
    } catch (error) {
      const message = error instanceof Error ? error.message : tCommon('errors.deleteFailed');
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-neutral-200/60 p-4 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <Avatar src={otherUser.image} fallback={otherUser.name?.[0] || 'U'} size="md" />
        <div>
          <h2 className="font-semibold">{otherUser.name || t('header.user')}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{otherUser.email}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" icon={MoreVertical} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleToggleMute}>
            {conversation.isMuted ? (
              <>
                <Bell size={16} className="mr-2" />
                {t('actions.unmute')}
              </>
            ) : (
              <>
                <BellOff size={16} className="mr-2" />
                {t('actions.mute')}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetPriority('HIGH')}>
            <Star size={16} className="mr-2 fill-yellow-500 text-yellow-500" />
            {t('actions.priorityHigh')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetPriority('MEDIUM')}>
            <Star size={16} className="mr-2" />
            {t('actions.priorityMedium')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSetPriority('LOW')}>
            <Star size={16} className="mr-2" />
            {t('actions.priorityLow')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
            <Trash2 size={16} className="mr-2" />
            {t('actions.deleteConversation')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
