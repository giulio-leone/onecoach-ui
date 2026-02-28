'use client';

import { cn } from '@giulio-leone/lib-design-system';
import { Button } from '@giulio-leone/ui';
import { ArrowDownIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useCallback } from 'react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';


/**
 * Conversation Component - AI Elements v6
 *
 * Glassmorphism-enabled conversation container with auto-scroll,
 * smooth animations, and premium visual effects.
 *
 * @see https://v6.ai-sdk.dev/elements/components/conversation
 */

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn(
      // Base layout
      'relative flex-1 overflow-x-hidden overflow-y-auto',
      // Smooth scrolling
      'scrollbar-thin scrollbar-track-transparent scroll-smooth',
      'scrollbar-thumb-neutral-300/50 dark:scrollbar-thumb-neutral-700/50',
      'hover:scrollbar-thumb-neutral-400/70 dark:hover:scrollbar-thumb-neutral-600/70',
      className
    )}
    initial="smooth"
    resize="smooth"
    role="log"
    aria-live="polite"
    aria-label="Conversazione chat"
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>;

export const ConversationContent = ({ className, ...props }: ConversationContentProps) => (
  <StickToBottom.Content
    className={cn(
      // Layout
      'flex flex-col gap-4 p-4',
      // Responsive spacing
      'sm:gap-6 sm:p-6',
      'lg:gap-8 lg:p-8',
      // Animation for new messages
      '[&>*]:animate-in [&>*]:fade-in-0 [&>*]:slide-in-from-bottom-2',
      '[&>*]:duration-300 [&>*]:ease-out',
      className
    )}
    {...props}
  />
);

export type ConversationEmptyStateProps = ComponentProps<'div'> & {
  title?: string;
  description?: string;
  icon?: ReactNode;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
};

export const ConversationEmptyState = ({
  className,
  title = 'Inizia una conversazione',
  description = 'Scrivi un messaggio per iniziare a chattare',
  icon,
  suggestions,
  onSuggestionClick,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      // Layout
      'flex size-full flex-col items-center justify-center gap-6 p-8 text-center',
      // Animation
      'animate-in fade-in-0 zoom-in-95 duration-500',
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {/* Icon with glow effect */}
        {icon && (
          <div
            className={cn(
              'relative',
              // Glassmorphism container
              'rounded-2xl p-4',
              'from-primary-500/10 to-secondary-500/10 bg-gradient-to-br',
              'dark:from-primary-500/20 dark:to-secondary-500/20',
              // Border
              'ring-primary-500/20 ring-1',
              // Glow
              'shadow-primary-500/10 shadow-lg'
            )}
          >
            <div className="text-primary-600 dark:text-primary-400">{icon}</div>
            {/* Animated glow */}
            <div className="animate-pulse-slow from-primary-500/20 to-secondary-500/20 absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br blur-xl" />
          </div>
        )}

        {/* Text content */}
        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
          {description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          )}
        </div>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion: any) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick?.(suggestion)}
                className={cn(
                  // Base
                  'rounded-full px-4 py-2 text-sm font-medium',
                  // Colors
                  'bg-neutral-100 text-neutral-700',
                  'dark:bg-white/[0.04] dark:text-neutral-300',
                  // Hover
                  'hover:bg-primary-50 hover:text-primary-700',
                  'dark:hover:bg-primary-900/30 dark:hover:text-primary-300',
                  // Transition
                  'transition-all duration-200',
                  // Focus
                  'focus-visible:ring-primary-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  'dark:focus-visible:ring-offset-neutral-900'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  if (isAtBottom) return null;

  return (
    <Button
      className={cn(
        // Position
        'absolute bottom-4 left-1/2 -translate-x-1/2',
        // Size
        'size-10',
        // Glassmorphism
        'bg-white/80 dark:bg-neutral-900/80',
        'backdrop-blur-lg',
        'border border-neutral-200/50 dark:border-white/[0.08]',
        // Shadow
        'shadow-lg shadow-neutral-900/10 dark:shadow-neutral-900/30',
        // Hover
        'hover:bg-white hover:shadow-xl',
        'dark:hover:bg-white/[0.06]',
        // Animation
        'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
        'transition-all',
        className
      )}
      onClick={handleScrollToBottom}
      size="icon"
      type="button"
      variant="outline"
      aria-label="Scorri verso il basso"
      {...props}
    >
      <ArrowDownIcon className="size-4" />
    </Button>
  );
};
