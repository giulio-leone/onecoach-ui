'use client';

import React, { useId } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

// ============================================================================
// SWITCH COMPONENT
// ============================================================================

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  /**
   * Label for the switch
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
  variant?: 'primary' | 'secondary' | 'success';
  /**
   * Label position
   */
  labelPosition?: 'left' | 'right';
  /**
   * Callback opzionale che restituisce direttamente il valore booleano
   */
  onCheckedChange?: (checked: boolean) => void;
}

const switchSizeStyles = {
  sm: {
    track: 'h-5 w-9',
    thumb: 'h-3.5 w-3.5',
    translate: 'peer-checked:translate-x-4',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-4 w-4',
    translate: 'peer-checked:translate-x-5',
  },
  lg: {
    track: 'h-7 w-14',
    thumb: 'h-5 w-5',
    translate: 'peer-checked:translate-x-7',
  },
};

const switchVariantStyles = {
  primary: 'peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500',
  secondary: 'peer-checked:bg-secondary-600 dark:peer-checked:bg-secondary-500',
  success: 'peer-checked:bg-green-600 dark:peer-checked:bg-green-500',
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      helperText,
      size = 'md',
      variant = 'primary',
      labelPosition = 'right',
      disabled = false,
      className,
      id: providedId,
      onCheckedChange,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    };

    const switchElement = (
      <div className="flex h-5 items-center">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={id}
          disabled={disabled}
          className="peer sr-only"
          onChange={handleChange}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'relative inline-block cursor-pointer rounded-full transition-colors duration-200',
            switchSizeStyles[size].track,
            disabled
              ? 'cursor-not-allowed bg-neutral-200 dark:bg-white/[0.08]'
              : 'bg-neutral-300 dark:bg-neutral-600',
            !disabled && switchVariantStyles[variant],
            'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-[#09090b]'
          )}
        >
          <span
            className={cn(
              'absolute top-1/2 left-0.5 -translate-y-1/2 rounded-full bg-white shadow-md transition-transform duration-200 dark:bg-zinc-950',
              switchSizeStyles[size].thumb,
              switchSizeStyles[size].translate
            )}
          />
        </label>
      </div>
    );

    const labelElement = (label || helperText) && (
      <div className="flex-1">
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
    );

    return (
      <div className={cn('flex items-start gap-3', className)}>
        {labelPosition === 'left' && labelElement}
        {switchElement}
        {labelPosition === 'right' && labelElement}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
