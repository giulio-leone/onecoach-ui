/**
 * Button Component - React Native
 *
 * Cross-platform button component with design tokens
 * Mobile-optimized, accessible, touch-friendly
 */

import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import {
  type ButtonVariant,
  type ButtonSize,
  type ButtonSharedProps,
  getIconSize,
  getMinHeight,
} from './button.shared';

export interface ButtonProps extends ButtonSharedProps {
  icon?: LucideIcon;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
}

// Re-export types for convenience
export type { ButtonVariant, ButtonSize } from './button.shared';

export const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      iconOnly = false,
      children,
      disabled,
      fullWidth = false,
      onPress,
      onPressIn,
      onPressOut,
      loading = false,
      style,
      textStyle,
      testID,
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref
  ) => {
    const iconSize = getIconSize(size);
    const minHeight = getMinHeight(size);

    const variantStyles = getVariantStyles(variant);
    const sizeStyles = getSizeStyles(size);

    const isDisabled = disabled || loading;
    const isGradient = variant.startsWith('gradient-');

    const gradientColors = React.useMemo(() => {
      if (isDisabled) return ['#9CA3AF', '#6B7280'] as const;
      if (variant === 'gradient-primary') return ['#7c3aed', '#4f46e5'] as const;
      if (variant === 'gradient-secondary') return ['#8b5cf6', '#db2777'] as const;
      return undefined;
    }, [variant, isDisabled]);

    const renderContent = (textColor: string) => (
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon size={iconSize} color={textColor} style={styles.icon} />
            )}
            {children && (
              <Text
                style={
                  [
                    styles.text,
                    sizeStyles.text,
                    { color: textColor },
                    textStyle,
                  ] as StyleProp<TextStyle>
                }
              >
                {children}
              </Text>
            )}
            {Icon && iconPosition === 'right' && (
              <Icon size={iconSize} color={textColor} style={styles.icon} />
            )}
          </>
        )}
      </View>
    );

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          !isGradient && variantStyles.container, // Only apply container style if not gradient (gradient handles bg)
          // For gradient buttons, Apply shadow/radius to the pressable container, but BG is transparent?
          isGradient && {
            borderRadius: sizeStyles.container.borderRadius,
            backgroundColor: 'transparent',
            // Add shadow for gradient manually if needed or via style prop
            boxShadow:
              variant === 'gradient-primary'
                ? '0 4px 4.65px rgba(59, 130, 246, 0.3)'
                : '0 4px 4.65px rgba(217, 70, 239, 0.3)',
            elevation: 8,
          },
          !isGradient && sizeStyles.container, // Padding is handled inside for gradient? logic check below.
          {
            minHeight,
            opacity: isDisabled && !isGradient ? 0.5 : pressed ? 0.8 : 1, // Gradient handles opacity via colors or view?
            width: fullWidth ? '100%' : 'auto',
            aspectRatio: iconOnly ? 1 : undefined,
            overflow: 'hidden', // Ensure gradient clips
          },
          style,
        ]}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {isGradient && gradientColors ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={
              [
                sizeStyles.container, // Apply padding here for gradient
                { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
              ] as StyleProp<ViewStyle>
            }
          >
            {renderContent('#ffffff')}
          </LinearGradient>
        ) : (
          renderContent(variantStyles.textColor)
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

// Variant styles
function getVariantStyles(variant: ButtonVariant) {
  const styles: Record<
    ButtonVariant,
    { container: ViewStyle; text: TextStyle; textColor: string }
  > = {
    primary: {
      container: {
        backgroundColor: '#10b981',
        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
        elevation: 3,
      },
      text: { color: '#ffffff' },
      textColor: '#ffffff',
    },
    secondary: {
      container: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        elevation: 2,
      },
      text: { color: '#374151' },
      textColor: '#374151',
    },
    danger: {
      container: {
        backgroundColor: '#ef4444',
        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
        elevation: 3,
      },
      text: { color: '#ffffff' },
      textColor: '#ffffff',
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
      },
      text: { color: '#374151' },
      textColor: '#374151',
    },
    default: {
      container: {
        backgroundColor: '#6366f1',
        boxShadow: '0 2px 3px rgba(59, 130, 246, 0.15)',
        elevation: 2,
      },
      text: { color: '#ffffff' },
      textColor: '#ffffff',
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#d1d5db',
      },
      text: { color: '#374151' },
      textColor: '#374151',
    },
    success: {
      container: {
        backgroundColor: '#10b981',
        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
        elevation: 3,
      },
      text: { color: '#ffffff' },
      textColor: '#ffffff',
    },
    info: {
      container: {
        backgroundColor: '#6366f1',
        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
        elevation: 3,
      },
      text: { color: '#ffffff' },
      textColor: '#ffffff',
    },
    glass: {
      container: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      text: { color: '#ffffff' },
      textColor: '#ffffff',
    },
    'gradient-primary': { container: {}, text: {}, textColor: '#fff' }, // Handled specially
    'gradient-secondary': { container: {}, text: {}, textColor: '#fff' }, // Handled specially
  };

  return styles[variant] || styles.primary;
}

// Size styles
function getSizeStyles(size: ButtonSize) {
  const styles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
      },
      text: {
        fontSize: 14,
      },
    },
    md: {
      container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
      },
      text: {
        fontSize: 16,
      },
    },
    lg: {
      container: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
      },
      text: {
        fontSize: 18,
      },
    },
    icon: {
      container: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 9999,
      },
      text: {
        fontSize: 0,
      },
    },
    'icon-sm': {
      container: {
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderRadius: 9999,
      },
      text: {
        fontSize: 0,
      },
    },
  };

  return styles[size];
}

const styles = StyleSheet.create({
  base: {
    // Flex direction row is handled in ContentContainer for gradient, but we need it for Pressable layout
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Gap doesn't work well on old RN in Pressable if children are wrapped
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
  icon: {
    flexShrink: 0,
  },
});
