import { Platform, Pressable, Text, type PressableProps, StyleSheet } from 'react-native';
import { Button } from '../button';

type Variant = 'primary' | 'secondary' | 'ghost';

export type XButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
};

/**
 * XButton - cross-platform button.
 * Web delega al DS Button, native usa Pressable.
 */
export function XButton({ label, variant = 'primary', ...props }: XButtonProps) {
  if (Platform.OS === 'web') {
    return (
      <Button
        variant={variant === 'ghost' ? 'ghost' : 'primary'}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {label}
      </Button>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed]}
      {...props}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#2563EB',
  },
  secondary: {
    backgroundColor: '#E5E7EB',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.9,
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
