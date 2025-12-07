import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
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
export declare function FadeIn({ children, duration, delay, style }: FadeInProps): import("react/jsx-runtime").JSX.Element;
export {};
