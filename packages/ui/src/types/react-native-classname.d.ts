import 'react-native';

/**
 * NativeWind-style `className` support.
 *
 * Several UI components in this package use `className` on React Native primitives.
 * Runtime support is provided by the styling layer, but upstream RN typings don't
 * include `className`. We augment the prop interfaces here.
 */

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
  }

  interface PressableProps {
    className?: string;
  }

  interface TouchableOpacityProps {
    className?: string;
  }

  interface TextInputProps {
    className?: string;
  }
}
