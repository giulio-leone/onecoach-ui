'use client';

import { cn } from '@giulio-leone/lib-design-system';
import { CheckCircle2, Circle, Calendar, Flag } from 'lucide-react';

export interface TaskItemProps {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
  onToggle?: (id: string) => void;
  className?: string;
}

export function TaskItem({
  id,
  title,
  status,
  priority,
  dueDate,
  onToggle,
  className,
}: TaskItemProps) {
  const priorityColors = {
    LOW: 'text-slate-400 dark:text-slate-500',
    MEDIUM: 'text-amber-500',
    HIGH: 'text-red-500',
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-transparent bg-white p-3 shadow-sm transition-all hover:border-slate-200 hover:shadow-md dark:bg-slate-900 dark:hover:border-slate-700',
        status === 'DONE' && 'opacity-60',
        className
      )}
    >
      <button
        onClick={() => onToggle?.(id)}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
          status === 'DONE'
            ? 'text-green-500'
            : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500'
        )}
      >
        {status === 'DONE' ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium text-slate-900 dark:text-white',
            status === 'DONE' && 'text-slate-500 line-through dark:text-slate-500'
          )}
        >
          {title}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{dueDate.toLocaleDateString()}</span>
            </div>
          )}
          <div className={cn('flex items-center gap-1', priorityColors[priority])}>
            <Flag className="h-3 w-3" />
            <span className="capitalize">{priority.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskListProps {
  tasks: TaskItemProps[];
  onToggleTask?: (id: string) => void;
  className?: string;
}

export function TaskList({ tasks, onToggleTask, className }: TaskListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {tasks.map((task) => (
        <TaskItem key={task.id} {...task} onToggle={onToggleTask} />
      ))}
    </div>
  );
}
