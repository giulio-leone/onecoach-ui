import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
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
export declare function SlideIn({ children, direction, duration, delay, style }: SlideInProps): import("react/jsx-runtime").JSX.Element;
export {};
