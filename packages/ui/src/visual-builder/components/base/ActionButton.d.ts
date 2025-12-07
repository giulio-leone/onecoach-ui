/**
 * ActionButton Component
 *
 * Standardized action button for visual builders
 * Supports multiple variants and sizes
 * Fully optimized for dark mode
 */
import React from 'react';
export interface ActionButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
}
export declare function ActionButton({ onClick, children, variant, size, disabled, icon, className, fullWidth, }: ActionButtonProps): import("react/jsx-runtime").JSX.Element;
