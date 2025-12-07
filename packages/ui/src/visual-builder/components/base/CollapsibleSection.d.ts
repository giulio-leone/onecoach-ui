/**
 * CollapsibleSection Component
 *
 * Generic collapsible/expandable section component
 * Used for weeks, days, meals, exercises, etc.
 * Fully optimized for dark mode
 */
import React from 'react';
export interface CollapsibleSectionProps {
    title: string | React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    headerActions?: React.ReactNode;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    variant?: 'default' | 'card' | 'subtle';
}
export declare function CollapsibleSection({ title, isExpanded, onToggle, children, headerActions, className, headerClassName, contentClassName, variant, }: CollapsibleSectionProps): import("react/jsx-runtime").JSX.Element;
