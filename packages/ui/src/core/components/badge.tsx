/**
 * Badge Component
 *
 * Mobile-first, touch-friendly badge with design tokens
 * Componente per etichette e tag
 */

import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: BadgeProps) => {
  const variantStyles = {
    default: cn(
      'bg-secondary-100 dark:bg-secondary-500/15',
      'text-secondary-700 dark:text-secondary-300',
      'border border-secondary-200/60 dark:border-secondary-500/20'
    ),
    success: cn(
      'bg-emerald-100 dark:bg-emerald-500/15',
      'text-emerald-700 dark:text-emerald-300',
      'border border-emerald-200/60 dark:border-emerald-500/20'
    ),
    warning: cn(
      'bg-amber-100 dark:bg-amber-500/15',
      'text-amber-700 dark:text-amber-300',
      'border border-amber-200/60 dark:border-amber-500/20'
    ),
    error: cn(
      'bg-red-100 dark:bg-red-500/15',
      'text-red-700 dark:text-red-300',
      'border border-red-200/60 dark:border-red-500/20'
    ),
    info: cn(
      'bg-primary-100 dark:bg-primary-500/15',
      'text-primary-700 dark:text-primary-300',
      'border border-primary-200/60 dark:border-primary-500/20'
    ),
    neutral: cn(
      'bg-neutral-100 dark:bg-white/[0.04]',
      'text-neutral-700 dark:text-neutral-300',
      'border border-neutral-200/60 dark:border-neutral-500/20'
    ),
    outline: cn(
      'bg-transparent',
      'text-neutral-700 dark:text-neutral-300',
      'border border-neutral-200/60 dark:border-white/[0.1]'
    ),
    glass: cn(
      'bg-white/60 dark:bg-white/[0.06]',
      'text-neutral-800 dark:text-neutral-200',
      'border border-white/40 dark:border-white/[0.1]',
      'backdrop-blur-md'
    ),
    gradient: cn(
      'bg-gradient-to-r from-primary-500 to-secondary-500',
      'text-white',
      'border-0',
      'shadow-sm shadow-primary-500/20'
    ),
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        'transition-colors duration-200',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
