import React from 'react';
import { type ViewStyle, type StyleProp } from 'react-native';
interface DraggableListItemProps {
    children: React.ReactNode;
    onDragStart?: () => void;
    onDragEnd?: (newY: number) => void;
    style?: StyleProp<ViewStyle>;
}
/**
 * Draggable list item for reordering
 * Long press to start dragging, then move vertically to reorder
 */
export declare function DraggableListItem({ children, onDragStart, onDragEnd, style, }: DraggableListItemProps): import("react/jsx-runtime").JSX.Element;
export {};
