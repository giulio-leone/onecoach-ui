/**
 * Badge Component
 *
 * Mobile-first, touch-friendly badge with design tokens
 * Componente per etichette e tag
 */
import React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}
export declare const Badge: ({ variant, size, children, className, ...props }: BadgeProps) => import("react/jsx-runtime").JSX.Element;
