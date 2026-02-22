
import { View, Switch as RNSwitch, Text, type SwitchProps as RNSwitchProps } from 'react-native';
import { cn } from '@giulio-leone/lib-design-system';

export interface SwitchProps extends RNSwitchProps {
    label?: string;
    helperText?: string;
    error?: string;
    containerClassName?: string;
    labelPosition?: 'left' | 'right';
}

export function Switch({
    label,
    helperText,
    error,
    containerClassName,
    labelPosition = 'right',
    style,
    value,
    onValueChange,
    disabled,
    ...props
}: SwitchProps) {
    const switchElement = (
        <RNSwitch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: '#767577', true: '#10b981' }} // emerald-500
            thumbColor={value ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            style={style}
            {...props}
        />
    );

    const labelElement = (label || helperText) && (
        <View className="flex-1">
            {label && (
                <Text
                    className={cn(
                        'text-base font-medium',
                        disabled ? 'text-neutral-400 dark:text-neutral-600' : 'text-neutral-900 dark:text-neutral-100'
                    )}
                >
                    {label}
                </Text>
            )}
            {helperText && !error && (
                <Text className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{helperText}</Text>
            )}
            {error && <Text className="mt-0.5 text-xs text-red-500 dark:text-red-400">{error}</Text>}
        </View>
    );

    return (
        <View className={cn('flex-row items-center gap-3', containerClassName)}>
            {labelPosition === 'left' && labelElement}
            {switchElement}
            {labelPosition === 'right' && labelElement}
        </View>
    );
}
