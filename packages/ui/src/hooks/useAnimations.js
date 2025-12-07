'use client';
import { useEffect } from 'react';
import { withTiming, withSpring, withDelay, useSharedValue, useAnimatedStyle, } from 'react-native-reanimated';
/**
 * Fade in animation hook
 * @param config Animation configuration
 * @returns Animated style for opacity
 */
export function useFadeIn(config = {}) {
    const { duration = 300, delay = 0 } = config;
    const opacity = useSharedValue(0);
    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration }));
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));
    return { animatedStyle, opacity };
}
/**
 * Slide in animation hook
 * @param direction Direction of slide ('left' | 'right' | 'up' | 'down')
 * @param config Animation configuration
 * @returns Animated style for transform
 */
export function useSlideIn(direction = 'left', config = {}) {
    const { duration = 300, delay = 0 } = config;
    const translateX = useSharedValue(direction === 'left' ? -50 : direction === 'right' ? 50 : 0);
    const translateY = useSharedValue(direction === 'up' ? -50 : direction === 'down' ? 50 : 0);
    const opacity = useSharedValue(0);
    useEffect(() => {
        translateX.value = withDelay(delay, withTiming(0, { duration }));
        translateY.value = withDelay(delay, withTiming(0, { duration }));
        opacity.value = withDelay(delay, withTiming(1, { duration }));
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
        opacity: opacity.value,
    }));
    return { animatedStyle, translateX, translateY, opacity };
}
/**
 * Scale in animation hook with spring physics
 * @param config Animation configuration
 * @returns Animated style for scale transform
 */
export function useScaleIn(config = {}) {
    const { delay = 0, damping = 15, stiffness = 150 } = config;
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    useEffect(() => {
        scale.value = withDelay(delay, withSpring(1, { damping, stiffness }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));
    return { animatedStyle, scale, opacity };
}
/**
 * Bounce animation hook for interactive elements
 * @returns Methods to trigger bounce animation
 */
export function useBounce() {
    const scale = useSharedValue(1);
    const bounce = () => {
        scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
        scale.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 400 }));
    };
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    return { animatedStyle, bounce };
}
/**
 * Progressive list item animation with stagger effect
 * @param index Item index in list
 * @param config Animation configuration
 * @returns Animated style for list items
 */
export function useStaggeredFadeIn(index, config = {}) {
    const { duration = 300, delay = 50 } = config;
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    useEffect(() => {
        const itemDelay = index * delay;
        opacity.value = withDelay(itemDelay, withTiming(1, { duration }));
        translateY.value = withDelay(itemDelay, withTiming(0, { duration }));
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));
    return { animatedStyle, opacity, translateY };
}
/**
 * Shimmer loading animation
 * @param duration Duration of one shimmer cycle
 * @returns Animated style for shimmer effect
 */
export function useShimmer(duration = 1500) {
    const translateX = useSharedValue(-1);
    useEffect(() => {
        translateX.value = withTiming(1, { duration }, (finished) => {
            if (finished) {
                translateX.value = -1;
                translateX.value = withTiming(1, { duration });
            }
        });
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));
    return { animatedStyle, translateX };
}
/**
 * Rotation animation hook
 * @param config Animation configuration
 * @returns Animated style for rotation
 */
export function useRotate(config = {}) {
    const { duration = 1000 } = config;
    const rotation = useSharedValue(0);
    const rotate = () => {
        rotation.value = withTiming(360, { duration }, (finished) => {
            if (finished) {
                rotation.value = 0;
            }
        });
    };
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));
    return { animatedStyle, rotate, rotation };
}
/**
 * Pulse animation for attention-grabbing elements
 * @param config Animation configuration
 * @returns Animated style for pulse effect
 */
export function usePulse(config = {}) {
    const { duration = 1000 } = config;
    const scale = useSharedValue(1);
    useEffect(() => {
        scale.value = withTiming(1.05, { duration: duration / 2 }, (finished) => {
            if (finished) {
                scale.value = withTiming(1, { duration: duration / 2 });
            }
        });
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    return { animatedStyle, scale };
}
