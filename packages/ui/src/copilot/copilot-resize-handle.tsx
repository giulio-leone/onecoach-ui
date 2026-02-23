'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useCopilotStore } from '@giulio-leone/lib-stores';
import { cn } from '@giulio-leone/lib-design-system';

interface CopilotResizeHandleProps {
  className?: string;
}

export function CopilotResizeHandle({
  className }: CopilotResizeHandleProps) {
  const { width, setWidth, setResizing, minWidth, maxWidth } = useCopilotStore();
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      setResizing(true);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [width, setResizing]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      // Resize from left edge (sidebar is on right side)
      const deltaX = startXRef.current - e.clientX;
      const newWidth = startWidthRef.current + deltaX;

      // Clamp to min/max
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(clampedWidth);
    },
    [minWidth, maxWidth, setWidth]
  );

  const handleMouseUp = useCallback(() => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      setResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [setResizing]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Touch support for tablet
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      isResizingRef.current = true;
      startXRef.current = touch.clientX;
      startWidthRef.current = width;
      setResizing(true);
    },
    [width, setResizing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isResizingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = startXRef.current - touch.clientX;
      const newWidth = startWidthRef.current + deltaX;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(clampedWidth);
    },
    [minWidth, maxWidth, setWidth]
  );

  const handleTouchEnd = useCallback(() => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      setResizing(false);
    }
  }, [setResizing]);

  useEffect(() => {
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn(
        // Positioning
        'absolute top-0 left-0 h-full w-1',
        // Appearance
        'hover:bg-primary/20 active:bg-primary/40 bg-transparent',
        // Cursor
        'cursor-col-resize',
        // Transition
        'transition-colors duration-150',
        // Increase touch target
        'before:absolute before:top-0 before:left-[-4px] before:h-full before:w-[9px] before:content-[""]',
        className
      )}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize Copilot sidebar"
      tabIndex={0}
    />
  );
}
