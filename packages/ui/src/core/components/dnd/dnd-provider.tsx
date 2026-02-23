/**
 * DnD Provider Component
 *
 * Platform-specific implementation wrapper for drag and drop context.
 * This component wraps @dnd-kit's DndContext and can be replaced with
 * React Native's gesture handler in the future.
 *
 * Usage:
 * ```tsx
 * <DndProvider onDragEnd={handleDragEnd}>
 *   <YourDraggableContent />
 * </DndProvider>
 * ```
 */

'use client';

import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { DragResult } from '@giulio-leone/types';

interface DndProviderProps {
  children: ReactNode;
  onDragEnd: (result: DragResult) => void;
  onDragStart?: (dragId: string) => void;
  onDragCancel?: () => void;
  renderDragOverlay?: (dragId: string) => ReactNode;
}

export function DndProvider({
  children,
  onDragEnd,
  onDragStart,
  onDragCancel,
  renderDragOverlay,
}: DndProviderProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Configure sensors for touch, mouse, and keyboard
  const sensors = useSensors(
    // Mouse sensor: standard drag with mouse
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    // Touch sensor: optimized for mobile with long-press
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms long-press to start drag
        tolerance: 8, // 8px movement tolerance during long-press
      },
    }),
    // Keyboard sensor: accessibility support
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const dragId = event.active.id as string;
      setActiveDragId(dragId);
      onDragStart?.(dragId);
    },
    [onDragStart]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveDragId(null);

      if (!over) {
        // Dropped outside valid zone
        onDragEnd({
          draggableId: active.id as string,
          source: {
            index: 0, // Will be filled by specific handlers
          },
          destination: null,
          type: 'nutrition-food', // Will be determined by specific handlers
        });
        return;
      }

      // Convert dnd-kit event to our DragResult interface
      const result: DragResult = {
        draggableId: active.id as string,
        source: {
          index: 0, // Will be filled by specific handlers
        },
        destination: {
          index: 0, // Will be filled by specific handlers
        },
        type: 'nutrition-food', // Will be determined by specific handlers
      };

      onDragEnd(result);
    },
    [onDragEnd]
  );

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    onDragCancel?.();
  }, [onDragCancel]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeDragId && renderDragOverlay ? renderDragOverlay(activeDragId) : null}
      </DragOverlay>
    </DndContext>
  );
}
