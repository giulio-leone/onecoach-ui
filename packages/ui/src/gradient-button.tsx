/**
 * GradientButton Component - Web
 *
 * Web version using CSS gradients instead of expo-linear-gradient
 */

'use client';

import React from 'react';
import { cn } from '@onecoach/lib-design-system';
import { Loader2 } from 'lucide-react';

export interface GradientButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label?: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  // Support onPress for compatibility with React Native API
  onPress?: () => void;
}

export function GradientButton({
  label,
  loading,
  variant = 'primary',
  className,
  textClassName,
  icon,
  disabled,
  children,
  onClick,
  onPress,
  ...props
}: GradientButtonProps) {
  const isDisabled = disabled || loading;

  // Support both onClick (web) and onPress (for compatibility)
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (onClick) {
      onClick(e);
    } else if (onPress) {
      onPress();
    }
  };

  // Gradient colors based on variant - Updated for Premium Dark (Violet/Fuchsia)
  const gradientColors =
    variant === 'primary'
      ? 'from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500' // Violet to Indigo
      : 'from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500'; // Fuchsia to Pink

  const disabledGradient = 'from-zinc-400 to-zinc-500 dark:from-zinc-700 dark:to-zinc-800';

  const gradientClass = isDisabled ? disabledGradient : gradientColors;

  // Extract padding from className if provided, otherwise use defaults
  const hasPadding =
    className?.includes('px-') || className?.includes('py-') || className?.includes('p-');
  const defaultPadding = hasPadding ? '' : 'px-4 py-2';

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        'relative overflow-hidden rounded-lg shadow-md',
        // Shadow color matches primary/secondary
        variant === 'primary' ? 'shadow-violet-500/20' : 'shadow-fuchsia-500/20',
        'flex flex-row items-center justify-center gap-2',
        'transition-all duration-200',
        'hover:shadow-lg',
        variant === 'primary' ? 'hover:shadow-violet-500/30' : 'hover:shadow-fuchsia-500/30',
        'active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-md',
        'min-h-[2.75rem] text-sm font-semibold',
        defaultPadding,
        `bg-gradient-to-br ${gradientClass}`,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-white" />
      ) : children ? (
        children
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {label && (
            <span
              className={cn(
                'text-center whitespace-nowrap text-white',
                loading && 'opacity-80',
                textClassName
              )}
            >
              {label}
            </span>
          )}
        </>
      )}
    </button>
  );
}
