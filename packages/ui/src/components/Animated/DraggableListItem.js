import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS, } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
/**
 * Draggable list item for reordering
 * Long press to start dragging, then move vertically to reorder
 */
export function DraggableListItem({ children, onDragStart, onDragEnd, style, }) {
    const translateY = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const scale = useSharedValue(1);
    const elevation = useSharedValue(2);
    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };
    const handleDragStart = () => {
        if (onDragStart) {
            onDragStart();
        }
    };
    const handleDragEnd = (finalY) => {
        if (onDragEnd) {
            onDragEnd(finalY);
        }
    };
    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
        isDragging.value = true;
        scale.value = withSpring(1.05, { damping: 15, stiffness: 200 });
        elevation.value = withTiming(8);
        runOnJS(triggerHaptic)();
        runOnJS(handleDragStart)();
    });
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
        if (isDragging.value) {
            translateY.value = offsetY.value + event.translationY;
        }
    })
        .onEnd((event) => {
        if (isDragging.value) {
            const finalY = offsetY.value + event.translationY;
            runOnJS(handleDragEnd)(finalY);
            // Reset
            isDragging.value = false;
            offsetY.value = 0;
            translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
            scale.value = withSpring(1, { damping: 15, stiffness: 150 });
            elevation.value = withTiming(2);
        }
    });
    const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
        elevation: elevation.value,
        shadowOpacity: isDragging.value ? 0.3 : 0.1,
        zIndex: isDragging.value ? 999 : 1,
    }));
    const combinedStyle = [styles.container, animatedStyle, style].filter(Boolean);
    return (_jsx(GestureDetector, { gesture: composedGesture, children: _jsx(Animated.View, { style: combinedStyle, children: children }) }));
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
});
