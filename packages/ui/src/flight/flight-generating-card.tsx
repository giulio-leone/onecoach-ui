'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plane, Loader2, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Progress } from '../progress';
import { cn } from '@giulio-leone/lib-design-system';
import type { GenerationWithStatus } from '@giulio-leone/hooks';
import { AgentEventList, useAdminMode, type ProgressField } from '@giulio-leone/one-agent/hooks';

/**
 * Props for FlightGeneratingCard component
 */
export interface FlightGeneratingCardProps {
  /** Generation data */
  generation: GenerationWithStatus;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
  /** Compact mode (smaller card) */
  compact?: boolean;
  /** v4.1: Streaming events from AI agent */
  events?: ProgressField[];
  /** v4.1: Override user message from streaming */
  streamingMessage?: string;
}

/**
 * Format duration from ms
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * FlightGeneratingCard Component
 *
 * Displays an AI flight search generation progress card with real-time updates.
 *
 * @example
 * ```tsx
 * <FlightGeneratingCard
 *   generation={activeGeneration}
 *   onClick={() => navigateToDetails()}
 * />
 * ```
 */
export function FlightGeneratingCard({
  generation,
  onClick,
  className,
  compact = false,
  events = [],
  streamingMessage,
}: FlightGeneratingCardProps) {
  const { progress, current_step, status, elapsedMs, estimatedRemainingMs } = generation;
  const { isAdmin, toggle: toggleAdmin } = useAdminMode();

  // Status icon
  const StatusIcon = React.useMemo(() => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  }, [status]);

  // Display text: prefer streaming message, fallback to generation step
  const stepText = React.useMemo(() => {
    if (streamingMessage) return streamingMessage;
    if (!current_step) {
      if (status === 'completed') return 'Search complete!';
      if (status === 'failed') return 'Search failed';
      return 'Initializing search...';
    }
    return current_step;
  }, [streamingMessage, current_step, status]);

  // Status colors
  const statusColors = React.useMemo(() => {
    switch (status) {
      case 'completed':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/5',
          progress: 'bg-emerald-500',
        };
      case 'failed':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/5',
          progress: 'bg-red-500',
        };
      default:
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/5',
          progress: 'bg-blue-500',
        };
    }
  }, [status]);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-3 rounded-lg border p-3',
          statusColors.border,
          statusColors.bg,
          onClick && 'cursor-pointer hover:bg-blue-500/10',
          className
        )}
        onClick={onClick}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
          <Search className="h-4 w-4 text-blue-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{stepText}</p>
          <Progress value={progress} className="mt-1 h-1.5" />
        </div>
        {StatusIcon}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'overflow-hidden border-2 transition-all',
          statusColors.border,
          statusColors.bg,
          onClick && 'cursor-pointer hover:shadow-lg',
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                <Plane className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-base">Searching Flights</CardTitle>
                <p className="text-muted-foreground text-xs">AI-powered search in progress</p>
              </div>
            </div>
            {StatusIcon}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{stepText}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className={cn('h-2', statusColors.progress)} />
          </div>

          {/* Time info */}
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Elapsed: {formatDuration(elapsedMs)}</span>
            </div>
            {estimatedRemainingMs && status === 'running' && (
              <span>~{formatDuration(estimatedRemainingMs)} remaining</span>
            )}
          </div>

          {/* v4.1: Streaming events (DRY - reuse AgentEventList) */}
          {events.length > 0 && (
            <AgentEventList
              events={events}
              isAdmin={isAdmin}
              onToggleAdmin={toggleAdmin}
              maxVisible={3}
              compact
            />
          )}

          {/* Animated searching indicator */}
          {status === 'running' && events.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-2">
              <motion.div
                className="h-2 w-2 rounded-full bg-blue-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-blue-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-blue-500"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default FlightGeneratingCard;
