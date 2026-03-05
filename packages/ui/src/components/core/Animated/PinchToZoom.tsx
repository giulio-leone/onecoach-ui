'use client';

import React, { useRef, useState, useCallback } from 'react';

interface PinchToZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function PinchToZoom({
  children,
  minScale = 1,
  maxScale = 4,
  style,
  className,
}: PinchToZoomProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = useCallback(() => {
    setScale((prev) => (prev > 1 ? minScale : Math.min(2, maxScale)));
  }, [minScale, maxScale]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setScale((prev) => {
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        return Math.min(Math.max(prev * delta, minScale), maxScale);
      });
    },
    [minScale, maxScale]
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflow: 'hidden', ...style }}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 200ms ease-out',
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

