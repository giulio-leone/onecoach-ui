import 'react-native';

/**
 * NativeWind-style `className` support.
 *
 * This file is imported for side-effects from the package entrypoint so that
 * consumers compiling from source (workspace TS) get the augmentation.
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
