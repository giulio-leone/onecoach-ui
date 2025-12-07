/**
 * Dialog Shared Logic
 *
 * Common types, utilities, and hooks for both web and native dialogs
 * Following DRY principle to eliminate duplication
 */
import { useState, useEffect, useCallback } from 'react';
import { semanticColors } from '@OneCoach/constants/colors';
/**
 * Get icon colors based on dialog type
 * Returns color values compatible with both web and native
 */
export function getDialogTypeConfig(type) {
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
export function getDialogLabels(type, confirmLabel, cancelLabel, title) {
    return {
        confirm: confirmLabel || (type === 'confirm' ? 'Conferma' : 'OK'),
        cancel: cancelLabel || 'Annulla',
        title: title || (type === 'confirm' ? 'Conferma' : type === 'prompt' ? 'Input' : 'Avviso'),
    };
}
/**
 * Hook to manage dialog input state (for prompt dialogs)
 */
export function useDialogInput(isOpen, defaultValue, controlledValue, onControlledChange) {
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
            }
            else {
                setInternalValue(newValue);
            }
        }
    }, [isOpen, defaultValue, onControlledChange]);
    return { value, setValue };
}
/**
 * Hook to manage dialog handlers
 */
export function useDialogHandlers(type, onClose, onConfirm, onCancel) {
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
    const handleBackdropClick = useCallback((closeOnBackdropClick) => {
        if (closeOnBackdropClick) {
            handleCancel();
        }
    }, [handleCancel]);
    return { handleCancel, handleConfirm, handleBackdropClick };
}
