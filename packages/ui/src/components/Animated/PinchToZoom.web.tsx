'use client';

import type { ReactNode } from 'react';

interface PinchToZoomProps {
  children: ReactNode;
}

/** Web stub — native pinch gesture not available, renders children as-is */
export function PinchToZoom({ children }: PinchToZoomProps) {
  return <div>{children}</div>;
}
