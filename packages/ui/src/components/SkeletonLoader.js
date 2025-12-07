'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4, style, }) {
    const opacity = useRef(new Animated.Value(0.3)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0.3,
                duration: 800,
                useNativeDriver: true,
            }),
        ])).start();
    }, [opacity]);
    return (_jsx(Animated.View, { style: [
            {
                width,
                height,
                borderRadius,
                backgroundColor: '#E5E7EB',
                opacity,
            },
            style,
        ] }));
}
export function SkeletonCard() {
    return (_jsxs(View, { style: styles.card, children: [_jsx(SkeletonLoader, { width: "40%", height: 24, style: { marginBottom: 12 } }), _jsx(SkeletonLoader, { width: "100%", height: 16, style: { marginBottom: 8 } }), _jsx(SkeletonLoader, { width: "80%", height: 16, style: { marginBottom: 8 } }), _jsx(SkeletonLoader, { width: "60%", height: 16 })] }));
}
export function SkeletonList({ count = 3 }) {
    return (_jsx(View, { children: Array.from({ length: count }).map((_, index) => (_jsx(SkeletonCard, {}, index))) }));
}
export function SkeletonStats() {
    return (_jsx(View, { style: styles.statsContainer, children: [1, 2, 3, 4].map((i) => (_jsxs(View, { style: styles.statCard, children: [_jsx(SkeletonLoader, { width: 40, height: 40, borderRadius: 20, style: { marginBottom: 8 } }), _jsx(SkeletonLoader, { width: "60%", height: 24, style: { marginBottom: 4 } }), _jsx(SkeletonLoader, { width: "80%", height: 14 })] }, i))) }));
}
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
    },
});
