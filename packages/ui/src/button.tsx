/**
 * Button Component - Web
 *
 * Mobile-first, touch-friendly button with design tokens
 * Minimum 44x44px hit area, WCAG AA compliant
 */

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@OneCoach/lib-design-system';
import {
  type ButtonVariant,
  type ButtonSize,
  type ButtonSharedProps,
  getIconSize,
} from './button.shared';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>, ButtonSharedProps {
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

// Re-export types for convenience
export type { ButtonVariant, ButtonSize } from './button.shared';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      iconOnly = false,
      children,
      className = '',
      disabled,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const isIconButton = size === 'icon' || size === 'icon-sm' || iconOnly;
    // Variant styles using design tokens - WCAG AA compliant
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'relative overflow-hidden border border-white/10 bg-gradient-to-r from-[#1f2a44] via-[#243b6b] to-[#2a4d9f] text-white shadow-[0_18px_40px_-16px_rgba(36,59,107,0.9)] hover:shadow-[0_22px_52px_-16px_rgba(36,59,107,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 backdrop-blur',
      secondary:
        'border border-neutral-200/80 bg-white/90 text-neutral-800 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.55)] hover:shadow-[0_14px_38px_-16px_rgba(15,23,42,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-100',
      danger:
        'bg-gradient-to-r from-error-600 to-error-500 text-white shadow-[0_16px_40px_-18px_rgba(239,68,68,0.6)] hover:shadow-[0_18px_48px_-18px_rgba(239,68,68,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
      ghost:
        'bg-transparent text-primary-700 hover:bg-primary-50/70 active:bg-primary-100/70 transition-all duration-200 dark:text-primary-200 dark:hover:bg-primary-500/10 dark:active:bg-primary-500/20',
      default:
        'relative overflow-hidden border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#1f2a44] to-[#2a4d9f] text-white shadow-[0_18px_42px_-16px_rgba(31,42,68,0.85)] hover:shadow-[0_22px_52px_-16px_rgba(31,42,68,0.95)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 backdrop-blur',
      outline:
        'border border-primary-300/80 bg-white/60 text-primary-700 shadow-[0_10px_30px_-20px_rgba(99,102,241,0.65)] hover:bg-primary-50/80 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 dark:border-primary-500/50 dark:bg-white/5 dark:text-primary-200 dark:hover:bg-primary-500/10',
      success:
        'bg-gradient-to-r from-success-600 to-success-500 text-white shadow-[0_16px_40px_-18px_rgba(34,197,94,0.55)] hover:shadow-[0_18px_48px_-18px_rgba(34,197,94,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
      info:
        'bg-gradient-to-r from-info-600 to-info-500 text-white shadow-[0_16px_40px_-18px_rgba(14,165,233,0.6)] hover:shadow-[0_18px_48px_-18px_rgba(14,165,233,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
      glass:
        'border border-white/12 bg-white/10 text-white shadow-[0_14px_36px_-18px_rgba(15,23,42,0.6)] hover:shadow-[0_18px_44px_-16px_rgba(15,23,42,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 backdrop-blur-lg dark:border-white/15 dark:bg-white/5',
    };

    // Size styles - Touch-friendly (minimum 44x44px)
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'min-h-[2.75rem] min-w-[2.75rem] px-3 py-2 text-sm rounded-full', // 44px min
      md: 'min-h-[3rem] min-w-[3rem] px-5 py-2.5 text-base rounded-full', // 48px min
      lg: 'min-h-[3.5rem] min-w-[3.5rem] px-8 py-3.5 text-lg rounded-full', // 56px min
      icon: 'min-h-[2.5rem] min-w-[2.5rem] px-0 rounded-full',
      'icon-sm': 'min-h-[2.25rem] min-w-[2.25rem] px-0 text-sm rounded-full',
    };

    const iconSize = getIconSize(size);

    const baseStyles = cn(
      'font-semibold tracking-wide transition-all duration-300',
      'inline-flex items-center justify-center gap-2.5',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      'focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'disabled:hover:scale-100 disabled:active:scale-100 disabled:shadow-none disabled:hover:shadow-none',
      'touch-manipulation', // Optimize for touch
      fullWidth && 'w-full',
      isIconButton && 'aspect-square p-0'
    );

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {Icon && iconPosition === 'left' && (
          <Icon
            size={iconSize}
            className={cn('flex-shrink-0', Icon.name === 'Loader2' && 'animate-spin')}
            aria-hidden="true"
          />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon
            size={iconSize}
            className={cn('flex-shrink-0', Icon.name === 'Loader2' && 'animate-spin')}
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
