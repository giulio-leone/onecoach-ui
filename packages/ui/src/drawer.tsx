/**
 * Drawer Component - Web
 *
 * Side drawer component for web (desktop: side, mobile: bottom sheet)
 * Mobile-first, touch-friendly, deep dark mode optimized
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { type DrawerProps, getDrawerSizeStyles } from './drawer.shared';

export type { DrawerProps, DrawerPosition } from './drawer.shared';

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  closeOnBackdropClick = true,
  showCloseButton = true,
  mobileFullScreen = false,
}: DrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;

      if (firstElement) {
        setTimeout(() => firstElement.focus(), 100);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = getDrawerSizeStyles(position, size);

  // Determine if we should use bottom sheet on mobile
  const useBottomSheet = position === 'right' && mobileFullScreen;

  // Position classes
  const positionClasses = {
    left: useBottomSheet
      ? 'fixed right-0 bottom-0 left-0 sm:left-0 sm:right-auto sm:top-0 sm:bottom-0'
      : 'fixed left-0 top-0 bottom-0',
    right: useBottomSheet
      ? 'fixed right-0 bottom-0 left-0 sm:right-0 sm:left-auto sm:top-0 sm:bottom-0'
      : 'fixed right-0 top-0 bottom-0',
    bottom: 'fixed bottom-0 left-0 right-0',
    top: 'fixed top-0 left-0 right-0',
  };

  // Animation classes
  const animationClasses = {
    left: useBottomSheet ? 'animate-slide-up sm:animate-slide-in-left' : 'animate-slide-in-left',
    right: useBottomSheet ? 'animate-slide-up sm:animate-slide-in-right' : 'animate-slide-in-right',
    bottom: 'animate-slide-up',
    top: 'animate-slide-down',
  };

  // Border radius classes
  const borderRadiusClasses = {
    left: useBottomSheet ? 'rounded-t-3xl sm:rounded-none' : 'rounded-none',
    right: useBottomSheet ? 'rounded-t-3xl sm:rounded-none' : 'rounded-none',
    bottom: 'rounded-t-3xl',
    top: 'rounded-b-3xl',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[1050]',
        'flex',
        position === 'left' && 'justify-start',
        position === 'right' && 'justify-end',
        position === 'bottom' && 'items-end',
        position === 'top' && 'items-start',
        'animate-fadeIn'
      )}
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className={cn('absolute inset-0', darkModeClasses.bg.backdrop, 'backdrop-blur-sm')}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div
        ref={drawerRef}
        className={cn(
          positionClasses[position],
          animationClasses[position],
          borderRadiusClasses[position],
          'relative',
          'overflow-hidden',
          'border-l border-white/20 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95',
          'shadow-2xl',
          'flex flex-col',
          useBottomSheet && 'max-h-[90vh] sm:max-h-full',
          !useBottomSheet && position !== 'bottom' && position !== 'top' && 'h-full',
          useBottomSheet && position === 'right' && 'w-full sm:w-auto',
          !useBottomSheet && position === 'right' && 'w-auto',
          !useBottomSheet && position === 'left' && 'w-auto'
        )}
        style={
          position === 'left' || position === 'right'
            ? { width: sizeStyles.width, maxWidth: sizeStyles.maxWidth }
            : { height: sizeStyles.height, maxHeight: sizeStyles.maxHeight }
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              'flex items-center justify-between',
              'border-b',
              darkModeClasses.border.base,
              'px-4 py-4 sm:px-6',
              'flex-shrink-0',
              'sticky top-0 z-10',
              darkModeClasses.bg.base
            )}
          >
            {title &&
              (typeof title === 'string' ? (
                <h2
                  id="drawer-title"
                  className={cn('text-lg font-semibold sm:text-xl', darkModeClasses.text.primary)}
                >
                  {title}
                </h2>
              ) : (
                <div id="drawer-title">{title}</div>
              ))}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'min-h-[2.75rem] min-w-[2.75rem]',
                  'rounded-lg p-2',
                  'transition-colors duration-200',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  'active:bg-neutral-200 dark:active:bg-neutral-600',
                  'focus-visible:ring-2 focus-visible:outline-none',
                  'focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400',
                  'focus-visible:ring-offset-2',
                  'touch-manipulation'
                )}
                aria-label="Close drawer"
              >
                <X className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            )}
          </div>
        )}

        {/* Body - Scrollable */}
        <div
          className={cn(
            'flex-1 overflow-y-auto',
            'px-4 py-4 sm:px-6 sm:py-6',
            'overscroll-contain'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
