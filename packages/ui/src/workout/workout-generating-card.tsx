'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@giulio-leone/ui';
import { cn } from '@giulio-leone/lib-design-system';
import type { GenerationWithStatus } from '@giulio-leone/hooks';

/**
 * Props for WorkoutGeneratingCard component
 */
export interface WorkoutGeneratingCardProps {
  /** Generation data */
  generation: GenerationWithStatus;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
  /** Compact mode (smaller card) */
  compact?: boolean;
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
 * WorkoutGeneratingCard Component
 *
 * Displays an AI workout generation progress card with real-time updates.
 *
 * @example
 * ```tsx
 * <WorkoutGeneratingCard
 *   generation={activeGeneration}
 *   onClick={() => navigateToDetails()}
 * />
 * ```
 */
export function WorkoutGeneratingCard({
  generation,
  onClick,
  className,
  compact = false,
}: WorkoutGeneratingCardProps) {
  const { progress, current_step, status, elapsedMs, estimatedRemainingMs } = generation;

  // Status icon
  const StatusIcon = React.useMemo(() => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'failed':
        return XCircle;
      default:
        return Loader2;
    }
  }, [status]);

  // Status color
  const statusColor = React.useMemo(() => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  }, [status]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card
          className={cn(
            'relative overflow-hidden border transition-all duration-300',
            'bg-blue-50 dark:bg-blue-950',
            onClick && 'cursor-pointer hover:shadow-md',
            compact ? 'p-3' : 'p-4',
            className
          )}
          onClick={onClick}
        >
          {/* Progress shimmer effect */}
          {status === 'running' && (
            <motion.div
              className="absolute inset-0 -translate-x-full"
              animate={{
                translateX: ['−100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              }}
            />
          )}

          <CardHeader className={cn('p-0', compact ? 'pb-2' : 'pb-3')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    'flex items-center justify-center rounded-lg',
                    compact ? 'h-8 w-8' : 'h-10 w-10',
                    'bg-background/80'
                  )}
                >
                  <Dumbbell
                    className={cn(
                      'text-blue-600 dark:text-blue-400',
                      compact ? 'h-4 w-4' : 'h-5 w-5'
                    )}
                  />
                </div>

                {/* Title and status */}
                <div>
                  <CardTitle className={cn(compact ? 'text-sm' : 'text-base', 'font-semibold')}>
                    Generating Workout Program
                  </CardTitle>
                  {current_step && (
                    <p className="text-muted-foreground mt-0.5 text-xs">{current_step}</p>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <StatusIcon
                  className={cn(
                    statusColor,
                    compact ? 'h-4 w-4' : 'h-5 w-5',
                    status === 'running' && 'animate-spin'
                  )}
                />
                <span className={cn('font-medium', statusColor, compact ? 'text-xs' : 'text-sm')}>
                  {progress}%
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Progress bar */}
            <div className={cn(compact ? 'mb-2' : 'mb-3')}>
              <Progress
                value={progress}
                className={cn('h-2', status === 'failed' && '[&>div]:bg-red-500')}
              />
            </div>

            {/* Time info */}
            {(elapsedMs || estimatedRemainingMs) && (
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                {elapsedMs !== undefined && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Elapsed: {formatDuration(elapsedMs)}</span>
                  </div>
                )}
                {estimatedRemainingMs !== null &&
                  estimatedRemainingMs !== undefined &&
                  status === 'running' && (
                    <span>~{formatDuration(estimatedRemainingMs)} remaining</span>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default WorkoutGeneratingCard;
