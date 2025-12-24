/**
 * SortableItemCard Component
 *
 * Generic wrapper for sortable items in visual builders.
 * Uses @dnd-kit/sortable for drag-and-drop functionality.
 * Follows DRY principle - single implementation for all sortable items.
 *
 * @example
 * <SortableItemCard id={item.id} index={index}>
 *   {({ isDragging, dragAttributes, dragListeners }) => (
 *     <MyItemCard isDragging={isDragging} ... />
 *   )}
 * </SortableItemCard>
 */

'use client';

import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';

export interface SortableRenderProps {
  /** Whether the item is currently being dragged */
  isDragging: boolean;
  /** Drag handle attributes (aria, role, tabIndex) */
  dragAttributes: DraggableAttributes;
  /** Drag handle event listeners */
  dragListeners: DraggableSyntheticListeners;
  /** Ref setter for the sortable node */
  setNodeRef: (node: HTMLElement | null) => void;
}

export interface SortableItemCardProps {
  /** Unique identifier for the sortable item */
  id: string;
  /** Optional index for fallback ID generation */
  index?: number;
  /** Render function receiving drag state and handlers */
  children: (props: SortableRenderProps) => ReactNode;
  /** Additional className for the wrapper */
  className?: string;
  /** Whether to disable sorting for this item */
  disabled?: boolean;
  /** Data to identify the item (e.g. { type: 'Meal', mealId: '...' }) */
  data?: Record<string, unknown>;
}

export function SortableItemCard({
  id,
  index = 0,
  children,
  className = '',
  disabled = false,
  data,
}: SortableItemCardProps) {
  const sortableId = id || `item-${index}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    disabled,
    data,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
    >
      {children({
        isDragging,
        dragAttributes: attributes,
        dragListeners: listeners,
        setNodeRef,
      })}
    </div>
  );
}

/**
 * Simplified SortableItemCard that just wraps content
 * For cases where you don't need drag handle control
 */
export interface SimpleSortableItemProps {
  id: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SimpleSortableItem({
  id,
  children,
  className = '',
  disabled = false,
}: SimpleSortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
