/**
 * Message Actions Component
 *
 * Context menu for message actions (important, report, delete, copy)
 */

'use client';

import { Button } from '@giulio-leone/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import {
  useMarkMessageImportant,
  useReportMessage,
  useDeleteDirectMessage,
} from '@giulio-leone/lib-api/hooks';
import { MoreVertical, Star, Flag, Trash2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DirectMessageWithSender } from '@giulio-leone/lib-core';

export interface MessageActionsProps {
  message: DirectMessageWithSender;
  isOwn: boolean;
  conversationId: string;
}

export function MessageActions({ message, isOwn, conversationId }: MessageActionsProps) {
  const t = useTranslations('directMessages');
  const tCommon = useTranslations('common');
  const [copied, setCopied] = useState(false);
  const markImportant = useMarkMessageImportant();
  const reportMessage = useReportMessage();
  const deleteMessage = useDeleteDirectMessage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success(t('toasts.messageCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : tCommon('errors.copyFailed');
      toast.error(messageText);
    }
  };

  const handleMarkImportant = async () => {
    try {
      await markImportant.mutateAsync({
        messageId: message.id,
        conversationId,
        isImportant: !message.isImportant,
      });
      toast.success(
        message.isImportant ? tCommon('toasts.importantRemoved') : tCommon('toasts.importantAdded')
      );
    } catch (error) {
      const messageText = error instanceof Error ? error.message : tCommon('errors.updateFailed');
      toast.error(messageText);
    }
  };

  const handleReport = async () => {
    const reason = prompt(t('confirmations.reportReason'));
    if (!reason) return;

    try {
      await reportMessage.mutateAsync({
        messageId: message.id,
        conversationId,
        reason,
      });
      toast.success(t('toasts.messageReported'));
    } catch (error) {
      const messageText = error instanceof Error ? error.message : tCommon('errors.reportFailed');
      toast.error(messageText);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmations.deleteMessage'))) return;

    try {
      await deleteMessage.mutateAsync({
        messageId: message.id,
        conversationId,
      });
      toast.success(t('toasts.messageDeleted'));
    } catch (error) {
      const messageText = error instanceof Error ? error.message : tCommon('errors.deleteFailed');
      toast.error(messageText);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          icon={MoreVertical}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <>
              <Check size={16} className="mr-2" />
              {t('actions.copied')}
            </>
          ) : (
            <>
              <Copy size={16} className="mr-2" />
              {t('actions.copyText')}
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMarkImportant}>
          {message.isImportant ? (
            <>
              <Star size={16} className="mr-2" />
              {t('actions.removeImportant')}
            </>
          ) : (
            <>
              <Star size={16} className="mr-2 fill-yellow-500 text-yellow-500" />
              {t('actions.markImportant')}
            </>
          )}
        </DropdownMenuItem>
        {!isOwn && (
          <DropdownMenuItem onClick={handleReport}>
            <Flag size={16} className="mr-2" />
            {t('actions.report')}
          </DropdownMenuItem>
        )}
        {isOwn && (
          <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
            <Trash2 size={16} className="mr-2" />
            {t('actions.deleteMessage')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
