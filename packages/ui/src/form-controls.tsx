/**
 * Form Control Components
 *
 * Advanced form controls following SOLID and DRY principles.
 * Mobile-first, accessible, and optimized for dark mode.
 * Provides: Checkbox, Radio, Switch, RadioGroup, CheckboxGroup
 */

'use client';

import React, { createContext, useContext, useId } from 'react';
import { cn } from '@onecoach/lib-design-system';
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
                ? 'cursor-not-allowed border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800'
                : 'border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-neutral-500',
              !disabled && checkboxVariantStyles[variant],
              error && !disabled && 'border-red-600 dark:border-red-500',
              'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-neutral-900'
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
              ? 'cursor-not-allowed bg-neutral-200 dark:bg-neutral-700'
              : 'bg-neutral-300 dark:bg-neutral-600',
            !disabled && switchVariantStyles[variant],
            'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-neutral-900'
          )}
        >
          <span
            className={cn(
              'absolute top-1/2 left-0.5 -translate-y-1/2 rounded-full bg-white shadow-md transition-transform duration-200 dark:bg-neutral-900',
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

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

export interface RadioGroupProps {
  /**
   * Group name
   */
  name?: string;
  /**
   * Selected value
   */
  value?: string;
  /**
   * Default value
   */
  defaultValue?: string;
  /**
   * Change handler
   */
  onChange?: (value: string) => void;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Label for the group
   */
  label?: string;
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Error message
   */
  errorMessage?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Orientation
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Spacing between items
   */
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const radioGroupSpacingStyles = {
  vertical: {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4',
  },
  horizontal: {
    sm: 'space-x-4',
    md: 'space-x-6',
    lg: 'space-x-8',
  },
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  label,
  error = false,
  errorMessage,
  helperText,
  orientation = 'vertical',
  spacing = 'md',
  className,
  children,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const showError = error && errorMessage;

  return (
    <div className={className}>
      {label && (
        <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <RadioGroupContext.Provider value={{ name, value, onChange: handleChange, disabled }}>
        <div
          className={cn(
            orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row flex-wrap',
            radioGroupSpacingStyles[orientation][spacing]
          )}
          role="radiogroup"
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
      {helperText && !showError && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">{helperText}</p>
      )}
      {showError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>}
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';

// Radio option for RadioGroup
export interface RadioGroupOptionProps extends Omit<RadioProps, 'name' | 'checked' | 'onChange'> {
  value: string;
}

export const RadioGroupOption: React.FC<RadioGroupOptionProps> = ({ value, ...props }) => {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error('RadioGroupOption must be used within RadioGroup');
  }

  const { name, value: groupValue, onChange, disabled: groupDisabled } = context;
  const checked = value === groupValue;

  return (
    <Radio
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange?.(value)}
      disabled={groupDisabled || props.disabled}
      {...props}
    />
  );
};

RadioGroupOption.displayName = 'RadioGroupOption';

// ============================================================================
// CHECKBOX GROUP COMPONENT
// ============================================================================

export interface CheckboxGroupProps {
  /**
   * Selected values
   */
  value?: string[];
  /**
   * Default values
   */
  defaultValue?: string[];
  /**
   * Change handler
   */
  onChange?: (values: string[]) => void;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Label for the group
   */
  label?: string;
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Error message
   */
  errorMessage?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Orientation
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Spacing between items
   */
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const checkboxGroupSpacingStyles = {
  vertical: {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4',
  },
  horizontal: {
    sm: 'space-x-4',
    md: 'space-x-6',
    lg: 'space-x-8',
  },
};

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value: controlledValue,
  defaultValue = [],
  onChange,
  disabled = false,
  label,
  error = false,
  errorMessage,
  helperText,
  orientation = 'vertical',
  spacing = 'md',
  className,
  children,
}) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleToggle = (itemValue: string, checked: boolean) => {
    const newValue = checked
      ? [...value, itemValue]
      : value.filter((v: unknown) => v !== itemValue);

    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const showError = error && errorMessage;

  return (
    <div className={className}>
      {label && (
        <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <div
        className={cn(
          orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row flex-wrap',
          checkboxGroupSpacingStyles[orientation][spacing]
        )}
        role="group"
      >
        {React.Children.map(children, (child) => {
          if (
            React.isValidElement<CheckboxGroupOptionProps>(child) &&
            child.type === CheckboxGroupOption
          ) {
            const { value: itemValue, disabled: childDisabled } = child.props;
            return React.cloneElement(child, {
              checked: value.includes(itemValue),
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                handleToggle(itemValue, e.target.checked),
              disabled: disabled || childDisabled,
            });
          }
          return child;
        })}
      </div>
      {helperText && !showError && (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">{helperText}</p>
      )}
      {showError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>}
    </div>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';

// Checkbox option for CheckboxGroup
export interface CheckboxGroupOptionProps extends Omit<CheckboxProps, 'checked' | 'onChange'> {
  value: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const CheckboxGroupOption: React.FC<CheckboxGroupOptionProps> = (props) => {
  return <Checkbox {...props} />;
};

CheckboxGroupOption.displayName = 'CheckboxGroupOption';
