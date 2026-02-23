/**
 * Sortable Item Component
 *
 * Platform-specific implementation wrapper for sortable items.
 * This component wraps @dnd-kit's useSortable and can be replaced with
 * React Native's gesture handler in the future.
 *
 * Usage:
 * ```tsx
 * <SortableItem id="unique-id">
 *   {(props) => (
 *     <div {...props.attributes} {...props.listeners} ref={props.setNodeRef}>
 *       <GripVertical className="drag-handle" />
 *       Your content
 *     </div>
 *   )}
 * </SortableItem>
 * ```
 */

'use client';

import type { ReactNode, CSSProperties } from 'react';
import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';

interface SortableItemProps {
  id: string;
  children: (props: SortableItemRenderProps) => ReactNode;
  disabled?: boolean;
  data?: Record<string, unknown>;
}

export interface SortableItemRenderProps {
  // Drag handle props - attach to the element that should trigger drag
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  // Ref for the draggable element
  setNodeRef: (node: HTMLElement | null) => void;
  // Drag handle ref (optional, if you want separate handle)
  setActivatorNodeRef?: (node: HTMLElement | null) => void;
  // Visual state
  isDragging: boolean;
  isOver: boolean;
  // Style to apply for drag animation
  style: CSSProperties;
  // Transform for custom animations
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null;
  transition: string | undefined;
}

// OPTIMIZATION: Wrap with React.memo to prevent unnecessary re-renders
export const SortableItem = memo(function SortableItem({
  id,
  children,
  disabled = false,
  data,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id,
    disabled,
    data,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Add touch-friendly cursor
    cursor: isDragging ? 'grabbing' : 'grab',
    // Ensure touch actions are enabled
    touchAction: 'none',
    // Add opacity when dragging
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      {children({
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        isDragging,
        isOver,
        style,
        transform,
        transition,
      })}
    </>
  );
});
