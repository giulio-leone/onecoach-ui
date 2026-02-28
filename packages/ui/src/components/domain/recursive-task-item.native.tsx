/// <reference path="../types/react-native-classname.d.ts" />
'use client';

import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import {
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Circle,
  Plus,
  MoreHorizontal,
  Link as LinkIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

import type { Task } from './task-types';

export type { Task };

export interface TaskItemContentProps {
  task: Task;
  level: number;
  isExpanded: boolean;
  hasSubTasks: boolean;
  isCompleted: boolean;
  onToggleExpand: () => void;
  onToggleStatus: () => void;
  onSelectTask: () => void;
  onAddSubTask: () => void;
  dragHandleProps?: Record<string, unknown>; // For DnD handle
  platform?: 'web' | 'native';
}

export function TaskItemContent({
  task,
  level,
  isExpanded,
  hasSubTasks,
  isCompleted,
  onToggleExpand,
  onToggleStatus,
  onSelectTask,
  onAddSubTask,
  dragHandleProps,
  platform = typeof window !== 'undefined' ? 'web' : 'native',
}: TaskItemContentProps) {
  const isWeb = platform === 'web';

  if (isWeb) {
    return (
      <div
        className={cn(
          'group flex flex-row items-center py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
          level > 0 && 'ml-6 border-l border-neutral-200 pl-2 dark:border-neutral-800'
        )}
      >
        {/* Drag Handle (Optional) */}
        {dragHandleProps && (
          <div {...dragHandleProps} className="mr-2 cursor-grab active:cursor-grabbing">
            <MoreHorizontal size={14} className="text-neutral-400" />
          </div>
        )}

        {/* Expand/Collapse Toggle */}
        <button
          onClick={onToggleExpand}
          className={cn(
            'mr-1 flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-700',
            !hasSubTasks && 'opacity-0'
          )}
          disabled={!hasSubTasks}
        >
          {isExpanded ? (
            <ChevronDown size={14} className="text-neutral-500" />
          ) : (
            <ChevronRight size={14} className="text-neutral-500" />
          )}
        </button>

        {/* Status Checkbox */}
        <button onClick={onToggleStatus} className="mr-3">
          {isCompleted ? (
            <CheckCircle size={18} className="text-green-500" />
          ) : (
            <Circle
              size={18}
              className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400"
            />
          )}
        </button>

        {/* Task Content */}
        <button onClick={onSelectTask} className="flex flex-1 flex-row items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium text-neutral-900 dark:text-neutral-200',
              isCompleted && 'text-neutral-400 line-through dark:text-neutral-600'
            )}
          >
            {task.title}
          </span>

          {/* Dependencies Indicator */}
          {task.dependsOn && task.dependsOn.length > 0 && (
            <div className="flex flex-row items-center rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/30">
              <LinkIcon size={10} className="mr-1 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                {task.dependsOn.length}
              </span>
            </div>
          )}
        </button>

        {/* Actions */}
        <div className="flex flex-row items-center opacity-0 group-hover:opacity-100">
          <button
            onClick={onAddSubTask}
            className="mr-1 rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <Plus size={14} className="text-neutral-500" />
          </button>
          <button className="rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700">
            <MoreHorizontal size={14} className="text-neutral-500" />
          </button>
        </div>
      </div>
    );
  }

  // Native version
  return (
    <View
      className={cn(
        'group flex-row items-center py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
        level > 0 && 'ml-6 border-l border-neutral-200 pl-2 dark:border-neutral-800'
      )}
    >
      {/* Drag Handle (Optional) */}
      {dragHandleProps && (
        <View {...dragHandleProps} className="mr-2 cursor-grab active:cursor-grabbing">
          <MoreHorizontal size={14} className="text-neutral-400" />
        </View>
      )}

      {/* Expand/Collapse Toggle */}
      <TouchableOpacity
        onPress={onToggleExpand}
        className={cn(
          'mr-1 h-6 w-6 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-700',
          !hasSubTasks && 'opacity-0'
        )}
        disabled={!hasSubTasks}
      >
        {isExpanded ? (
          <ChevronDown size={14} className="text-neutral-500" />
        ) : (
          <ChevronRight size={14} className="text-neutral-500" />
        )}
      </TouchableOpacity>

      {/* Status Checkbox */}
      <TouchableOpacity onPress={onToggleStatus} className="mr-3">
        {isCompleted ? (
          <CheckCircle size={18} className="text-green-500" />
        ) : (
          <Circle
            size={18}
            className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400"
          />
        )}
      </TouchableOpacity>

      {/* Task Content */}
      <TouchableOpacity onPress={onSelectTask} className="flex-1 flex-row items-center gap-2">
        <Text
          className={cn(
            'text-sm font-medium text-neutral-900 dark:text-neutral-200',
            isCompleted && 'text-neutral-400 line-through dark:text-neutral-600'
          )}
        >
          {task.title}
        </Text>

        {/* Dependencies Indicator */}
        {task.dependsOn && task.dependsOn.length > 0 && (
          <View className="flex-row items-center rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/30">
            <LinkIcon size={10} className="mr-1 text-amber-600 dark:text-amber-400" />
            <Text className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
              {task.dependsOn.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Actions */}
      <View className="flex-row items-center opacity-0 group-hover:opacity-100">
        <TouchableOpacity
          onPress={onAddSubTask}
          className="mr-1 rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
        >
          <Plus size={14} className="text-neutral-500" />
        </TouchableOpacity>
        <TouchableOpacity className="rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700">
          <MoreHorizontal size={14} className="text-neutral-500" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface RecursiveTaskItemProps {
  task: Task;
  level?: number;
  onToggleStatus: (taskId: string, newStatus: string) => void;
  onAddSubTask: (parentId: string, title: string) => void;
  onSelectTask: (taskId: string) => void;
  platform?: 'web' | 'native';
}

export function RecursiveTaskItem({
  task,
  level = 0,
  onToggleStatus,
  onAddSubTask,
  onSelectTask,
  platform = typeof window !== 'undefined' ? 'web' : 'native',
}: RecursiveTaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const hasSubTasks = task.subTasks && task.subTasks.length > 0;
  const isCompleted = task.status === 'COMPLETED';
  const isWeb = platform === 'web';

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      onAddSubTask(task.id, newSubTaskTitle);
      setNewSubTaskTitle('');
      setIsAddingSubTask(false);
      setIsExpanded(true);
    }
  };

  if (isWeb) {
    return (
      <div className="flex-col">
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
          platform={platform}
        />

        {/* Sub-tasks & Input */}
        {isExpanded && (
          <div>
            {task.subTasks?.map((subTask: Task) => (
              <RecursiveTaskItem
                key={subTask.id}
                task={subTask}
                level={level + 1}
                onToggleStatus={onToggleStatus}
                onAddSubTask={onAddSubTask}
                onSelectTask={onSelectTask}
                platform={platform}
              />
            ))}

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

  return (
    <View className="flex-col">
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
        platform={platform}
      />

      {/* Sub-tasks & Input */}
      {isExpanded && (
        <View>
          {task.subTasks?.map((subTask: Task) => (
            <RecursiveTaskItem
              key={subTask.id}
              task={subTask}
              level={level + 1}
              onToggleStatus={onToggleStatus}
              onAddSubTask={onAddSubTask}
              onSelectTask={onSelectTask}
              platform={platform}
            />
          ))}

          {/* Inline Add Sub-task Input */}
          {isAddingSubTask && (
            <View className={cn('mt-1 ml-10 flex-row items-center', level > 0 && 'ml-16')}>
              <View className="mr-3 h-4 w-4 items-center justify-center">
                <View className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              </View>
              <TextInput
                className="flex-1 rounded border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                placeholder="Sub-task title..."
                value={newSubTaskTitle}
                onChangeText={setNewSubTaskTitle}
                onSubmitEditing={handleAddSubTask}
                autoFocus
                onBlur={() => {
                  if (!newSubTaskTitle.trim()) setIsAddingSubTask(false);
                }}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
