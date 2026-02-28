/**
 * Reasoning Component
 *
 * Collapsible per chain-of-thought / reasoning AI.
 */

'use client';

import { useState, forwardRef, type ComponentProps, type ReactNode } from 'react';
import { Brain, ChevronDown } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

// ============================================================================
// Reasoning Container
// ============================================================================

export interface ReasoningProps extends ComponentProps<'div'> {
  isStreaming?: boolean;
  duration?: number;
  children: ReactNode;
}

export const Reasoning = forwardRef<HTMLDivElement, ReasoningProps>(
  ({ isStreaming = false, duration, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-neutral-200 bg-neutral-50',
        'dark:border-neutral-700 dark:bg-neutral-800/30',
        className
      )}
      data-streaming={isStreaming}
      {...props}
    >
      {children}
    </div>
  )
);
Reasoning.displayName = 'Reasoning';

// ============================================================================
// Reasoning Trigger (toggle button)
// ============================================================================

export interface ReasoningTriggerProps extends ComponentProps<'button'> {
  duration?: number;
}

export const ReasoningTrigger = forwardRef<HTMLButtonElement, ReasoningTriggerProps>(
  ({ duration, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between px-3 py-2',
          'text-left transition-colors',
          'hover:bg-neutral-100 dark:hover:bg-neutral-700/50',
          className
        )}
        data-state={isOpen ? 'open' : 'closed'}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-secondary-500" />
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            💭 Ragionamento AI
          </span>
          {duration && (
            <span className="text-xs text-neutral-400">({Math.round(duration / 1000)}s)</span>
          )}
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-neutral-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
    );
  }
);
ReasoningTrigger.displayName = 'ReasoningTrigger';

// ============================================================================
// Reasoning Content
// ============================================================================

export interface ReasoningContentProps extends ComponentProps<'div'> {
  children: ReactNode;
}

export const ReasoningContent = forwardRef<HTMLDivElement, ReasoningContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid transition-all duration-200 ease-out',
        'grid-rows-[1fr] opacity-100',
        'data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0',
        className
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div className="border-t border-neutral-200 px-3 py-2 dark:border-neutral-700">
          <p className="text-xs leading-relaxed text-neutral-600 italic dark:text-neutral-300">
            {children}
          </p>
        </div>
      </div>
    </div>
  )
);
ReasoningContent.displayName = 'ReasoningContent';

// ============================================================================
// Inline Reasoning Bubble (compact version for message parts)
// ============================================================================

export interface ReasoningBubbleProps {
  text: string;
  isStreaming?: boolean;
}

export function ReasoningBubble({ text, isStreaming }: ReasoningBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
      >
        <div className="flex items-center gap-2">
          <Brain className={cn('h-4 w-4 text-secondary-500', isStreaming && 'animate-pulse')} />
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            💭 Ragionamento AI
          </span>
          {isStreaming && (
            <span className="animate-pulse text-xs text-secondary-500">in corso...</span>
          )}
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-neutral-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-200 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-neutral-200 dark:border-neutral-700">
            <p className="px-3 py-2 text-xs leading-relaxed text-neutral-600 italic dark:text-neutral-300">
              {text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
