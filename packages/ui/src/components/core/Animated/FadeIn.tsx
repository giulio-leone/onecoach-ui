'use client';

import React, { useEffect, useState } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: React.CSSProperties;
}

/**
 * Web version of FadeIn using CSS animations
 */
export function FadeIn({ children, duration = 300, delay = 0, style }: FadeInProps) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle: React.CSSProperties = {
    opacity,
    transition: `opacity ${duration}ms ease-in-out`,
  };

  
  return <div style={{...animatedStyle, ...style}}>{children}</div>;
}
