'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import { Card, CardContent, CardHeader, CardTitle } from './core/components/card';
import { Progress } from './progress';
import {
  Dumbbell,
  Utensils,
  Calendar,
  ShoppingCart,
  Bot,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

/**
 * Workflow type for the generating card
 */
export type GeneratingCardWorkflowType =
  | 'workout-generation'
  | 'nutrition-generation'
  | 'agenda-planning'
  | 'exercise-generation'
  | 'food-generation'
  | 'shopping-generation'
  | 'copilot-chat';

/**
 * Generation status
 */
export type GeneratingCardStatus = 'running' | 'completed' | 'failed';

/**
 * Props for GeneratingCard component
 */
export interface GeneratingCardProps {
  /** Current workflow type */
  workflowType: GeneratingCardWorkflowType;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current step description */
  currentStep?: string | null;
  /** Current status */
  status?: GeneratingCardStatus;
  /** Elapsed time in ms */
  elapsedMs?: number;
  /** Estimated remaining time in ms */
  estimatedRemainingMs?: number | null;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
  /** Compact mode (smaller card) */
  compact?: boolean;
}

/**
 * Workflow type configuration
 */
const WORKFLOW_CONFIG: Record<
  GeneratingCardWorkflowType,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  'workout-generation': {
    icon: Dumbbell,
    label: 'Workout Program',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  'nutrition-generation': {
    icon: Utensils,
    label: 'Nutrition Plan',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  'agenda-planning': {
    icon: Calendar,
    label: 'Agenda',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  'exercise-generation': {
    icon: Dumbbell,
    label: 'Exercises',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
  },
  'food-generation': {
    icon: Utensils,
    label: 'Foods',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
  },
  'shopping-generation': {
    icon: ShoppingCart,
    label: 'Shopping List',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
  'copilot-chat': {
    icon: Bot,
    label: 'AI Copilot',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950',
  },
};

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
 * GeneratingCard Component
 *
 * Displays an AI generation progress card with real-time updates.
 * Supports multiple workflow types with distinct styling.
 *
 * @example
 * ```tsx
 * <GeneratingCard
 *   workflowType="workout-generation"
 *   progress={45}
 *   currentStep="Planning weekly structure..."
 *   elapsedMs={12000}
 *   estimatedRemainingMs={15000}
 * />
 * ```
 */
export function GeneratingCard({
  workflowType,
  progress,
  currentStep,
  status = 'running',
  elapsedMs,
  estimatedRemainingMs,
  onClick,
  className,
  compact = false,
}: GeneratingCardProps) {
  const config = WORKFLOW_CONFIG[workflowType];
  const Icon = config.icon;

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
        return config.color;
    }
  }, [status, config.color]);

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
            config.bgColor,
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
                  <Icon className={cn(config.color, compact ? 'h-4 w-4' : 'h-5 w-5')} />
                </div>

                {/* Title and status */}
                <div>
                  <CardTitle className={cn(compact ? 'text-sm' : 'text-base', 'font-semibold')}>
                    Generating {config.label}
                  </CardTitle>
                  {currentStep && (
                    <p className="text-muted-foreground mt-0.5 text-xs">{currentStep}</p>
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

export default GeneratingCard;
