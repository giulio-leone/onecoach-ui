'use client';

import React, { useEffect, useState } from 'react';
import { View } from 'react-native-web';
import type { ViewStyle } from 'react-native';

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Web version of SlideIn using CSS animations
 */
export function SlideIn({
  children,
  direction = 'left',
  duration = 300,
  delay = 0,
  style,
}: SlideInProps) {
  const getInitialTransform = () => {
    switch (direction) {
      case 'left':
        return 'translate(-50px, 0)';
      case 'right':
        return 'translate(50px, 0)';
      case 'up':
        return 'translate(0, -50px)';
      case 'down':
        return 'translate(0, 50px)';
      default:
        return 'translate(0, 0)';
    }
  };

  const [transform, setTransform] = useState<string>(
    delay === 0 ? 'translate(0, 0)' : getInitialTransform()
  );
  const [opacity, setOpacity] = useState(delay === 0 ? 1 : 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransform('translate(0, 0)');
      setOpacity(1);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle: React.CSSProperties = {
    transform,
    opacity,
    transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <View style={[animatedStyle, style] as any}>{children}</View>;
}
