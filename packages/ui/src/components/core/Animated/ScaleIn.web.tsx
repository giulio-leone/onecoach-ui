'use client';

import React, { useEffect, useState } from 'react';
import { View } from 'react-native-web';
import type { ViewStyle } from 'react-native';

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  damping?: number;
  stiffness?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Web version of ScaleIn using CSS animations
 */
export function ScaleIn({
  children,
  delay = 0,
  damping = 15,
  stiffness = 150,
  style,
}: ScaleInProps) {
  const [scale, setScale] = useState(0.8);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScale(1);
      setOpacity(1);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Calculate duration from spring physics (approximation)
  const duration = Math.max(200, Math.sqrt(stiffness / damping) * 100);

  const animatedStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    opacity,
    transition: `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease-out`,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <View style={[animatedStyle, style] as any}>{children}</View>;
}
