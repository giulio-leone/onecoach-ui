import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
interface StaggeredListItemProps {
    children: React.ReactNode;
    index: number;
    duration?: number;
    delay?: number;
    style?: StyleProp<ViewStyle>;
}
/**
 * Animated list item with staggered fade-in effect
 * Each item appears with a progressive delay based on its index
 */
export declare function StaggeredListItem({ children, index, duration, delay, style, }: StaggeredListItemProps): import("react/jsx-runtime").JSX.Element;
export {};
