/**
 * ItemCard Component
 *
 * Generic card component for visual builder items
 * Base component for weeks, days, exercises, meals, foods
 * Fully optimized for dark mode
 */

import React from 'react';
import { GripVertical } from 'lucide-react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';

export interface ItemCardProps {
  children: React.ReactNode;
  isDragging?: boolean;
  dragHandleProps?: {
    attributes?: React.HTMLAttributes<HTMLElement>;
    listeners?: React.HTMLAttributes<HTMLElement>;
  };
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle';
  showDragHandle?: boolean;
}

export function ItemCard({
  children,
  isDragging = false,
  dragHandleProps,
  className = '',
  variant = 'default',
  showDragHandle = false,
}: ItemCardProps) {
  const cardClass =
    variant === 'elevated'
      ? darkModeClasses.card.elevated
      : variant === 'subtle'
        ? cn(darkModeClasses.bg.subtle, darkModeClasses.border.base)
        : darkModeClasses.card.base;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ease-out',
        cardClass,
        isDragging && 'scale-[0.97] rotate-1 opacity-60 shadow-xl',
        !isDragging && 'hover:shadow-md dark:hover:shadow-xl',
        className
      )}
    >
      {showDragHandle && dragHandleProps && (
        <div
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
          className={cn(
            'flex min-h-[44px] min-w-[44px] cursor-grab touch-manipulation items-center justify-center rounded-lg transition-all duration-200 active:cursor-grabbing',
            darkModeClasses.text.tertiary,
            'hover:bg-neutral-50/50 hover:text-neutral-600 dark:hover:bg-neutral-700/30 dark:hover:text-neutral-400'
          )}
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}
      {children}
    </div>
  );
}
