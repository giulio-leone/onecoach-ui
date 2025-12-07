/**
 * Drawer Shared Logic
 *
 * Common types and utilities for both web and native drawers
 * Following DRY principle to eliminate duplication
 */
import type React from 'react';
export type DrawerPosition = 'left' | 'right' | 'bottom' | 'top';
export interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    position?: DrawerPosition;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnBackdropClick?: boolean;
    showCloseButton?: boolean;
    mobileFullScreen?: boolean;
}
/**
 * Get drawer size styles based on position and size
 */
export declare function getDrawerSizeStyles(position: DrawerPosition, size: 'sm' | 'md' | 'lg' | 'xl' | 'full'): {
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
};
