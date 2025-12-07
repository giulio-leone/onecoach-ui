/**
 * ItemCard Component
 *
 * Generic card component for visual builder items
 * Base component for weeks, days, exercises, meals, foods
 * Fully optimized for dark mode
 */
import React from 'react';
export interface ItemCardProps {
    children: React.ReactNode;
    isDragging?: boolean;
    dragHandleProps?: {
        attributes?: React.HTMLAttributes<HTMLElement>;
        listeners?: React.HTMLAttributes<HTMLElement>;
    };
    className?: string;
    variant?: 'default' | 'elevated' | 'subtle';
    showDragHandle?: boolean;
}
export declare function ItemCard({ children, isDragging, dragHandleProps, className, variant, showDragHandle, }: ItemCardProps): import("react/jsx-runtime").JSX.Element;
