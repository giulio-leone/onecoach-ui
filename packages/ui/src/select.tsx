/**
 * Select Component
 *
 * Mobile-first, touch-friendly select with design tokens
 * Minimum 44px height, WCAG AA compliant
 */

import React from 'react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  placeholder?: string;
  /**
   * Callback semplificata che restituisce solo il valore selezionato
   */
  onValueChange?: (value: string) => void;
  /**
   * Opzioni dichiarative; se valorizzate sostituiscono i children
   */
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      fullWidth = true,
      children,
      onValueChange,
      options,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    const hasOptions = Array.isArray(options) && options.length > 0;

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
        <select
          ref={ref}
          onChange={handleChange}
          className={cn(
            // Base styles - Touch-friendly (min 44px height)
            'min-h-[2.75rem] w-full rounded-lg border px-4 py-3',
            'text-base font-medium', // Prevent zoom on iOS, better readability
            'transition-all duration-300 ease-out',
            'focus:outline-none',
            'appearance-none', // Remove default arrow
            // Arrow icon with high contrast for both modes
            // Light mode: darker gray for better visibility
            "bg-[url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23404040' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")]",
            // Dark mode: lighter gray for high contrast
            "dark:bg-[url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4d4d4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")]",
            'bg-[length:1.25em_1.25em] bg-[right_0.75rem_center] bg-no-repeat',
            'pr-10', // Space for custom arrow
            'disabled:cursor-not-allowed',
            'touch-manipulation', // Optimize for touch

            // Background and text with improved dark mode contrast
            'bg-white dark:bg-white/[0.04]',
            'text-neutral-900 dark:text-neutral-100',
            'border-neutral-300 dark:border-white/[0.1]',

            // Hover states for better interactivity
            'hover:border-neutral-400 dark:hover:border-neutral-500',
            'hover:bg-neutral-50 dark:hover:bg-white/[0.08]/30',

            // Focus states with high contrast
            error
              ? darkModeClasses.input.error
              : cn(
                  'focus:border-primary-500 dark:focus:border-primary-400',
                  'focus:ring-primary-500/20 dark:focus:ring-primary-400/30 focus:ring-2',
                  'focus:bg-white dark:focus:bg-neutral-800'
                ),

            // Disabled state
            props.disabled && darkModeClasses.input.disabled,

            className
          )}
          {...props}
        >
          {props.placeholder ? (
            <option value="" disabled={props.required} hidden={props.required}>
              {props.placeholder}
            </option>
          ) : null}
          {hasOptions
            ? options!.map(({ label: optionLabel, value, disabled }) => (
                <option key={value} value={value} disabled={disabled}>
                  {optionLabel}
                </option>
              ))
            : children}
        </select>
        {error && <p className={cn('text-sm', darkModeClasses.semantic.error.text)}>{error}</p>}
        {helperText && !error && (
          <p className={cn('text-sm', darkModeClasses.text.tertiary)}>{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
