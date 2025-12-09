/**
 * Button Component - Web
 *
 * Mobile-first, touch-friendly button with design tokens
 * Minimum 44x44px hit area, WCAG AA compliant
 */

'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import {
  type ButtonVariant,
  type ButtonSize,
  type ButtonSharedProps,
  getIconSize,
} from './button.shared';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>, ButtonSharedProps {
  /** Icon can be a LucideIcon component OR a React element */
  icon?: LucideIcon | React.ReactElement;
  className?: string;
  children?: React.ReactNode;
  /** React Native/Tamagui-style onPress (translated to onClick on web) */
  onPress?: React.MouseEventHandler<HTMLButtonElement>;
}

// Re-export types for convenience
export type { ButtonVariant, ButtonSize } from './button.shared';

/**
 * Helper to check if icon is a LucideIcon (function) vs React element
 */
function isLucideIcon(icon: LucideIcon | React.ReactElement): icon is LucideIcon {
  return typeof icon === 'function';
}

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
      loading = false,
      fullWidth = false,
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const isIconButton = size === 'icon' || size === 'icon-sm' || iconOnly;
    const isDisabled = disabled || loading;
    
    // Translate onPress (React Native/Tamagui) to onClick (web)
    // onClick takes precedence if both are provided
    const handleClick = onClick ?? onPress;

    // Variant styles using design tokens - WCAG AA compliant
    const variantStyles: Record<ButtonVariant | 'gradient-primary' | 'gradient-secondary', string> = {
      primary:
        'relative overflow-hidden border border-white/20 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 backdrop-blur-sm',
      secondary:
        'relative overflow-hidden border border-neutral-200/80 bg-white/80 text-neutral-900 shadow-sm hover:bg-neutral-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10 backdrop-blur-md',
      danger:
        'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
      ghost:
        'bg-transparent text-neutral-600 hover:bg-neutral-100/50 hover:text-neutral-900 active:bg-neutral-200/50 transition-all duration-200 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white',
      default:
        'relative overflow-hidden border border-white/10 bg-neutral-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 dark:bg-white dark:text-neutral-900',
      outline:
        'border border-neutral-200 bg-transparent text-neutral-900 hover:bg-neutral-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-800',
      success:
        'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
      info:
        'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
      glass:
        'border border-white/10 bg-white/5 text-white shadow-lg backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
      'gradient-primary':
        'relative overflow-hidden shadow-md shadow-violet-500/20 bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200',
      'gradient-secondary':
        'relative overflow-hidden shadow-md shadow-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white hover:from-fuchsia-400 hover:to-pink-500 hover:shadow-lg hover:shadow-fuchsia-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200',
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

    // Render icon - handles both LucideIcon and React.ReactElement
    const renderIcon = (position: 'left' | 'right') => {
      if (loading || !Icon || iconPosition !== position) return null;

      // If Icon is a LucideIcon (function/component), render it with props
      if (isLucideIcon(Icon)) {
        return (
          <Icon
            size={iconSize}
            className={cn('flex-shrink-0', Icon.name === 'Loader2' && 'animate-spin')}
            aria-hidden="true"
          />
        );
      }

      // If Icon is already a React element (JSX), clone it with additional props
      if (React.isValidElement(Icon)) {
        return React.cloneElement(
          Icon as React.ReactElement<{ className?: string; 'aria-hidden'?: boolean }>,
          {
            className: cn('flex-shrink-0', (Icon.props as { className?: string })?.className),
            'aria-hidden': true,
          }
        );
      }

      return null;
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <span className="animate-spin mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-loader-2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </span>
        )}
        {renderIcon('left')}
        {children}
        {renderIcon('right')}
      </button>
    );
  }
);

Button.displayName = 'Button';

