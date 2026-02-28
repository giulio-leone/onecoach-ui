'use client';

import React, { useId } from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Check } from 'lucide-react';

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  /**
   * Label for the checkbox
   */
  label?: React.ReactNode;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Error message
   */
  errorMessage?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Color variant
   */
  variant?: 'primary' | 'secondary' | 'success' | 'error';
}

const checkboxSizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const checkboxVariantStyles = {
  primary:
    'peer-checked:bg-primary-600 peer-checked:border-primary-600 dark:peer-checked:bg-primary-500',
  secondary:
    'peer-checked:bg-secondary-600 peer-checked:border-secondary-600 dark:peer-checked:bg-secondary-500',
  success: 'peer-checked:bg-green-600 peer-checked:border-green-600 dark:peer-checked:bg-green-500',
  error: 'peer-checked:bg-red-600 peer-checked:border-red-600 dark:peer-checked:bg-red-500',
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error = false,
      errorMessage,
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
    const showError = error && errorMessage;

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex h-5 items-center">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              'relative flex cursor-pointer items-center justify-center rounded border-2 transition-all duration-200',
              checkboxSizeStyles[size],
              disabled
                ? 'cursor-not-allowed border-neutral-300 bg-neutral-100 dark:border-white/[0.08] dark:bg-white/[0.04]'
                : 'border-neutral-300 bg-white hover:border-neutral-400 dark:border-white/[0.1] dark:bg-white/[0.04] dark:hover:border-white/[0.2]',
              !disabled && checkboxVariantStyles[variant],
              error && !disabled && 'border-red-600 dark:border-red-500',
              'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-[#09090b]'
            )}
          >
            <Check
              className={cn(
                'text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100',
                size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'
              )}
              strokeWidth={3}
            />
          </label>
        </div>
        {(label || helperText || showError) && (
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
            {helperText && !showError && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">{helperText}</p>
            )}
            {showError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
