/**
 * Drawer Component - Web
 *
 * Side drawer component for web (desktop: side, mobile: bottom sheet)
 * Mobile-first, touch-friendly, deep dark mode optimized
 */
import { type DrawerProps } from './drawer.shared';
export type { DrawerProps, DrawerPosition } from './drawer.shared';
export declare const Drawer: ({ isOpen, onClose, title, children, position, size, closeOnBackdropClick, showCloseButton, mobileFullScreen, }: DrawerProps) => import("react/jsx-runtime").JSX.Element | null;
