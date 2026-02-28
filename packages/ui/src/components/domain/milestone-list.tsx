'use client';

import { cn } from '@giulio-leone/lib-design-system';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { TaskList } from './task-list';
import type { TaskItemProps } from './task-list';
import { ProgressBar } from '../core/progress-bar';

export interface MilestoneProps {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  tasks: TaskItemProps[];
  className?: string;
}

export function MilestoneItem({ title, progress, tasks, className }: MilestoneProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-white/[0.08] dark:bg-neutral-900/50',
        className
      )}
    >
      <div
        className="flex cursor-pointer items-center gap-3 p-4 hover:bg-neutral-100/50 dark:hover:bg-white/[0.06]/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <button className="text-neutral-400 transition-transform duration-200">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-neutral-900 dark:text-white">{title}</h4>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {Math.round(progress)}%
            </span>
          </div>
          <ProgressBar value={progress} size="sm" className="mt-2" />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <TaskList tasks={tasks} />
        </div>
      )}
    </div>
  );
}

interface MilestoneListProps {
  milestones: MilestoneProps[];
  className?: string;
}

export function MilestoneList({ milestones, className }: MilestoneListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {milestones.map((milestone: MilestoneProps) => (
        <MilestoneItem key={milestone.id} {...milestone} />
      ))}
    </div>
  );
}
