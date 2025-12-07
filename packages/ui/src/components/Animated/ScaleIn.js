import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import Animated from 'react-native-reanimated';
import { useScaleIn } from '../../hooks/useAnimations';
/**
 * Animated ScaleIn component with spring physics
 * Scales content from small to full size with bounce
 */
export function ScaleIn({ children, delay, damping, stiffness, style }) {
    const config = { delay, damping, stiffness };
    const { animatedStyle } = useScaleIn(config);
    const composedStyle = [animatedStyle, style].filter(Boolean);
    return _jsx(Animated.View, { style: composedStyle, children: children });
}
