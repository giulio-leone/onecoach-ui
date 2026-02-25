'use client';

import type { ReactNode } from 'react';

interface DraggableListItemProps {
  children: ReactNode;
  onDragEnd?: () => void;
}

/** Web stub — native drag not available, renders children as-is */
export function DraggableListItem({ children }: DraggableListItemProps) {
  return <div>{children}</div>;
}
