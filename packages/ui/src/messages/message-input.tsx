/**
 * Message Input Component
 *
 * Input for sending messages with important toggle
 */
'use client';
import { useState, type KeyboardEvent } from 'react';
import { Button, Textarea } from '@giulio-leone/ui';
import { useSendDirectMessage } from '@giulio-leone/lib-api/hooks';
import { Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@giulio-leone/lib-shared';
import { useTranslations } from 'next-intl';

export interface MessageInputProps {
  conversationId: string;
  disabled?: boolean;
}

export function MessageInput({ conversationId, disabled }: MessageInputProps) {
  const t = useTranslations('directMessages');
  const tCommon = useTranslations('common');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const sendMessage = useSendDirectMessage();

  const handleSend = async () => {
    if (!content.trim() || disabled) return;
    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: content.trim(),
        isImportant,
      });
      setContent('');
      setIsImportant(false);
    } catch (error) {
      toast.error(tCommon('toasts.messageSendError'));
      logger.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-200/60 p-4 dark:border-white/[0.06]">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('input.placeholder')}
            rows={1}
            className="min-h-[60px] resize-none"
            disabled={disabled || sendMessage.isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsImportant(!isImportant)}
            className={isImportant ? 'text-yellow-500' : ''}
            disabled={disabled || sendMessage.isPending}
            icon={Star}
            title={isImportant ? t('actions.removeImportant') : t('actions.markImportant')}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!content.trim() || disabled || sendMessage.isPending}
            icon={Send}
          >
            {sendMessage.isPending ? t('input.sending') : t('input.send')}
          </Button>
        </div>
      </div>
      {isImportant && (
        <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
          {t('input.importantHint')}
        </p>
      )}
    </div>
  );
}
