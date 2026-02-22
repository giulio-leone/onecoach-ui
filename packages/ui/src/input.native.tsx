
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import { cn } from '@giulio-leone/lib-design-system';

export interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    helperText?: string;
    containerClassName?: string;
    contentContainerClassName?: string;
    className?: string;
    fullWidth?: boolean; // Added for parity with Web, though RN is usually flex
}

export const Input = React.forwardRef<TextInput, InputProps>(
    ({
        label,
        error,
        helperText,
        icon,
        containerClassName,
        contentContainerClassName,
        className,
        fullWidth,
        ...props
    }, ref) => {
        return (
            <View className={cn('space-y-2', fullWidth && 'w-full', containerClassName)}>
                {label && (
                    <Text className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                        {label}
                    </Text>
                )}
                <View
                    className={cn(
                        'flex-row items-center rounded-2xl border bg-neutral-50 px-4 py-3 transition-colors dark:bg-neutral-800/50',
                        error
                            ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                            : 'border-neutral-200 focus:border-blue-500 dark:border-neutral-700 dark:focus:border-blue-400',
                        contentContainerClassName
                    )}
                >
                    {icon && <View className="mr-3 text-neutral-400">{icon}</View>}
                    <TextInput
                        ref={ref}
                        className={cn(
                            'flex-1 bg-transparent text-base font-medium text-neutral-900 placeholder:text-neutral-400 dark:text-white',
                            className
                        )}
                        placeholderTextColor="#9CA3AF"
                        {...props}
                    />
                </View>
                {error && <Text className="text-xs font-medium text-red-500 dark:text-red-400">{error}</Text>}
                {helperText && !error && (
                    <Text className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</Text>
                )}
            </View>
        );
    }
);

Input.displayName = 'Input';
