import React from 'react';
import Animated from 'react-native-reanimated';
import type { ViewStyle, StyleProp } from 'react-native';
import { useFadeIn } from '../../../hooks/useAnimations';
import type { AnimationConfig } from '../../../hooks/useAnimations';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated FadeIn component
 * Wraps children with a fade-in animation
 */
export function FadeIn({ children, duration, delay, style }: FadeInProps) {
  const config: AnimationConfig = { duration, delay };
  const { animatedStyle } = useFadeIn(config);
  const composedStyle = [animatedStyle, style].filter(Boolean) as unknown as StyleProp<ViewStyle>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Animated.View style={composedStyle as any}>{children}</Animated.View>;
}
