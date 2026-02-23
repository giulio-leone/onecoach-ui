'use client';

import React from 'react';
import { Pressable, type PressableProps } from 'react-native-web';

interface AnimatedPressableButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  hapticFeedback?: boolean;
  scaleValue?: number;
  style?: PressableProps['style'];
}

/**
 * Web version of AnimatedPressable using CSS transitions
 */
export function AnimatedPressableButton({
  children,
  hapticFeedback = false, // No haptics on web
  scaleValue = 0.95,
  style,
  ...props
}: AnimatedPressableButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  const animatedStyle: React.CSSProperties = {
    transform: `scale(${isPressed ? scaleValue : 1})`,
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={[animatedStyle, style] as any}
      {...props}
    >
      {children}
    </Pressable>
  );
}
