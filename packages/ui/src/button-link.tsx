/**
 * ButtonLink Component
 *
 * Cross-platform link component styled as a button
 * Supports dark mode and color variants
 * Follows SRP and DRY principles
 */

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { getIconSize } from './button.shared';

export interface ButtonLinkProps {
  href: string;
  children?: React.ReactNode;
  icon?: LucideIcon;
  variant?:
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
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  className?: string;
  fullWidth?: boolean;
  iconOnly?: boolean;
  iconPosition?: 'left' | 'right';
  target?: string;
}

// Styles duplicated from button.tsx to ensure consistency
// Ideally this would be shared, but extracting it might break existing button.tsx imports/exports structure unnecessarily for now.
const variantStyles = {
  primary:
    'relative overflow-hidden border border-white/20 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 backdrop-blur-sm',
  secondary:
    'relative overflow-hidden border border-neutral-200/80 bg-white/80 text-neutral-900 shadow-sm hover:bg-neutral-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10 backdrop-blur-md',
  danger:
    'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-100/50 hover:text-neutral-900 active:bg-neutral-200/50 transition-all duration-200 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white',
  default:
    'relative overflow-hidden border border-white/10 bg-neutral-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 dark:bg-white dark:text-neutral-900',
  outline:
    'border border-neutral-200 bg-transparent text-neutral-900 hover:bg-neutral-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 dark:border-white/[0.08] dark:text-neutral-100 dark:hover:bg-neutral-800',
  success:
    'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
  info: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
  glass:
    'border border-white/10 bg-white/5 text-white shadow-lg backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
  'gradient-primary':
    'relative overflow-hidden shadow-md shadow-violet-500/20 bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200',
  'gradient-secondary':
    'relative overflow-hidden shadow-md shadow-secondary-500/20 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover:from-secondary-400 hover:to-secondary-500 hover:shadow-lg hover:shadow-secondary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200',
};

const sizeStyles = {
  sm: 'min-h-[2.75rem] min-w-[2.75rem] px-3 py-2 text-sm rounded-full',
  md: 'min-h-[3rem] min-w-[3rem] px-5 py-2.5 text-base rounded-full',
  lg: 'min-h-[3.5rem] min-w-[3.5rem] px-8 py-3.5 text-lg rounded-full',
  icon: 'min-h-[2.5rem] min-w-[2.5rem] px-0 rounded-full',
  'icon-sm': 'min-h-[2.25rem] min-w-[2.25rem] px-0 text-sm rounded-full',
};

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      href,
      children,
      icon: Icon,
      variant = 'primary',
      size = 'md',
      className = '',
      fullWidth = false,
      iconOnly = false,
      iconPosition = 'left',
      target,
      ...props
    },
    ref
  ) => {
    const isIconButton = size === 'icon' || size === 'icon-sm' || iconOnly;
    const iconSize = getIconSize(size);

    const classes = cn(
      'font-semibold tracking-wide transition-all duration-300',
      'inline-flex items-center justify-center gap-2.5',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
      'focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900',
      'touch-manipulation',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      isIconButton && 'aspect-square p-0',
      className
    );

    return (
      <Link
        ref={ref}
        href={href}
        className={classes}
        title={isIconButton ? (typeof children === 'string' ? children : undefined) : undefined}
        target={target}
        {...props}
      >
        {Icon && iconPosition === 'left' && (
          <Icon size={iconSize} className="flex-shrink-0" aria-hidden="true" />
        )}
        {!isIconButton && children}
        {Icon && iconPosition === 'right' && (
          <Icon size={iconSize} className="flex-shrink-0" aria-hidden="true" />
        )}
        {isIconButton && <span className="sr-only">{children}</span>}
      </Link>
    );
  }
);

ButtonLink.displayName = 'ButtonLink';
