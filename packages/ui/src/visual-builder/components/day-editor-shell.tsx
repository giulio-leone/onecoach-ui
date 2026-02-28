/**
 * DayEditorShell Component
 *
 * Generic shell component for day editors in visual builders.
 * Provides DnD context, header with stats, empty state, and mobile CTA.
 * Follows SRP - handles layout/structure, delegates content to children.
 *
 * @example
 * <DayEditorShell
 *   title="Giorno 1"
 *   itemCount={3}
 *   itemLabel="Esercizi"
 *   emptyIcon={<Dumbbell />}
 *   emptyMessage="Nessun esercizio"
 *   addButtonLabel="Aggiungi Esercizio"
 *   onAdd={() => setIsSelectorOpen(true)}
 *   themeColor="primary"
 * >
 *   {(dndContextId) => (
 *     <SortableContext items={items}>
 *       {items.map(item => <ItemCard key={item.id} ... />)}
 *     </SortableContext>
 *   )}
 * </DayEditorShell>
 */

'use client';

import { useId, type ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from '../../button';
import { Plus } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export interface DayEditorShellProps {
  /** Day title (e.g., "Giorno 1", day name) */
  title: string;
  /** Number of items in the day */
  itemCount: number;
  /** Label for items (e.g., "Esercizi", "Pasti") */
  itemLabel: string;
  /** Additional stats to show (e.g., "60 min stimati") */
  additionalStats?: string;
  /** Icon for empty state */
  emptyIcon: ReactNode;
  /** Message for empty state */
  emptyMessage: string;
  /** Sub-message for empty state */
  emptySubMessage?: string;
  /** Label for add button */
  addButtonLabel: string;
  /** Handler for add button */
  onAdd: () => void;
  /** Handler for drag end event */
  onDragEnd: (event: DragEndEvent) => void;
  /** Optional Handler for drag over event (required for cross-container) */
  onDragOver?: (event: DragOverEvent) => void;
  /** Optional Handler for drag start event */
  onDragStart?: (event: DragStartEvent) => void;
  /** Theme color variant */
  themeColor?: 'primary' | 'emerald';
  /** Children render function receiving DnD context ID */
  children: (dndContextId: string) => ReactNode;
  /** Optional header slot for additional content (e.g., macro summary) */
  headerSlot?: ReactNode;
  /** Optional header actions (e.g., dropdown menu) */
  headerActions?: ReactNode;
  /** Class name for wrapper */
  className?: string;
}

export function DayEditorShell({
  title,
  itemCount,
  itemLabel,
  additionalStats,
  emptyIcon,
  emptyMessage,
  emptySubMessage = 'Tocca per aggiungere il primo elemento',
  addButtonLabel,
  onAdd,
  onDragEnd,
  onDragOver,
  onDragStart,
  themeColor = 'primary',
  children,
  headerSlot,
  headerActions,
  className,
}: DayEditorShellProps) {
  const dndContextId = useId();

  // Theme-based color classes - Enhanced with Premium Styling
  const colorClasses = {
    primary: {
      // Container
      container:
        'dark:border-primary-500/20 dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-primary-950/40 dark:to-neutral-900/90 dark:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]',
      accentLine: 'bg-gradient-to-r from-transparent via-primary-400/40 to-transparent',

      // Badge
      badge: 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400',

      // Empty State
      emptyBorder:
        'hover:border-primary-400/50 hover:bg-primary-50/50 dark:hover:border-primary-500/40 dark:hover:bg-primary-950/20',
      emptyIcon: 'group-hover:shadow-primary-500/10',

      // Mobile Shadow
      shadow: 'shadow-primary-500/30',
    },
    emerald: {
      // Container
      container:
        'dark:border-emerald-500/20 dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-emerald-950/40 dark:to-neutral-900/90 dark:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]',
      accentLine: 'bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent',

      // Badge
      badge: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',

      // Empty State
      emptyBorder:
        'hover:border-primary-400/50 hover:bg-emerald-50/50 dark:hover:border-primary-500/40 dark:hover:bg-emerald-950/20',
      emptyIcon:
        'group-hover:shadow-emerald-500/10 group-hover:bg-emerald-500/20 group-hover:text-emerald-500',

      // Mobile Shadow
      shadow: 'shadow-emerald-500/30',
    },
  };

  const colors = colorClasses[themeColor] || colorClasses.primary;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms long press on mobile
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header Container - Premium Gradient Card */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border p-4 shadow-lg backdrop-blur-md sm:p-6',
          // Light mode base
          'border-neutral-200/50 bg-gradient-to-br from-neutral-50/90 via-white/80 to-neutral-100/90',
          // Dark mode - dynamic
          colors.container
        )}
      >
        {/* Subtle top accent line */}
        <div className={cn('absolute inset-x-0 top-0 h-px', colors.accentLine)} />

        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                {title}
              </h2>
              <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                <span className={cn('rounded-full px-2 py-0.5', colors.badge)}>
                  {itemCount} {itemLabel}
                </span>
                {additionalStats && (
                  <>
                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                    <span className="text-neutral-500 dark:text-neutral-400">{additionalStats}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={themeColor === 'emerald' ? 'success' : 'primary'}
                icon={<Plus size={16} className="text-white" />}
                onPress={onAdd}
                className={cn(
                  'flex-1 shadow-lg sm:w-auto',
                  themeColor === 'emerald' ? 'shadow-emerald-500/20' : 'shadow-primary-500/20'
                )}
              >
                {addButtonLabel}
              </Button>
              {headerActions}
            </div>
          </div>

          {/* Optional header slot (e.g., macro summary bar) */}
          {headerSlot}
        </div>
      </div>

      {/* DnD Context */}
      <DndContext
        id={dndContextId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex touch-pan-y flex-col gap-0 bg-transparent">
          {children(dndContextId)}

          {/* Empty State */}
          {itemCount === 0 && (
            <button
              onClick={onAdd}
              className={cn(
                'group flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed py-16 transition-all duration-300',
                'border-neutral-300 bg-neutral-50/50',
                'dark:border-white/[0.08] dark:bg-neutral-900/20',
                colors.emptyBorder
              )}
              type="button"
            >
              <div
                className={cn(
                  'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
                  'bg-neutral-100 text-neutral-400 group-hover:scale-110',
                  'dark:bg-neutral-800/50 dark:text-neutral-500',
                  colors.emptyIcon,
                  'group-hover:shadow-lg'
                )}
              >
                {emptyIcon}
              </div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {emptyMessage}
              </span>
              <span className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {emptySubMessage}
              </span>
            </button>
          )}
        </div>
      </DndContext>

      {/* Mobile CTA */}
      <div className="sticky bottom-3 z-20 sm:hidden">
        <Button
          variant={themeColor === 'emerald' ? 'success' : 'gradient-primary'}
          icon={<Plus size={16} className="text-white" />}
          onPress={onAdd}
          className={cn('w-full shadow-xl', colors.shadow)}
        >
          {addButtonLabel}
        </Button>
      </div>
    </div>
  );
}
