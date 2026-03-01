'use client';

import { useTranslations } from 'next-intl';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { cn } from '@giulio-leone/lib-design-system';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@giulio-leone/ui';
import { BrainIcon, ChevronDownIcon, SparklesIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, memo, useContext, useEffect, useState } from 'react';
import { Streamdown } from 'streamdown';
import { Shimmer } from './shimmer';

/**
 * Reasoning Component - AI Elements v6
 *
 * Displays AI reasoning/thinking process with glassmorphism styling,
 * collapsible content, and streaming support.
 *
 * @see https://v6.ai-sdk.dev/elements/components/reasoning
 */

type ReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number | undefined;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

export const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error('Reasoning components must be used within Reasoning');
  }
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

const AUTO_CLOSE_DELAY = 1000;
const MS_IN_S = 1000;

export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = true,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: ReasoningProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });
    const [duration, setDuration] = useControllableState({
      prop: durationProp,
      defaultProp: undefined,
    });

    const [hasAutoClosed, setHasAutoClosed] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Track duration when streaming starts and ends
    useEffect(() => {
      if (isStreaming) {
        if (startTime === null) {
          queueMicrotask(() => setStartTime(Date.now()));
        }
      } else if (startTime !== null) {
        queueMicrotask(() => {
          setDuration(Math.ceil((Date.now() - startTime) / MS_IN_S));
          setStartTime(null);
        });
      }
    }, [isStreaming, startTime, setDuration]);

    // Auto-open when streaming starts, auto-close when streaming ends (once only)
    useEffect(() => {
      if (defaultOpen && !isStreaming && isOpen && !hasAutoClosed) {
        const timer = setTimeout(() => {
          setIsOpen(false);
          setHasAutoClosed(true);
        }, AUTO_CLOSE_DELAY);

        return () => clearTimeout(timer);
      }
      return undefined;
    }, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosed]);

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen);
    };

    return (
      <ReasoningContext.Provider value={{ isStreaming, isOpen, setIsOpen, duration }}>
        <Collapsible
          className={cn(
            // Base
            'not-prose mb-4 overflow-hidden rounded-xl',
            // Glassmorphism
            'bg-gradient-to-br from-violet-500/5 to-secondary-500/5',
            'dark:from-violet-500/10 dark:to-secondary-500/10',
            'backdrop-blur-sm',
            'border border-violet-200/30 dark:border-violet-500/20',
            // Animation
            'transition-all duration-300',
            className
          )}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    );
  }
);

export type ReasoningTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
};

export const ReasoningTrigger = memo(
  ({ className, children, getThinkingMessage, ...props }: ReasoningTriggerProps) => {
    const { isStreaming, isOpen, duration } = useReasoning();
    const t = useTranslations('common');

    const defaultGetThinkingMessage = (isStreaming: boolean, duration?: number) => {
      if (isStreaming || duration === 0) {
        return <Shimmer duration={1}>{t('reasoning.sto_pensando')}</Shimmer>;
      }
      if (duration === undefined) {
        return <p>{t('reasoning.ho_riflettuto_per_qualche_secondo')}</p>;
      }
      return (
        <p>
          {t('reasoning.ho_riflettuto_per')}
          {duration} secondi
        </p>
      );
    };

    const thinkingMessageRenderer = getThinkingMessage || defaultGetThinkingMessage;

    return (
      <CollapsibleTrigger
        className={cn(
          // Layout
          'flex w-full items-center gap-3 px-4 py-3',
          // Typography
          'text-sm font-medium',
          // Colors
          'text-violet-700 dark:text-violet-300',
          // Hover
          'hover:bg-violet-500/5 dark:hover:bg-violet-500/10',
          // Focus
          'focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:outline-none',
          'rounded-t-xl',
          // Transition
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            {isStreaming ? (
              <SparklesIcon className="size-4 animate-pulse text-violet-500" />
            ) : (
              <BrainIcon className="size-4 text-violet-500" />
            )}
            <span className="flex-1 text-left">
              {thinkingMessageRenderer(isStreaming, duration)}
            </span>
            <ChevronDownIcon
              className={cn(
                'size-4 text-violet-500 transition-transform duration-300',
                isOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </>
        )}
      </CollapsibleTrigger>
    );
  }
);

export type ReasoningContentProps = ComponentProps<typeof CollapsibleContent> & {
  children: string;
};

export const ReasoningContent = memo(({ className, children, ...props }: ReasoningContentProps) => (
  <CollapsibleContent
    className={cn(
      // Layout
      'px-4 pt-0 pb-4',
      // Typography
      'text-sm leading-relaxed',
      'text-neutral-600 dark:text-neutral-400',
      // Animation
      'data-[state=closed]:animate-out data-[state=open]:animate-in',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
      'outline-none',
      className
    )}
    {...props}
  >
    <div className="border-t border-violet-200/30 pt-2 dark:border-violet-500/20">
      <Streamdown
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none',
          'prose-p:text-neutral-600 prose-p:dark:text-neutral-400',
          '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0'
        )}
        {...props}
      >
        {children}
      </Streamdown>
    </div>
  </CollapsibleContent>
));

Reasoning.displayName = 'Reasoning';
ReasoningTrigger.displayName = 'ReasoningTrigger';
ReasoningContent.displayName = 'ReasoningContent';
