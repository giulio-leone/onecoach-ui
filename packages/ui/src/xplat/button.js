import { jsx as _jsx } from "react/jsx-runtime";
import { Platform, Pressable, Text, StyleSheet } from 'react-native';
import { Button } from '../button';
/**
 * XButton - cross-platform button.
 * Web delega al DS Button, native usa Pressable.
 */
export function XButton({ label, variant = 'primary', ...props }) {
    if (Platform.OS === 'web') {
        return (_jsx(Button, { variant: variant === 'ghost' ? 'ghost' : 'primary', ...props, children: label }));
    }
    return (_jsx(Pressable, { style: ({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed], ...props, children: _jsx(Text, { style: styles.text, children: label }) }));
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
