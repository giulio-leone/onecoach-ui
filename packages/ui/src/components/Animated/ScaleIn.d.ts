import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
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
export declare function ScaleIn({ children, delay, damping, stiffness, style }: ScaleInProps): import("react/jsx-runtime").JSX.Element;
export {};
