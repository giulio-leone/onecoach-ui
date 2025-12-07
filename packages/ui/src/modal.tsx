/**
 * Modal Component
 *
 * Mobile-first, touch-friendly modal with design tokens
 * Responsive, accessible, deep dark mode optimized
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';

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

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  showCloseButton = true,
  mobileFullScreen = true,
}: ModalProps) => {
  const [mounted, setMounted] = React.useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent background scroll on mobile
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
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
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
    return undefined;
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Responsive size styles - Mobile-first
  const sizeStyles = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md sm:max-w-lg',
    lg: 'w-full max-w-lg sm:max-w-2xl',
    xl: 'w-full max-w-2xl sm:max-w-4xl',
    full: 'w-full h-full max-w-full max-h-full m-0 rounded-none',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-[1050] flex items-center justify-center',
        'p-4 sm:p-6',
        mobileFullScreen && 'sm:items-center',
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

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full',
          sizeStyles[size],
          mobileFullScreen && size === 'full' && 'sm:m-4 sm:h-auto sm:rounded-2xl',
          !mobileFullScreen && 'rounded-2xl',
          'overflow-hidden',
          darkModeClasses.card.elevated,
          'animate-slide-up',
          'max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]',
          'flex flex-col'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
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
              'flex-shrink-0'
            )}
          >
            {title && (
              <h2
                id="modal-title"
                className={cn('text-lg font-semibold sm:text-xl', darkModeClasses.text.primary)}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'min-h-[2.75rem] min-w-[2.75rem]', // Touch-friendly
                  'rounded-lg p-2',
                  'transition-colors duration-200',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  'active:bg-neutral-200 dark:active:bg-neutral-600',
                  'focus-visible:ring-2 focus-visible:outline-none',
                  'focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400',
                  'focus-visible:ring-offset-2',
                  'touch-manipulation'
                )}
                aria-label="Close modal"
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
            'overscroll-contain' // Prevent scroll chaining on mobile
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Modal Footer Component
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter = ({ children, className = '' }: ModalFooterProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-stretch sm:flex-row sm:items-center',
        'justify-end gap-3',
        'border-t',
        darkModeClasses.border.base,
        'px-4 py-4 sm:px-6',
        'flex-shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
};
