
import React, { createContext, useContext, useState } from 'react';
import { View, Text } from 'react-native';
import { Radio, type RadioProps } from './radio';
import { cn } from '@giulio-leone/lib-design-system';

interface RadioGroupContextValue {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

export interface RadioGroupProps {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    label?: string;
    helperText?: string;
    error?: string;
    orientation?: 'vertical' | 'horizontal';
    className?: string;
    children: React.ReactNode;
}

export function RadioGroup({
  value: controlledValue,
    defaultValue,
    onChange,
    disabled = false,
    label,
    helperText,
    error,
    orientation = 'vertical',
    className,
    children,
}: RadioGroupProps) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleChange = (newValue: string) => {
        if (controlledValue === undefined) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
    };

    return (
        <View className={className}>
            {label && (
                <Text className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {label}
                </Text>
            )}
            <RadioGroupContext.Provider value={{ value, onChange: handleChange, disabled }}>
                <View
                    className={cn(
                        orientation === 'vertical' ? 'flex-col space-y-3' : 'flex-row flex-wrap gap-4'
                    )}
                >
                    {children}
                </View>
            </RadioGroupContext.Provider>
            {helperText && !error && (
                <Text className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{helperText}</Text>
            )}
            {error && <Text className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</Text>}
        </View>
    );
}

export interface RadioGroupOptionProps extends Omit<RadioProps, 'checked' | 'onChange'> {
    value: string;
}

export function RadioGroupOption({ value, ...props }: RadioGroupOptionProps) {
    const context = useContext(RadioGroupContext);

    if (!context) {
        throw new Error('RadioGroupOption must be used within RadioGroup');
    }

    const { value: groupValue, onChange, disabled: groupDisabled } = context;
    const checked = value === groupValue;

    return (
        <Radio
            checked={checked}
            onChange={() => onChange?.(value)}
            disabled={groupDisabled || props.disabled}
            {...props}
        />
    );
}
