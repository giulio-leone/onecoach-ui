import { Image as ExpoImage } from 'expo-image';
import type { ComponentProps } from 'react';

type ExpoNativeImageProps = ComponentProps<typeof ExpoImage> & {
  /**
   * Convenience alias for `source={{ uri }}` to match the shared API surface.
   */
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
};

export function Image({ src, source, width: _width, height: _height, alt, ...rest }: ExpoNativeImageProps) {
  const resolvedSource = source ?? (src ? { uri: src } : undefined);

  if (!resolvedSource) {
    return null;
  }

  return <ExpoImage {...rest} source={resolvedSource} accessibilityLabel={alt} />;
}

export default Image;
