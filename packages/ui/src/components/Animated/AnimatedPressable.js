import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/**
 * Pressable with scale animation and haptic feedback
 * Provides visual and tactile feedback on press
 */
export function AnimatedPressableButton({ children, hapticFeedback = true, scaleValue = 0.95, onPressIn, onPressOut, onPress, style, ...props }) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    const handlePressIn = (event) => {
        // Reanimated shared values sono mutabili per animazioni; safe su UI thread
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(scaleValue, { damping: 15, stiffness: 400 });
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(event);
    };
    const handlePressOut = (event) => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        onPressOut?.(event);
    };
    const handlePress = (event) => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress?.(event);
    };
    return (_jsx(AnimatedPressable, { onPressIn: handlePressIn, onPressOut: handlePressOut, onPress: handlePress, style: [animatedStyle, style], ...props, children: children }));
}
