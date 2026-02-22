'use client';

import React, { createContext, useContext } from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Radio, type RadioProps } from './radio';

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
