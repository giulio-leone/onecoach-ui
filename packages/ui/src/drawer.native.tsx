/**
 * Drawer Component - React Native
 *
 * Cross-platform drawer using React Native Modal and gesture handlers
 * Mobile-optimized, accessible
 */

import { useEffect } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
  BackHandler,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { type DrawerProps, getDrawerSizeStyles } from './drawer.shared';

export type { DrawerProps, DrawerPosition } from './drawer.shared';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  closeOnBackdropClick = true,
  showCloseButton = true,
}: DrawerProps) => {
  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpen) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isOpen, onClose]);

  const handleBackdropPress = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  const sizeStyles = getDrawerSizeStyles(position, size);

  // Calculate drawer dimensions
  const getDrawerStyle = () => {
    if (position === 'left' || position === 'right') {
      const width = sizeStyles.width
        ? parseFloat(sizeStyles.width.replace('rem', '')) * 16
        : SCREEN_WIDTH * 0.8;
      return {
        width: Math.min(width, SCREEN_WIDTH * 0.9),
        height: SCREEN_HEIGHT,
      };
    } else {
      const height = sizeStyles.height
        ? parseFloat(sizeStyles.height.replace('vh', '')) * (SCREEN_HEIGHT / 100)
        : SCREEN_HEIGHT * 0.6;
      return {
        width: SCREEN_WIDTH,
        height: Math.min(height, SCREEN_HEIGHT * 0.9),
      };
    }
  };

  const drawerDimensions = getDrawerStyle();

  const getContainerStyle = () => {
    switch (position) {
      case 'left':
        return [styles.container, styles.containerLeft];
      case 'right':
        return [styles.container, styles.containerRight];
      case 'bottom':
        return [styles.container, styles.containerBottom];
      case 'top':
        return [styles.container, styles.containerTop];
      default:
        return [styles.container, styles.containerRight];
    }
  };

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <View style={getContainerStyle()}>
          <Pressable
            style={[
              styles.drawer,
              {
                width: drawerDimensions.width,
                height: drawerDimensions.height,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title &&
                  (typeof title === 'string' ? (
                    <Text style={styles.title}>{title}</Text>
                  ) : (
                    <View style={{ flex: 1 }}>{title}</View>
                  ))}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    accessibilityLabel="Close drawer"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={20} color="#737373" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Body - Scrollable */}
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              {children}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
  },
  containerLeft: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  containerRight: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  containerBottom: {
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  containerTop: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  drawer: {
    backgroundColor: '#ffffff',

    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171717',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
  },
});
