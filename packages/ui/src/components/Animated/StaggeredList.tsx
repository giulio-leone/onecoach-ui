import React from 'react';
import Animated from 'react-native-reanimated';
import type { ViewStyle, StyleProp } from 'react-native';
import { useStaggeredFadeIn } from '../../hooks/useAnimations';
import type { AnimationConfig } from '../../hooks/useAnimations';

interface StaggeredListItemProps {
  children: React.ReactNode;
  index: number;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated list item with staggered fade-in effect
 * Each item appears with a progressive delay based on its index
 */
export function StaggeredListItem({
  children,
  index,
  duration,
  delay,
  style,
}: StaggeredListItemProps) {
  const config: AnimationConfig = { duration, delay };
  const { animatedStyle } = useStaggeredFadeIn(index, config);
  const composedStyle = [animatedStyle, style].filter(Boolean) as unknown as StyleProp<ViewStyle>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Animated.View style={composedStyle as any}>{children}</Animated.View>;
}
