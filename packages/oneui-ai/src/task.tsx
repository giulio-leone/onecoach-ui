'use client';

import { cn } from '@giulio-leone/lib-design-system';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@giulio-leone/ui';
import { ChevronDownIcon, CheckCircle2, CircleDashed, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';

export type TaskStatus = 'pending' | 'active' | 'completed' | 'error';

export type TaskProps = ComponentProps<typeof Collapsible> & {
  status?: TaskStatus;
};

export const Task = ({
  defaultOpen = false,
  className,
  children,
  status = 'pending',
  ...props
}: TaskProps) => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <Collapsible
      className={cn(
        'group rounded-lg border border-transparent bg-transparent transition-all duration-200',
        status === 'active' &&
          'border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10',
        status === 'error' &&
          'border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10',
        className
      )}
      defaultOpen={defaultOpen}
      {...props}
    >
      {children}
    </Collapsible>
  </motion.div>
);

export type TaskTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title: string;
  status?: TaskStatus;
  meta?: string;
  icon?: ReactNode;
};

export const TaskTrigger = ({
  children: _children,
  className,
  title,
  status = 'pending',
  meta,
  icon,
  ...props
}: TaskTriggerProps) => {
  return (
    <CollapsibleTrigger asChild className={cn('group/trigger w-full', className)} {...props}>
      <div className="flex w-full cursor-pointer items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <div className="flex items-center justify-center">
            {icon ? (
              icon
            ) : status === 'completed' ? (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </motion.div>
            ) : status === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : status === 'active' ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <CircleDashed className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col items-start text-left">
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                status === 'active'
                  ? 'text-blue-700 dark:text-blue-300'
                  : status === 'completed'
                    ? 'text-neutral-700 dark:text-neutral-300'
                    : status === 'error'
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {meta && <span className="hidden text-xs text-neutral-400 sm:inline-block">{meta}</span>}
          <ChevronDownIcon className="h-4 w-4 text-neutral-400 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180" />
        </div>
      </div>
    </CollapsibleTrigger>
  );
};

export type TaskContentProps = ComponentProps<typeof CollapsibleContent>;

export const TaskContent = ({ children, className, ...props }: TaskContentProps) => (
  <CollapsibleContent
    className={cn(
      'data-[state=closed]:animate-collapse data-[state=open]:animate-expand overflow-hidden text-sm',
      className
    )}
    {...props}
  >
    <div className="pt-0 pr-3 pb-3 pl-10 text-neutral-600 dark:text-neutral-400">{children}</div>
  </CollapsibleContent>
);

export type TaskItemProps = ComponentProps<'div'>;
export const TaskItem = ({ className, ...props }: TaskItemProps) => (
  <div className={cn('flex flex-col gap-1', className)} {...props} />
);
