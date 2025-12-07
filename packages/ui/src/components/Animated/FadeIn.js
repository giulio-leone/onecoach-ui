import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import Animated from 'react-native-reanimated';
import { useFadeIn } from '../../hooks/useAnimations';
/**
 * Animated FadeIn component
 * Wraps children with a fade-in animation
 */
export function FadeIn({ children, duration, delay, style }) {
    const config = { duration, delay };
    const { animatedStyle } = useFadeIn(config);
    const composedStyle = [animatedStyle, style].filter(Boolean);
    return _jsx(Animated.View, { style: composedStyle, children: children });
}
