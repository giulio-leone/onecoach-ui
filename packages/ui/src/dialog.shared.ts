/**
 * Dialog Shared Logic
 *
 * Common types, utilities, and hooks for both web and native dialogs
 * Following DRY principle to eliminate duplication
 */

import { useState, useEffect, useCallback } from 'react';
import { semanticColors } from '@onecoach/constants';

export type DialogType = 'alert' | 'confirm' | 'prompt' | 'info' | 'success' | 'warning' | 'error';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  type?: DialogType;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  defaultValue?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdropClick?: boolean;
}

export interface DialogTypeConfig {
  iconColor: string;
  iconBg: string;
}

/**
 * Get icon colors based on dialog type
 * Returns color values compatible with both web and native
 */
export function getDialogTypeConfig(type: DialogType): DialogTypeConfig {
  switch (type) {
    case 'success':
      return {
        iconColor: semanticColors.success.text,
        iconBg: semanticColors.success.bg,
      };
    case 'warning':
      return {
        iconColor: semanticColors.warning.text,
        iconBg: semanticColors.warning.bg,
      };
    case 'error':
      return {
        iconColor: semanticColors.error.text,
        iconBg: semanticColors.error.bg,
      };
    case 'info':
      return {
        iconColor: semanticColors.info.text,
        iconBg: semanticColors.info.bg,
      };
    default:
      return {
        iconColor: semanticColors.default.text,
        iconBg: semanticColors.default.bg,
      };
  }
}

/**
 * Get default labels based on dialog type and custom labels
 */
export function getDialogLabels(
  type: DialogType,
  confirmLabel?: string,
  cancelLabel?: string,
  title?: string
) {
  return {
    confirm: confirmLabel || (type === 'confirm' ? 'Confirm' : 'OK'),
    cancel: cancelLabel || 'Cancel',
    title: title || (type === 'confirm' ? 'Confirm' : type === 'prompt' ? 'Input' : 'Notice'),
  };
}

/**
 * Hook to manage dialog input state (for prompt dialogs)
 */
export function useDialogInput(
  isOpen: boolean,
  defaultValue: string | undefined,
  controlledValue?: string,
  onControlledChange?: (value: string) => void
) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = onControlledChange || setInternalValue;

  // Reset input when dialog opens
  useEffect(() => {
    if (isOpen) {
      const newValue = defaultValue || '';
      if (onControlledChange) {
        onControlledChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    }
  }, [isOpen, defaultValue, onControlledChange]);

  return { value, setValue };
}

/**
 * Hook to manage dialog handlers
 */
export function useDialogHandlers(
  type: DialogType,
  onClose: () => void,
  onConfirm?: () => void,
  onCancel?: () => void
) {
  const handleCancel = useCallback(() => {
    onCancel?.();
    onClose();
  }, [onCancel, onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    // For prompt dialogs, don't auto-close (let parent handle it)
    if (type !== 'prompt') {
      onClose();
    }
  }, [onConfirm, onClose, type]);

  const handleBackdropClick = useCallback(
    (closeOnBackdropClick: boolean) => {
      if (closeOnBackdropClick) {
        handleCancel();
      }
    },
    [handleCancel]
  );

  return { handleCancel, handleConfirm, handleBackdropClick };
}
