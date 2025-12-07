/**
 * EmptyState Component
 *
 * Generic empty state component for visual builders
 * Used when no items are present (weeks, days, exercises, meals, etc.)
 * Fully optimized for dark mode
 */
import React from 'react';
export interface EmptyStateProps {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
    className?: string;
}
export declare function EmptyState({ message, actionLabel, onAction, icon, className, }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
