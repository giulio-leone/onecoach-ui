import React from 'react';
import { Pressable, type PressableProps, type GestureResponderEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  hapticFeedback?: boolean;
  scaleValue?: number;
  style?: PressableProps['style'];
}

/**
 * Pressable with scale animation and haptic feedback
 * Provides visual and tactile feedback on press
 */
export function AnimatedPressableButton({
  children,
  hapticFeedback = true,
  scaleValue = 0.95,
  onPressIn,
  onPressOut,
  onPress,
  style,
  ...props
}: AnimatedPressableButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    // Reanimated shared values sono mutabili per animazioni; safe su UI thread
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(scaleValue, { damping: 15, stiffness: 400 });
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    onPressOut?.(event);
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.(event);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
