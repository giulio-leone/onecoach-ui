/**
 * Dialog Shared Logic
 *
 * Common types, utilities, and hooks for both web and native dialogs
 * Following DRY principle to eliminate duplication
 */
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
export declare function getDialogTypeConfig(type: DialogType): DialogTypeConfig;
/**
 * Get default labels based on dialog type and custom labels
 */
export declare function getDialogLabels(type: DialogType, confirmLabel?: string, cancelLabel?: string, title?: string): {
    confirm: string;
    cancel: string;
    title: string;
};
/**
 * Hook to manage dialog input state (for prompt dialogs)
 */
export declare function useDialogInput(isOpen: boolean, defaultValue: string | undefined, controlledValue?: string, onControlledChange?: (value: string) => void): {
    value: string;
    setValue: (value: string) => void;
};
/**
 * Hook to manage dialog handlers
 */
export declare function useDialogHandlers(type: DialogType, onClose: () => void, onConfirm?: () => void, onCancel?: () => void): {
    handleCancel: () => void;
    handleConfirm: () => void;
    handleBackdropClick: (closeOnBackdropClick: boolean) => void;
};
