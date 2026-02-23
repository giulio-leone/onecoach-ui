/**
 * Loader Component
 *
 * Streaming indicators for AI response loading states.
 */

'use client';

import { forwardRef, type ComponentProps } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

// ============================================================================
// Streaming Dots Loader
// ============================================================================

export interface StreamingDotsProps extends ComponentProps<'div'> {
  size?: 'sm' | 'md' | 'lg';
}

export const StreamingDots = forwardRef<HTMLDivElement, StreamingDotsProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-1 w-1',
      md: 'h-1.5 w-1.5',
      lg: 'h-2 w-2',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1', className)}
        role="status"
        aria-label="Caricamento..."
        {...props}
      >
        {[0, 1, 2].map((i: number) => (
          <span
            key={i}
            className={cn(sizeClasses[size], 'animate-bounce rounded-full bg-current')}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    );
  }
);
StreamingDots.displayName = 'StreamingDots';

// ============================================================================
// Typing Indicator
// ============================================================================

export interface TypingIndicatorProps extends ComponentProps<'div'> {
  label?: string;
}

export const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ label = 'Sta scrivendo...', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400',
        className
      )}
      role="status"
      {...props}
    >
      <StreamingDots size="sm" />
      <span>{label}</span>
    </div>
  )
);
TypingIndicator.displayName = 'TypingIndicator';

// ============================================================================
// Message Loader (Skeleton)
// ============================================================================

export interface MessageLoaderProps extends ComponentProps<'div'> {
  lines?: number;
}

export const MessageLoader = forwardRef<HTMLDivElement, MessageLoaderProps>(
  ({ lines = 3, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse space-y-2', className)}
      role="status"
      aria-label="Caricamento messaggio..."
      {...props}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded bg-neutral-200 dark:bg-neutral-700',
            i === lines - 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  )
);
MessageLoader.displayName = 'MessageLoader';

// ============================================================================
// Spinner Loader
// ============================================================================

export interface AIElementSpinnerProps extends ComponentProps<'svg'> {
  size?: 'sm' | 'md' | 'lg';
}

export const AIElementSpinner = forwardRef<SVGSVGElement, AIElementSpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return (
      <svg
        ref={ref}
        className={cn('animate-spin', sizeClasses[size], className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label="Caricamento..."
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }
);
AIElementSpinner.displayName = 'AIElementSpinner';

// ============================================================================
// AI Thinking Loader (Pulsing brain icon)
// ============================================================================

export interface AIThinkingProps extends ComponentProps<'div'> {
  message?: string;
}

export function AIThinking({
  message = 'Sto elaborando...',
  className,
  ...props
}: AIThinkingProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-3',
        'bg-neutral-100 dark:bg-neutral-800',
        'text-neutral-600 dark:text-neutral-300',
        className
      )}
      role="status"
      {...props}
    >
      <div className="relative">
        <span className="text-xl">🧠</span>
        <span className="absolute inset-0 animate-ping text-xl opacity-50">🧠</span>
      </div>
      <span className="text-sm">{message}</span>
      <StreamingDots size="sm" className="ml-auto text-neutral-400" />
    </div>
  );
}

// ============================================================================
// Tool Executing Loader
// ============================================================================

export interface ToolExecutingProps extends ComponentProps<'div'> {
  toolName?: string;
}

export function ToolExecuting({ toolName, className, ...props }: ToolExecutingProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2',
        'border border-blue-200 bg-blue-50',
        'dark:border-blue-800 dark:bg-blue-900/30',
        className
      )}
      role="status"
      {...props}
    >
      <AIElementSpinner size="sm" className="text-blue-500" />
      <span className="text-xs text-blue-700 dark:text-blue-300">
        {toolName ? `Eseguendo ${toolName}...` : 'Eseguendo strumento...'}
      </span>
    </div>
  );
}
