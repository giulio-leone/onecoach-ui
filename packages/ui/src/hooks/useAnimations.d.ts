export interface AnimationConfig {
    duration?: number;
    delay?: number;
    damping?: number;
    stiffness?: number;
}
/**
 * Fade in animation hook
 * @param config Animation configuration
 * @returns Animated style for opacity
 */
export declare function useFadeIn(config?: AnimationConfig): {
    animatedStyle: {
        opacity: number;
    };
    opacity: import("react-native-reanimated").SharedValue<number>;
};
/**
 * Slide in animation hook
 * @param direction Direction of slide ('left' | 'right' | 'up' | 'down')
 * @param config Animation configuration
 * @returns Animated style for transform
 */
export declare function useSlideIn(direction?: 'left' | 'right' | 'up' | 'down', config?: AnimationConfig): {
    animatedStyle: {
        transform: ({
            translateX: number;
            translateY?: undefined;
        } | {
            translateY: number;
            translateX?: undefined;
        })[];
        opacity: number;
    };
    translateX: import("react-native-reanimated").SharedValue<number>;
    translateY: import("react-native-reanimated").SharedValue<number>;
    opacity: import("react-native-reanimated").SharedValue<number>;
};
/**
 * Scale in animation hook with spring physics
 * @param config Animation configuration
 * @returns Animated style for scale transform
 */
export declare function useScaleIn(config?: AnimationConfig): {
    animatedStyle: {
        transform: {
            scale: number;
        }[];
        opacity: number;
    };
    scale: import("react-native-reanimated").SharedValue<number>;
    opacity: import("react-native-reanimated").SharedValue<number>;
};
/**
 * Bounce animation hook for interactive elements
 * @returns Methods to trigger bounce animation
 */
export declare function useBounce(): {
    animatedStyle: {
        transform: {
            scale: number;
        }[];
    };
    bounce: () => void;
};
/**
 * Progressive list item animation with stagger effect
 * @param index Item index in list
 * @param config Animation configuration
 * @returns Animated style for list items
 */
export declare function useStaggeredFadeIn(index: number, config?: AnimationConfig): {
    animatedStyle: {
        opacity: number;
        transform: {
            translateY: number;
        }[];
    };
    opacity: import("react-native-reanimated").SharedValue<number>;
    translateY: import("react-native-reanimated").SharedValue<number>;
};
/**
 * Shimmer loading animation
 * @param duration Duration of one shimmer cycle
 * @returns Animated style for shimmer effect
 */
export declare function useShimmer(duration?: number): {
    animatedStyle: {
        transform: {
            translateX: number;
        }[];
    };
    translateX: import("react-native-reanimated").SharedValue<number>;
};
/**
 * Rotation animation hook
 * @param config Animation configuration
 * @returns Animated style for rotation
 */
export declare function useRotate(config?: AnimationConfig): {
    animatedStyle: {
        transform: {
            rotate: string;
        }[];
    };
    rotate: () => void;
    rotation: import("react-native-reanimated").SharedValue<number>;
};
/**
 * Pulse animation for attention-grabbing elements
 * @param config Animation configuration
 * @returns Animated style for pulse effect
 */
export declare function usePulse(config?: AnimationConfig): {
    animatedStyle: {
        transform: {
            scale: number;
        }[];
    };
    scale: import("react-native-reanimated").SharedValue<number>;
};
