'use client';

import React, { useEffect, useState } from 'react';
import { View } from 'react-native-web';
import type { ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle | ViewStyle[];
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

  return <View style={[animatedStyle, style] as any}>{children}</View>;
}
