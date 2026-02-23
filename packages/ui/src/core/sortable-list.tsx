/**
 * Sortable List Component
 *
 * Platform-specific implementation wrapper for sortable lists.
 * This component wraps @dnd-kit's SortableContext and can be replaced with
 * React Native's gesture handler in the future.
 *
 * Usage:
 * ```tsx
 * <SortableList items={['id1', 'id2', 'id3']} strategy="vertical">
 *   {items.map((item) => (
 *     <SortableItem key={item.id} id={item.id}>
 *       {(props) => <div {...props}>Content</div>}
 *     </SortableItem>
 *   ))}
 * </SortableList>
 * ```
 */

'use client';

import type { ReactNode } from 'react';
import type { SortingStrategy } from '@dnd-kit/sortable';
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

type SortStrategy = 'vertical' | 'horizontal';

interface SortableListProps {
  items: string[];
  children: ReactNode;
  strategy?: SortStrategy;
  id?: string;
}

const strategyMap: Record<SortStrategy, SortingStrategy> = {
  vertical: verticalListSortingStrategy,
  horizontal: horizontalListSortingStrategy,
};

export function SortableList({ items, children, strategy = 'vertical', id }: SortableListProps) {
  return (
    <SortableContext items={items} strategy={strategyMap[strategy]} id={id}>
      {children}
    </SortableContext>
  );
}
