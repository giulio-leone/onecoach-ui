import { type ViewStyle, type StyleProp } from 'react-native';
interface SkeletonLoaderProps {
    width?: number | `${number}%`;
    height?: number | `${number}%`;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}
export declare function SkeletonLoader({ width, height, borderRadius, style, }: SkeletonLoaderProps): import("react/jsx-runtime").JSX.Element;
export declare function SkeletonCard(): import("react/jsx-runtime").JSX.Element;
export declare function SkeletonList({ count }: {
    count?: number;
}): import("react/jsx-runtime").JSX.Element;
export declare function SkeletonStats(): import("react/jsx-runtime").JSX.Element;
export {};
