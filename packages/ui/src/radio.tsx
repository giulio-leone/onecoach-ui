'use client';

import React, { useId } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

// ============================================================================
// RADIO COMPONENT
// ============================================================================

export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  /**
   * Label for the radio
   */
  label?: React.ReactNode;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Color variant
   */
  variant?: 'primary' | 'secondary';
}

const radioSizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const radioInnerSizeStyles = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
};

const radioVariantStyles = {
  primary: 'peer-checked:border-primary-600 dark:peer-checked:border-primary-500',
  secondary: 'peer-checked:border-secondary-600 dark:peer-checked:border-secondary-500',
};

const radioInnerVariantStyles = {
  primary: 'bg-primary-600 dark:bg-primary-500',
  secondary: 'bg-secondary-600 dark:bg-secondary-500',
};

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      helperText,
      size = 'md',
      variant = 'primary',
      disabled = false,
      className,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex h-5 items-center">
          <input
            ref={ref}
            type="radio"
            id={id}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              'relative flex cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200',
              radioSizeStyles[size],
              disabled
                ? 'cursor-not-allowed border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800'
                : 'border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-neutral-500',
              !disabled && radioVariantStyles[variant],
              'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-neutral-900'
            )}
          >
            <span
              className={cn(
                'rounded-full opacity-0 transition-opacity duration-200 peer-checked:opacity-100',
                radioInnerSizeStyles[size],
                !disabled && radioInnerVariantStyles[variant]
              )}
            />
          </label>
        </div>
        {(label || helperText) && (
          <div className="ml-3 flex-1">
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  'block cursor-pointer text-sm font-medium',
                  disabled
                    ? 'text-neutral-400 dark:text-neutral-600'
                    : 'text-neutral-700 dark:text-neutral-300'
                )}
              >
                {label}
              </label>
            )}
            {helperText && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
