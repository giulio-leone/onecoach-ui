/**
 * MessageBubble Component
 *
 * Componente per visualizzare messaggi chat
 * Segue SRP
 */

'use client';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import type { Message } from "@giulio-leone/types/chat";

export interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

export const MessageBubble = ({ message, isUser }: MessageBubbleProps) => {
  return (
    <div className={cn('animate-fadeIn flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl p-4 shadow-lg sm:max-w-[75%]',
          isUser
            ? cn(
                'rounded-br-md bg-gradient-to-br from-primary-500 to-indigo-600',
                'dark:from-primary-600 dark:to-indigo-700',
                'border border-primary-400/20 text-white dark:border-primary-500/30',
                'shadow-md dark:shadow-lg dark:shadow-primary-950/30'
              )
            : cn(
                'rounded-bl-md border',
                darkModeClasses.chat.assistantBubble,
                'shadow-sm dark:shadow-lg dark:shadow-neutral-950/30'
              )
        )}
      >
        <p
          className={cn(
            'text-sm whitespace-pre-wrap sm:text-base',
            isUser ? 'text-white' : darkModeClasses.text.primary
          )}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
};
