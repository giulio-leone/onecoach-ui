import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
/**
 * Pinch to zoom gesture handler
 * Supports pinch zoom and pan gestures
 */
export function PinchToZoom({ children, minScale = 1, maxScale = 4, style }) {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
        const newScale = savedScale.value * event.scale;
        scale.value = Math.min(Math.max(newScale, minScale), maxScale);
    })
        .onEnd(() => {
        savedScale.value = scale.value;
        // Reset if below min scale
        if (scale.value < minScale + 0.1) {
            scale.value = withSpring(minScale);
            savedScale.value = minScale;
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
        }
    });
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
        // Only allow pan if zoomed in
        if (scale.value > 1) {
            translateX.value = savedTranslateX.value + event.translationX;
            translateY.value = savedTranslateY.value + event.translationY;
        }
    })
        .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
    });
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
        if (scale.value > 1) {
            // Reset zoom
            scale.value = withSpring(1);
            savedScale.value = 1;
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
        }
        else {
            // Zoom in to 2x
            scale.value = withSpring(2);
            savedScale.value = 2;
        }
    });
    const composedGesture = Gesture.Simultaneous(doubleTapGesture, Gesture.Simultaneous(pinchGesture, panGesture));
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));
    return (_jsx(View, { style: [styles.container, style], children: _jsx(GestureDetector, { gesture: composedGesture, children: _jsx(Animated.View, { style: [styles.content, animatedStyle], children: children }) }) }));
}
const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    content: {
        flex: 1,
    },
});
