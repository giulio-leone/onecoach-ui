'use client';

import React, { useEffect, useState } from 'react';
import { View } from 'react-native-web';
import type { ViewStyle } from 'react-native';

interface StaggeredListItemProps {
  children: React.ReactNode;
  index: number;
  duration?: number;
  delay?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Web version of StaggeredListItem using CSS animations
 */
export function StaggeredListItem({
  children,
  index,
  duration = 300,
  delay = 50,
  style,
}: StaggeredListItemProps) {
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(20);

  useEffect(() => {
    const itemDelay = index * delay;
    const timer = setTimeout(() => {
      setOpacity(1);
      setTranslateY(0);
    }, itemDelay);

    return () => clearTimeout(timer);
  }, [index, delay]);

  const animatedStyle: React.CSSProperties = {
    opacity,
    transform: `translateY(${translateY}px)`,
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <View style={[animatedStyle, style] as any}>{children}</View>;
}
