/**
 * Badge Component
 *
 * Mobile-first, touch-friendly badge with design tokens
 * Componente per etichette e tag
 */

import React from 'react';
import { cn } from '@onecoach/lib-design-system';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline';
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
      'bg-violet-100 dark:bg-violet-900/30',
      'text-violet-700 dark:text-violet-300',
      'border border-violet-200 dark:border-violet-800'
    ),
    success: cn(
      'bg-emerald-100 dark:bg-emerald-900/30',
      'text-emerald-700 dark:text-emerald-300',
      'border border-emerald-200 dark:border-emerald-800'
    ),
    warning: cn(
      'bg-amber-100 dark:bg-amber-900/30',
      'text-amber-700 dark:text-amber-300',
      'border border-amber-200 dark:border-amber-800'
    ),
    error: cn(
      'bg-red-100 dark:bg-red-900/30',
      'text-red-700 dark:text-red-300',
      'border border-red-200 dark:border-red-800'
    ),
    info: cn(
      'bg-blue-100 dark:bg-blue-900/30',
      'text-blue-700 dark:text-blue-300',
      'border border-blue-200 dark:border-blue-800'
    ),
    neutral: cn(
      'bg-zinc-100 dark:bg-zinc-800',
      'text-zinc-700 dark:text-zinc-300',
      'border border-zinc-200 dark:border-zinc-700'
    ),
    outline: cn(
      'bg-transparent',
      'text-zinc-700 dark:text-zinc-300',
      'border border-zinc-200 dark:border-zinc-700'
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
