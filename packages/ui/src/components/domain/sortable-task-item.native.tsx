import { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskItemContent } from './recursive-task-item';
import type { Task } from './task-types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface SortableTaskItemProps {
  task: Task;
  level?: number;
  onToggleStatus: (id: string, status: string) => void;
  onAddSubTask: (parentId: string, title: string) => void;
  onSelectTask: (id: string) => void;
  platform?: 'web' | 'native';
}

export function SortableTaskItem({
  task,
  level = 0,
  onToggleStatus,
  onAddSubTask,
  onSelectTask,
  platform = typeof window !== 'undefined' ? 'web' : 'native',
}: SortableTaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    // Only apply transition when not dragging to avoid flash
    transition: isDragging ? 'none' : transition || undefined,
    // Hide the original item when dragging (DragOverlay will show it)
    opacity: isDragging ? 0.3 : 1,
    // Improve performance during drag
    willChange: isDragging ? 'transform' : 'auto',
  };

  const hasSubTasks = Array.isArray(task.subTasks) && task.subTasks.length > 0;
  const isCompleted = task.status === 'COMPLETED';

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      onAddSubTask(task.id, newSubTaskTitle);
      setNewSubTaskTitle('');
      setIsAddingSubTask(false);
      setIsExpanded(true);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex-col">
      <TaskItemContent
        task={task}
        level={level}
        isExpanded={isExpanded}
        hasSubTasks={!!hasSubTasks}
        isCompleted={isCompleted}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        onToggleStatus={() => onToggleStatus(task.id, isCompleted ? 'TODO' : 'COMPLETED')}
        onSelectTask={() => onSelectTask(task.id)}
        onAddSubTask={() => setIsAddingSubTask(true)}
        dragHandleProps={listeners}
        platform={platform}
      />

      {/* Sub-tasks & Input */}
      {isExpanded && (
        <div>
          {hasSubTasks && task.subTasks && (
            <SortableContext
              items={task.subTasks.map((t: any) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {task.subTasks.map((subTask: any) => (
                <SortableTaskItem
                  key={subTask.id}
                  task={subTask}
                  level={level + 1}
                  onToggleStatus={onToggleStatus}
                  onAddSubTask={onAddSubTask}
                  onSelectTask={onSelectTask}
                  platform={platform}
                />
              ))}
            </SortableContext>
          )}

          {/* Inline Add Sub-task Input */}
          {isAddingSubTask && (
            <div className={cn('mt-1 ml-10 flex flex-row items-center', level > 0 && 'ml-16')}>
              <div className="mr-3 flex h-4 w-4 items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              </div>
              <input
                type="text"
                className="flex-1 rounded border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="Sub-task title..."
                value={newSubTaskTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewSubTaskTitle(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubTask();
                  }
                }}
                onBlur={() => {
                  if (!newSubTaskTitle.trim()) setIsAddingSubTask(false);
                }}
                autoFocus
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
