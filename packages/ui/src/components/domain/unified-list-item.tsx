/**
 * UnifiedListItem Component (Web)
 *
 * A versatile list item component designed to display both one-off Tasks
 * and recurring Habits in a unified "Agenda" view.
 */

import { cn } from '@giulio-leone/lib-design-system/dark-mode-classes';
import { Badge } from '../../badge';
import { CheckCircle2, Clock, Repeat, Circle } from 'lucide-react';

export interface UnifiedListItemProps {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'habit' | 'event';
  status: 'pending' | 'completed' | 'skipped' | 'in-progress';
  time?: string;
  priority?: 'low' | 'medium' | 'high';
  streak?: number;
  onToggle?: () => void;
  onPress?: () => void;
  className?: string;
}

export function UnifiedListItem({
  title,
  description,
  type,
  status,
  time,
  priority,
  streak,
  onToggle,
  onPress,
  className,
}: UnifiedListItemProps) {
  const isCompleted = status === 'completed';
  const isTask = type === 'task';

  return (
    <div
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPress?.()}
      className={cn(
        'group relative mb-3 flex cursor-pointer flex-row items-center overflow-hidden rounded-2xl border p-4',
        'bg-white/90 dark:bg-white/[0.10]',
        'border-neutral-200/40 dark:border-white/[0.08]',
        'shadow-sm dark:shadow-lg dark:shadow-black/20',
        'transition-all duration-200',
        'hover:border-neutral-300/50 hover:shadow-lg dark:hover:border-white/[0.1] dark:hover:shadow-xl dark:hover:shadow-black/30',
        isCompleted && 'opacity-60',
        className
      )}
    >
      {/* Left: Status Toggle */}
      <button
        type="button"
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          e.stopPropagation();
          onToggle?.();
        }}
        className={cn(
          'mr-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-200',
          isCompleted
            ? 'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/30 dark:border-emerald-400 dark:bg-emerald-500'
            : 'border-neutral-300 hover:border-sky-400 hover:shadow-md dark:border-white/[0.1] dark:hover:border-sky-400'
        )}
      >
        {isCompleted ? (
          <CheckCircle2 size={14} className="text-white" />
        ) : (
          <Circle size={14} className="text-transparent" />
        )}
      </button>

      {/* Center: Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'font-medium',
              isCompleted
                ? 'text-neutral-500 line-through dark:text-neutral-500'
                : 'text-neutral-900 dark:text-neutral-100'
            )}
          >
            {title}
          </span>
          {/* Type Indicator (Icon) */}
          {isTask ? (
            <Badge variant="neutral" size="sm" className="h-5 px-1.5">
              Task
            </Badge>
          ) : (
            <Badge variant="info" size="sm" className="flex h-5 items-center gap-1 px-1.5">
              <Repeat size={10} /> Habit
            </Badge>
          )}
        </div>

        {description && (
          <p className="mt-0.5 truncate text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}

        {/* Meta Info Row */}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {time && (
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-neutral-400" />
              <span className="text-xs text-neutral-500">{time}</span>
            </div>
          )}

          {streak !== undefined && streak > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-orange-500">🔥 {streak} day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Priority Indicator (if high) */}
      {priority === 'high' && !isCompleted && (
        <div className="ml-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
      )}
    </div>
  );
}
