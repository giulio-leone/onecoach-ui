/**
 * Button Component - Shared Logic
 *
 * Common types and utilities for both web and native buttons
 * Following DRY principle to eliminate duplication
 */

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'default'
  | 'outline'
  | 'success'
  | 'info'
  | 'glass'
  | 'gradient-primary'
  | 'gradient-secondary';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonSharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  children?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Get icon size based on button size
 */
export function getIconSize(size: ButtonSize): number {
  const iconSizes: Record<ButtonSize, number> = {
    sm: 16,
    md: 20,
    lg: 24,
    icon: 18,
    'icon-sm': 14,
  };
  return iconSizes[size];
}

/**
 * Get minimum height for button size (touch-friendly, minimum 44x44px)
 */
export function getMinHeight(size: ButtonSize): number {
  const minHeights: Record<ButtonSize, number> = {
    sm: 44, // 2.75rem
    md: 48, // 3rem
    lg: 56, // 3.5rem
    icon: 36,
    'icon-sm': 32,
  };
  return minHeights[size];
}
