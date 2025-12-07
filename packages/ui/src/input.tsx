/**
 * Input Component
 *
 * Mobile-first, touch-friendly input with design tokens
 * Minimum 44px height, WCAG AA compliant
 */

import React from 'react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', fullWidth = true, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={props.id}
            className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            // Base styles - Touch-friendly (min 44px height)
            'min-h-[2.75rem] w-full rounded-lg border px-4 py-3',
            'text-base', // Prevent zoom on iOS
            'transition-all duration-300 ease-out',
            'focus:outline-none',
            'disabled:cursor-not-allowed',
            'touch-manipulation', // Optimize for touch

            // Background and text with improved dark mode
            darkModeClasses.input.base,

            // Border and focus states with elegant glow effects
            error
              ? darkModeClasses.input.error
              : cn(darkModeClasses.input.focus, 'border-neutral-200 dark:border-neutral-700/80'),

            // Placeholder with improved contrast
            darkModeClasses.input.placeholder,

            // Disabled state
            props.disabled && darkModeClasses.input.disabled,

            className
          )}
          data-lpignore="true"
          data-form-type="other"
          {...props}
        />
        {error && <p className={cn('text-sm', darkModeClasses.semantic.error.text)}>{error}</p>}
        {helperText && !error && (
          <p className={cn('text-sm', darkModeClasses.text.tertiary)}>{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
