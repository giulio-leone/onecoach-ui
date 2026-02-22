
import { View, Pressable, Text } from 'react-native';
import { cn } from '@giulio-leone/lib-design-system';

export interface RadioProps {
    label?: string;
    helperText?: string;
    checked?: boolean;
    disabled?: boolean;
    onChange?: () => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary';
    containerClassName?: string;
}

const radioSizeStyles = {
    sm: { outer: 'h-4 w-4', inner: 'h-2 w-2' },
    md: { outer: 'h-5 w-5', inner: 'h-2.5 w-2.5' },
    lg: { outer: 'h-6 w-6', inner: 'h-3 w-3' },
};

export function Radio({
    label,
    helperText,
    checked = false,
    disabled = false,
    onChange,
    size = 'md',
    variant = 'primary',
    containerClassName,
}: RadioProps) {
    const styles = radioSizeStyles[size] || radioSizeStyles.md;

    return (
        <View className={cn('flex-row items-start', containerClassName)}>
            <Pressable
                onPress={() => !disabled && onChange?.()}
                disabled={disabled}
                className={cn(
                    'items-center justify-center rounded-full border-2 transition-all',
                    styles.outer,
                    disabled
                        ? 'border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800'
                        : checked
                            ? variant === 'primary'
                                ? 'border-blue-600 dark:border-blue-500'
                                : 'border-pink-600 dark:border-pink-500'
                            : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800'
                )}
            >
                {checked && (
                    <View
                        className={cn(
                            'rounded-full',
                            styles.inner,
                            disabled
                                ? 'bg-neutral-400'
                                : variant === 'primary'
                                    ? 'bg-blue-600 dark:bg-blue-500'
                                    : 'bg-pink-600 dark:bg-pink-500'
                        )}
                    />
                )}
            </Pressable>

            {(label || helperText) && (
                <View className="ml-3 flex-1">
                    {label && (
                        <Pressable onPress={() => !disabled && onChange?.()} disabled={disabled}>
                            <Text
                                className={cn(
                                    'text-base font-medium',
                                    disabled
                                        ? 'text-neutral-400 dark:text-neutral-600'
                                        : 'text-neutral-900 dark:text-neutral-100'
                                )}
                            >
                                {label}
                            </Text>
                        </Pressable>
                    )}
                    {helperText && (
                        <Text className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            {helperText}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}
