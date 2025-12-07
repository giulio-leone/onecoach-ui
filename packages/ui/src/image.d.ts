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
};
export declare function Image({ src, source, width, height, alt, ...rest }: ExpoNativeImageProps): import("react/jsx-runtime").JSX.Element | null;
export default Image;
