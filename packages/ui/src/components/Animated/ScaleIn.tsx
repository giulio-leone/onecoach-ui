import React from 'react';
import Animated from 'react-native-reanimated';
import type { ViewStyle, StyleProp } from 'react-native';
import { useScaleIn } from '../../hooks/useAnimations';
import type { AnimationConfig } from '../../hooks/useAnimations';

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  damping?: number;
  stiffness?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated ScaleIn component with spring physics
 * Scales content from small to full size with bounce
 */
export function ScaleIn({ children, delay, damping, stiffness, style }: ScaleInProps) {
  const config: AnimationConfig = { delay, damping, stiffness };
  const { animatedStyle } = useScaleIn(config);
  const composedStyle = [animatedStyle, style].filter(Boolean) as StyleProp<ViewStyle>;

  return <Animated.View style={composedStyle}>{children}</Animated.View>;
}
