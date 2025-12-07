/**
 * GlassCard Component - Web Optimized
 *
 * Modern glassmorphism card with advanced effects for web platform.
 * Matches the design system of the native counterpart but using native DOM elements.
 */
import React from 'react';
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    intensity?: 'light' | 'medium' | 'heavy';
    variant?: 'default' | 'active' | 'error' | 'success';
    gradient?: boolean;
}
declare const GlassCardComponent: React.ForwardRefExoticComponent<GlassCardProps & React.RefAttributes<HTMLDivElement>>;
export { GlassCardComponent as GlassCard };
