import React from 'react';
import { type ViewStyle, type StyleProp } from 'react-native';
interface SwipeableListItemProps {
    children: React.ReactNode;
    onDelete?: () => void;
    onArchive?: () => void;
    deleteThreshold?: number;
    archiveThreshold?: number;
    style?: StyleProp<ViewStyle>;
}
/**
 * Swipeable list item with left/right swipe actions
 * Swipe right for archive, swipe left for delete
 */
export declare function SwipeableListItem({ children, onDelete, onArchive, deleteThreshold, archiveThreshold, style, }: SwipeableListItemProps): import("react/jsx-runtime").JSX.Element;
export {};
