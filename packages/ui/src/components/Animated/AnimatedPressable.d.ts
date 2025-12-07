import React from 'react';
import { type PressableProps } from 'react-native';
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
export declare function AnimatedPressableButton({ children, hapticFeedback, scaleValue, onPressIn, onPressOut, onPress, style, ...props }: AnimatedPressableButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
