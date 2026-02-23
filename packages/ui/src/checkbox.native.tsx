import { Pressable, View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { cn } from '@giulio-leone/lib-design-system';

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  containerClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: { box: 'h-4 w-4', icon: 10 },
  md: { box: 'h-5 w-5', icon: 14 },
  lg: { box: 'h-6 w-6', icon: 18 },
};

export function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  helperText,
  error,
  disabled = false,
  containerClassName,
  size = 'md',
}: CheckboxProps) {
  const styles = sizeStyles[size] || sizeStyles.md;

  return (
    <View className={cn('flex-row items-start gap-3', containerClassName)}>
      <Pressable
        onPress={() => !disabled && onCheckedChange?.(!checked)}
        disabled={disabled}
        className={cn(
          'items-center justify-center rounded border transition-colors',
          styles.box,
          disabled
            ? 'border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800'
            : checked
              ? 'border-emerald-500 bg-emerald-500' // primary/success color
              : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800',
          error && 'border-red-500 dark:border-red-400'
        )}
      >
        {checked && <Check size={styles.icon} color="#ffffff" strokeWidth={3} />}
      </Pressable>

      {(label || helperText || error) && (
        <View className="flex-1">
          {label && (
            <Pressable onPress={() => !disabled && onCheckedChange?.(!checked)} disabled={disabled}>
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
          {helperText && !error && (
            <Text className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {helperText}
            </Text>
          )}
          {error && <Text className="mt-0.5 text-xs text-red-500 dark:text-red-400">{error}</Text>}
        </View>
      )}
    </View>
  );
}
