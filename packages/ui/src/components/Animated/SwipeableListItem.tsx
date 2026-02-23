import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SwipeableListItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
  deleteThreshold?: number;
  archiveThreshold?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Swipeable list item with left/right swipe actions
 * Swipe right for archive, swipe left for delete
 */
export function SwipeableListItem({
  children,
  onDelete,
  onArchive,
  deleteThreshold = -120,
  archiveThreshold = 120,
  style,
}: SwipeableListItemProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(0);
  const opacity = useSharedValue(1);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDelete = () => {
    if (onDelete) {
      // Animate out
      itemHeight.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });

      // Call delete after animation
      setTimeout(() => {
        onDelete();
      }, 300);
    }
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive();
    }
    // Reset position
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;

      // Haptic feedback at thresholds
      if (
        onDelete &&
        event.translationX <= deleteThreshold &&
        event.translationX > deleteThreshold - 10
      ) {
        runOnJS(triggerHaptic)();
      }
      if (
        onArchive &&
        event.translationX >= archiveThreshold &&
        event.translationX < archiveThreshold + 10
      ) {
        runOnJS(triggerHaptic)();
      }
    })
    .onEnd((event) => {
      if (onDelete && event.translationX < deleteThreshold) {
        // Delete action
        runOnJS(triggerHaptic)();
        runOnJS(handleDelete)();
      } else if (onArchive && event.translationX > archiveThreshold) {
        // Archive action
        runOnJS(triggerHaptic)();
        runOnJS(handleArchive)();
      } else {
        // Reset to original position
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    height: itemHeight.value === 0 ? itemHeight.value : undefined,
    opacity: opacity.value,
  }));

  const deleteBackgroundStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? Math.min(-translateX.value / Math.abs(deleteThreshold), 1) : 0,
  }));

  const archiveBackgroundStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? Math.min(translateX.value / archiveThreshold, 1) : 0,
  }));

  const containerStyle = [styles.container, style].filter(
    Boolean
  ) as unknown as StyleProp<ViewStyle>;
  const deleteBgStyle = [styles.deleteBackground, deleteBackgroundStyle].filter(
    Boolean
  ) as unknown as StyleProp<ViewStyle>;
  const archiveBgStyle = [styles.archiveBackground, archiveBackgroundStyle].filter(
    Boolean
  ) as unknown as StyleProp<ViewStyle>;
  const contentStyle = [styles.content, animatedStyle].filter(
    Boolean
  ) as unknown as StyleProp<ViewStyle>;

  return (
    <View style={containerStyle}>
      {/* Delete Background (Left Swipe) */}
      {onDelete && (
        <Animated.View
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={deleteBgStyle as any}
        >
          <Text style={styles.deleteText}>🗑️ Delete</Text>
        </Animated.View>
      )}

      {/* Archive Background (Right Swipe) */}
      {onArchive && (
        <Animated.View
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={archiveBgStyle as any}
        >
          <Text style={styles.archiveText}>📦 Archive</Text>
        </Animated.View>
      )}

      {/* Swipeable Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={contentStyle as any}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'white',
    zIndex: 1,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    width: '100%',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  archiveBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    width: '100%',
  },
  archiveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
