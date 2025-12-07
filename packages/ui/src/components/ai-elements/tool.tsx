/**
 * Tool Component
 *
 * Visualizzazione di tool invocations (AI SDK v6).
 * Mostra stato, input, output con collapsible.
 * Uses CSS grid animation (no framer-motion for React 19 compatibility)
 */

'use client';

import { useState, forwardRef, type ComponentProps, type ReactNode } from 'react';
import { Wrench, ChevronDown, CheckCircle, XCircle, Clock, Circle } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';

// ============================================================================
// Types (aligned with AI SDK v6 ToolUIPart)
// ============================================================================

export type ToolState =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-error'
  | 'output-denied';

export interface ToolInput {
  [key: string]: unknown;
}

// ============================================================================
// Tool Container
// ============================================================================

export interface ToolProps extends ComponentProps<'div'> {
  defaultOpen?: boolean;
  children: ReactNode;
}

export const Tool = forwardRef<HTMLDivElement, ToolProps>(
  ({ defaultOpen = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-neutral-200 bg-neutral-50',
          'dark:border-neutral-700 dark:bg-neutral-800/50',
          'overflow-hidden',
          className
        )}
        data-state={defaultOpen ? 'open' : 'closed'}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Tool.displayName = 'Tool';

// ============================================================================
// Tool Header
// ============================================================================

export interface ToolHeaderProps extends Omit<ComponentProps<'button'>, 'type'> {
  title?: string;
  toolType?: string;
  state: ToolState;
}

const stateConfig: Record<ToolState, { label: string; icon: ReactNode; color: string }> = {
  'input-streaming': {
    label: 'In attesa',
    icon: <Circle className="h-4 w-4" />,
    color: 'text-neutral-500',
  },
  'input-available': {
    label: 'In esecuzione',
    icon: <Clock className="h-4 w-4 animate-pulse" />,
    color: 'text-amber-500',
  },
  'approval-requested': {
    label: 'Richiede approvazione',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-yellow-600',
  },
  'approval-responded': {
    label: 'Risposto',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-blue-600',
  },
  'output-available': {
    label: 'Completato',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-emerald-500',
  },
  'output-error': {
    label: 'Errore',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-500',
  },
  'output-denied': {
    label: 'Negato',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-orange-600',
  },
};

export const ToolHeader = forwardRef<HTMLButtonElement, ToolHeaderProps>(
  ({ title, toolType, state, className, onClick, ...props }, ref) => {
    const config = stateConfig[state] || stateConfig['input-streaming'];
    const displayName = title || toolType?.replace('tool-', '').replace(/_/g, ' ') || 'Tool';

    // Format tool name for display
    const formattedName = displayName
      .replace(/^food_/, '🍎 ')
      .replace(/^exercise_/, '💪 ')
      .replace(/^workout_/, '🏋️ ')
      .replace(/^nutrition_/, '🥗 ')
      .replace(/^oneagenda_/, '📅 ');

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center justify-between px-3 py-2',
          'text-left transition-colors',
          'hover:bg-neutral-100 dark:hover:bg-neutral-700/50',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {formattedName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('flex items-center gap-1.5 text-xs', config.color)}>
            {config.icon}
            {config.label}
          </span>
          <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </button>
    );
  }
);
ToolHeader.displayName = 'ToolHeader';

// ============================================================================
// Tool Content (collapsible with CSS grid animation)
// ============================================================================

export interface ToolContentProps extends ComponentProps<'div'> {
  isOpen?: boolean;
  children: ReactNode;
}

export const ToolContent = forwardRef<HTMLDivElement, ToolContentProps>(
  ({ isOpen = true, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid transition-all duration-200',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        className
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div className="border-t border-neutral-200 px-3 py-2 dark:border-neutral-700">
          {children}
        </div>
      </div>
    </div>
  )
);
ToolContent.displayName = 'ToolContent';

// ============================================================================
// Tool Input Display
// ============================================================================

export interface ToolInputDisplayProps extends ComponentProps<'div'> {
  input: ToolInput;
}

export const ToolInputDisplay = forwardRef<HTMLDivElement, ToolInputDisplayProps>(
  ({ input, className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-2', className)} {...props}>
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Input:</span>
      <pre className="mt-1 overflow-x-auto rounded bg-neutral-100 p-2 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        {JSON.stringify(input, null, 2)}
      </pre>
    </div>
  )
);
ToolInputDisplay.displayName = 'ToolInputDisplay';

// ============================================================================
// Tool Output Display
// ============================================================================

export interface ToolOutputDisplayProps extends ComponentProps<'div'> {
  output?: unknown;
  errorText?: string;
}

export const ToolOutputDisplay = forwardRef<HTMLDivElement, ToolOutputDisplayProps>(
  ({ output, errorText, className, ...props }, ref) => {
    if (!output && !errorText) return null;

    const formatOutput = (data: unknown): string => {
      if (data === undefined || data === null) return '';
      if (typeof data === 'string') return data;
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return String(data);
      }
    };

    return (
      <div ref={ref} className={cn('', className)} {...props}>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {errorText ? 'Errore:' : 'Output:'}
        </span>
        <pre
          className={cn(
            'mt-1 overflow-x-auto rounded p-2 text-xs',
            errorText
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
          )}
        >
          {errorText || formatOutput(output)}
        </pre>
      </div>
    );
  }
);
ToolOutputDisplay.displayName = 'ToolOutputDisplay';

// ============================================================================
// Inline Tool Bubble (compact version for message parts)
// ============================================================================

export interface ToolBubbleProps {
  toolName: string;
  state: ToolState | 'pending' | 'result' | 'error';
  args?: ToolInput;
  result?: unknown;
}

export function ToolBubble({ toolName, state, args, result }: ToolBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Map legacy states to new format
  const mappedState: ToolState =
    state === 'pending'
      ? 'input-available'
      : state === 'result'
        ? 'output-available'
        : state === 'error'
          ? 'output-error'
          : state;

  const config = stateConfig[mappedState] || stateConfig['input-streaming'];

  // Format tool name
  const displayName = toolName
    .replace(/_/g, ' ')
    .replace(/^food /, '🍎 ')
    .replace(/^exercise /, '💪 ')
    .replace(/^workout /, '🏋️ ')
    .replace(/^nutrition /, '🥗 ')
    .replace(/^oneagenda /, '📅 ');

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {displayName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('flex items-center gap-1.5 text-xs', config.color)}>
            {config.icon}
            {config.label}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-neutral-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* CSS grid animation for expand/collapse */}
      <div
        className={cn(
          'grid transition-all duration-200',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-neutral-200 px-3 py-2 dark:border-neutral-700">
            {args && Object.keys(args).length > 0 && <ToolInputDisplay input={args} />}
            {(mappedState === 'output-available' || mappedState === 'output-error') && (
              <ToolOutputDisplay
                output={result}
                errorText={mappedState === 'output-error' ? String(result) : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
