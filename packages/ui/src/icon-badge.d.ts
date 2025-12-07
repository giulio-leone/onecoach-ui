/**
 * IconBadge Component
 *
 * Reusable icon badge with optimized dark mode styling.
 * Used for transaction icons, status indicators, etc.
 */
import type { LucideIcon } from 'lucide-react';
export interface IconBadgeProps {
    icon: LucideIcon;
    variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'purple';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export declare function IconBadge({ icon: Icon, variant, size, className, }: IconBadgeProps): import("react/jsx-runtime").JSX.Element;
