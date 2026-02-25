'use client';

import type { ReactNode } from 'react';

interface SwipeableListItemProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

/** Web stub — native swipe not available, renders children as-is */
export function SwipeableListItem({ children }: SwipeableListItemProps) {
  return <div>{children}</div>;
}
