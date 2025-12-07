import React from 'react';
import { type ViewStyle } from 'react-native';
interface PinchToZoomProps {
    children: React.ReactNode;
    minScale?: number;
    maxScale?: number;
    style?: ViewStyle | ViewStyle[];
}
/**
 * Pinch to zoom gesture handler
 * Supports pinch zoom and pan gestures
 */
export declare function PinchToZoom({ children, minScale, maxScale, style }: PinchToZoomProps): import("react/jsx-runtime").JSX.Element;
export {};
