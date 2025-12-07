/**
 * Modal Component
 *
 * Mobile-first, touch-friendly modal with design tokens
 * Responsive, accessible, deep dark mode optimized
 */
import React from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnBackdropClick?: boolean;
    showCloseButton?: boolean;
    mobileFullScreen?: boolean;
}
export declare const Modal: ({ isOpen, onClose, title, children, size, closeOnBackdropClick, showCloseButton, mobileFullScreen, }: ModalProps) => React.ReactPortal | null;
export interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}
export declare const ModalFooter: ({ children, className }: ModalFooterProps) => import("react/jsx-runtime").JSX.Element;
