/**
 * ActionButton Component
 *
 * Standardized action button for visual builders
 * Supports multiple variants and sizes
 * Fully optimized for dark mode
 */

import React from 'react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';

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

const variantClasses = {
  primary:
    'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 text-white',
  secondary: cn(
    'border',
    darkModeClasses.border.base,
    darkModeClasses.bg.base,
    darkModeClasses.text.secondary,
    darkModeClasses.interactive.hover
  ),
  danger:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700 text-white',
  success:
    'bg-green-600 hover:bg-green-700 active:bg-green-800 dark:bg-green-500 dark:hover:bg-green-600 dark:active:bg-green-700 text-white',
  info: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 dark:bg-purple-500 dark:hover:bg-purple-600 dark:active:bg-purple-700 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function ActionButton({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  className = '',
  fullWidth = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50',
        darkModeClasses.interactive.button,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
