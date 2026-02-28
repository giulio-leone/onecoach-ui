import React from 'react';
import Animated from 'react-native-reanimated';
import type { ViewStyle, StyleProp } from 'react-native';
import { useSlideIn } from '../../hooks/useAnimations';
import type { AnimationConfig } from '../../hooks/useAnimations';

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated SlideIn component
 * Slides content in from specified direction
 */
export function SlideIn({ children, direction = 'left', duration, delay, style }: SlideInProps) {
  const config: AnimationConfig = { duration, delay };
  const { animatedStyle } = useSlideIn(direction, config);
  const composedStyle = [animatedStyle, style].filter(Boolean) as unknown as StyleProp<ViewStyle>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Animated.View style={composedStyle as any}>{children}</Animated.View>;
}
