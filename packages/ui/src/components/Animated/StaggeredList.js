import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import Animated from 'react-native-reanimated';
import { useStaggeredFadeIn } from '../../hooks/useAnimations';
/**
 * Animated list item with staggered fade-in effect
 * Each item appears with a progressive delay based on its index
 */
export function StaggeredListItem({ children, index, duration, delay, style, }) {
    const config = { duration, delay };
    const { animatedStyle } = useStaggeredFadeIn(index, config);
    const composedStyle = [animatedStyle, style].filter(Boolean);
    return _jsx(Animated.View, { style: composedStyle, children: children });
}
