import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@onecoach/lib-design-system/dark-mode-classes';

export interface GradientButtonProps extends TouchableOpacityProps {
  label?: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function GradientButton({
  label,
  loading,
  variant = 'primary',
  className,
  textClassName,
  icon,
  disabled,
  children,
  ...props
}: GradientButtonProps) {
  const colors =
    variant === 'primary'
      ? (['#7c3aed', '#4f46e5'] as const) // Violet to Indigo
      : (['#d946ef', '#db2777'] as const); // Fuchsia to Pink

  const disabledColors = ['#9CA3AF', '#6B7280'] as const;

  // Extract padding from className if provided, otherwise use defaults
  const hasPadding =
    className?.includes('px-') || className?.includes('py-') || className?.includes('p-');
  const defaultPadding = hasPadding ? '' : 'px-4 py-2';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      className={cn(
        'overflow-hidden rounded-lg shadow-md shadow-blue-500/20',
        'min-h-[44px]',
        defaultPadding,
        className
      )}
      {...props}
    >
      <LinearGradient
        colors={disabled || loading ? disabledColors : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-row items-center justify-center gap-2"
        style={{ flex: 1 }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : children ? (
          children
        ) : (
          <>
            {icon && <View className="flex-shrink-0">{icon}</View>}
            {label && (
              <Text
                className={cn(
                  'text-center text-sm font-semibold text-white',
                  loading && 'opacity-80',
                  textClassName
                )}
              >
                {label}
              </Text>
            )}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
