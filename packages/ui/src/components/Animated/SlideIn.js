import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import Animated from 'react-native-reanimated';
import { useSlideIn } from '../../hooks/useAnimations';
/**
 * Animated SlideIn component
 * Slides content in from specified direction
 */
export function SlideIn({ children, direction = 'left', duration, delay, style }) {
    const config = { duration, delay };
    const { animatedStyle } = useSlideIn(direction, config);
    const composedStyle = [animatedStyle, style].filter(Boolean);
    return _jsx(Animated.View, { style: composedStyle, children: children });
}
