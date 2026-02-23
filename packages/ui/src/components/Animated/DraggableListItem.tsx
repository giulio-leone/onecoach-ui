import React from 'react';
import { StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface DraggableListItemProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: (newY: number) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Draggable list item for reordering
 * Long press to start dragging, then move vertically to reorder
 */
export function DraggableListItem({
  children,
  onDragStart,
  onDragEnd,
  style,
}: DraggableListItemProps) {
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

  const handleDragEnd = (finalY: number) => {
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

  const combinedStyle = [styles.container, animatedStyle, style].filter(
    Boolean
  ) as unknown as StyleProp<ViewStyle>;

  return (
    <GestureDetector gesture={composedGesture}>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Animated.View style={combinedStyle as any}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.1)',
  },
});
