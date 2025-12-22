'use client';

import { useState } from 'react';
import { cn } from '@onecoach/lib-design-system';
import { CheckCircle2, Loader2, ChevronDown, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from './card';

export interface StreamEvent {
  type: string;
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface StreamingResultProps {
  isStreaming: boolean;
  progress: number;
  currentMessage: string;
  events: StreamEvent[];
  title?: string;
  className?: string; // Standard string for web
}

function getEventIcon(type: string, message: string) {
  const lowerMessage = message.toLowerCase();
  const lowerType = type.toLowerCase();

  if (lowerMessage.includes('completato') || lowerType === 'complete' || lowerType === 'success') {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (lowerMessage.includes('starting') || lowerType === 'start' || lowerType === 'progress') {
    return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
  }
  if (lowerType === 'error' || lowerType === 'warning') {
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  }
  return <Sparkles className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />;
}

function EventCard({ event }: { event: StreamEvent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasData = event.data && Object.keys(event.data).length > 0;

  return (
    <button
      onClick={() => hasData && setIsExpanded((prev) => !prev)}
      className={cn(
        'w-full text-left rounded-xl border border-neutral-200/60 bg-white/50 dark:border-neutral-700/60 dark:bg-neutral-800/50',
        'px-3 py-2.5 transition-colors',
        hasData && 'hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-700/30 dark:active:bg-neutral-700/50',
        !hasData && 'cursor-default'
      )}
      type="button"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">{getEventIcon(event.type, event.message)}</div>
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-sm font-medium text-neutral-800 dark:text-neutral-100 line-clamp-2",
              isExpanded && "line-clamp-none"
            )}
          >
            {event.message}
          </div>
          <div className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
            {event.timestamp.toLocaleTimeString()}
          </div>
        </div>
        {hasData && (
          <div className="mt-0.5 flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            )}
          </div>
        )}
      </div>
      {isExpanded && hasData && (
        <div className="mt-3 rounded-lg bg-neutral-950 p-3 overflow-x-auto">
          <pre className="font-mono text-xs text-emerald-300">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      )}
    </button>
  );
}

export function StreamingResult({
  isStreaming,
  progress,
  currentMessage,
  events,
  title,
  className,
}: StreamingResultProps) {
  if (!isStreaming && events.length === 0) return null;

  // Process events to merge same-agent updates
  const processedEvents = events.reduce((acc, event) => {
    // Try to find if this agent/role already exists in accumulator
    const agentId = event.data?.agent || event.data?.role || (event.type.startsWith('agent_') ? event.data?.step : undefined);
    
    if (agentId) {
      const existingIndex = acc.findIndex(e => {
        const eId = e.data?.agent || e.data?.role || (e.type.startsWith('agent_') ? e.data?.step : undefined);
        return eId === agentId;
      });

      if (existingIndex >= 0) {
        // Update existing entry
        const existingEvent = acc[existingIndex];
        if (existingEvent) {
            acc[existingIndex] = {
            ...existingEvent,
            type: event.type,
            message: event.message,
            timestamp: event.timestamp,
            data: { ...(existingEvent.data || {}), ...event.data }
            };
        }
        return acc;
      }
    }
    
    // Default: append
    acc.push(event);
    return acc;
  }, [] as StreamEvent[]);

  return (
    <div className={cn('space-y-4 px-4 md:px-0', className)}>
      {/* Progress Card */}
      <Card variant="glass" className="overflow-hidden p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isStreaming && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
            <span
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex-1 truncate"
            >
              {currentMessage || 'Inizializzazione...'}
            </span>
          </div>
          <span className="ml-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round(progress)}%
          </span>
        </div>
        {/* Gradient Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Events Log */}
      <Card variant="glass" className="max-h-80 overflow-hidden p-0 flex flex-col">
        <div className="border-b border-neutral-100 bg-neutral-50/80 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {title || 'AI Agent Orchestrator'}
            </span>
          </div>
        </div>
        <div
          className="p-3 overflow-y-auto space-y-2 custom-scrollbar"
        >
          {processedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                In attesa di aggiornamenti...
              </span>
            </div>
          ) : (
            processedEvents.map((event, index) => (
              <EventCard key={`${event.type}-${index}`} event={event} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
