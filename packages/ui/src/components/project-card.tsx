'use client';

import { Card } from '../card';
import { ProgressBar } from './progress-bar';
import { cn } from '@giulio-leone/lib-design-system';
import { Calendar, MoreVertical, ArrowRight, Edit, Copy, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'ON_HOLD';
  progress: number;
  dueDate?: Date;
  taskCount: number;
  completedTaskCount: number;
  color?: string;
  className?: string;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  description,
  status,
  progress,
  dueDate,
  taskCount,
  completedTaskCount,
  color = '#3B82F6',
  className,
  onEdit,
  onDuplicate,
  onDelete,
}: ProjectCardProps) {
  const statusColors = {
    ACTIVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    ARCHIVED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    ON_HOLD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };

  return (
    <Card
      variant="glass"
      className={cn('group relative flex flex-col p-5 transition-all', className)}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            {title.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">{title}</h3>
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold',
                statusColors[status]
              )}
            >
              {status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(id)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifica
              </DropdownMenuItem>
            )}
            {onDuplicate && (
              <DropdownMenuItem onClick={() => onDuplicate(id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplica
              </DropdownMenuItem>
            )}
            {(onEdit || onDuplicate) && onDelete && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(id)}
                className="text-red-600 focus:text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {description && (
        <p className="mb-4 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}

      <div className="mt-auto space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>
              {completedTaskCount}/{taskCount} Tasks
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} size="sm" color={`bg-[${color}]`} />
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
          {dueDate && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{dueDate.toLocaleDateString()}</span>
            </div>
          )}

          <Link
            href={`/projects/${id}`}
            className="flex items-center gap-1 text-xs font-bold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
          >
            View Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
