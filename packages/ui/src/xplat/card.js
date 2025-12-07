import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Platform, Pressable, View, Text, StyleSheet, } from 'react-native';
import { Card } from '../card';
const resolveChildren = (value) => {
    if (typeof value === 'function') {
        return value({ pressed: false, hovered: false, focused: false });
    }
    return value ?? null;
};
/**
 * XCard - cross-platform card. Web usa Card DS, native usa View/Pressable.
 */
export function XCard({ heading, description, ...props }) {
    if (Platform.OS === 'web') {
        const { onPress, ...rest } = props;
        const renderedChildren = 'children' in rest ? resolveChildren(rest.children) : null;
        const content = (_jsxs("div", { className: "space-y-2", children: [heading && _jsx("h3", { className: "text-lg font-semibold", children: heading }), description && _jsx("p", { className: "text-sm text-neutral-600", children: description }), renderedChildren ?? null] }));
        if (onPress) {
            return (_jsx(Card, { className: "cursor-pointer", onClick: onPress, children: content }));
        }
        return _jsx(Card, { ...rest, children: content });
    }
    const { onPress, children, ...rest } = props;
    const renderedChildren = resolveChildren(children);
    const content = (_jsxs(View, { style: styles.inner, children: [heading ? _jsx(Text, { style: styles.heading, children: heading }) : null, description ? _jsx(Text, { style: styles.description, children: description }) : null, renderedChildren] }));
    if (onPress) {
        return (_jsx(Pressable, { style: ({ pressed }) => [styles.base, pressed && styles.pressed], onPress: onPress, ...rest, children: content }));
    }
    return (_jsx(View, { style: styles.base, ...rest, children: content }));
}
const styles = StyleSheet.create({
    base: {
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    pressed: {
        opacity: 0.95,
    },
    inner: {
        gap: 8,
    },
    heading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
    },
});
