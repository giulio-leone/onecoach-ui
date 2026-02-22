'use client';

import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Checkbox, type CheckboxProps } from './checkbox';

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
