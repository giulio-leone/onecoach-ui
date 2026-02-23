/**
 * Dialog Component - React Native
 *
 * Cross-platform dialog using React Native Modal
 * Mobile-optimized, accessible
 */

import React, { useEffect } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { View, Text, Modal as RNModal, TextInput, StyleSheet, Pressable } from 'react-native';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react-native';
import { Button } from './button.native';
import {
  type DialogProps,
  getDialogTypeConfig,
  getDialogLabels,
  useDialogInput,
  useDialogHandlers,
} from './dialog.shared';

// Re-export types for convenience
export type { DialogType, DialogProps } from './dialog.shared';

export const Dialog = ({
  isOpen,
  onClose,
  type = 'alert',
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  defaultValue,
  placeholder,
  closeOnBackdropClick = false,
  inputValue: controlledInputValue,
  onInputChange,
}: DialogProps & { inputValue?: string; onInputChange?: (value: string) => void }) => {
  const inputRef = React.useRef<RNTextInput>(null);

  // Use shared hooks
  const { value: inputValue, setValue: setInputValue } = useDialogInput(
    isOpen,
    defaultValue,
    controlledInputValue,
    onInputChange
  );

  const { handleCancel, handleConfirm, handleBackdropClick } = useDialogHandlers(
    type,
    onClose,
    onConfirm,
    onCancel
  );

  // Focus input for prompt dialogs
  useEffect(() => {
    if (isOpen && type === 'prompt' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, type]);

  const typeConfig = getDialogTypeConfig(type);
  const labels = getDialogLabels(type, confirmLabel, cancelLabel, title);

  // Icon component mapping
  const IconComponent = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
    alert: AlertCircle,
    confirm: AlertCircle,
    prompt: AlertCircle,
  }[type];

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={() => handleBackdropClick(closeOnBackdropClick)}>
        <View style={styles.container}>
          <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: typeConfig.iconBg }]}>
                <IconComponent size={24} color={typeConfig.iconColor} />
              </View>

              <View style={styles.headerText}>
                {labels.title && <Text style={styles.title}>{labels.title}</Text>}
                <Text style={styles.message}>{message}</Text>
              </View>
            </View>

            {/* Prompt Input */}
            {type === 'prompt' && (
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={placeholder}
                  style={styles.input}
                  onSubmitEditing={handleConfirm}
                  returnKeyType="done"
                  autoFocus
                />
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              {(type === 'confirm' || type === 'prompt') && (
                <Button variant="outline" onPress={handleCancel} className="mr-2 flex-1">
                  {labels.cancel}
                </Button>
              )}
              <Button
                variant={type === 'error' ? 'danger' : 'primary'}
                onPress={handleConfirm}
                className="flex-1"
              >
                {labels.confirm}
              </Button>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </RNModal>
  );
};

// -----------------------------------------------------------------------------
// Modal Implementation (Custom Content)
// -----------------------------------------------------------------------------

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
  size: _size = 'md', // unused in native simple modal but kept for API compat
  closeOnBackdropClick = true,
  showCloseButton = true,
  mobileFullScreen = false,
}: ModalProps) => {
  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="slide" // Use slide for "Modal" feel vs fade for "Dialog"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={() => closeOnBackdropClick && onClose()}>
        <View style={[styles.container, mobileFullScreen && styles.fullScreen]}>
          <Pressable
            style={[styles.modal, mobileFullScreen && styles.modalFullScreen]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.modalHeader}>
                {title && <Text style={styles.title}>{title}</Text>}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    onPress={onClose}
                    className="min-h-[32px] min-w-[32px] p-1"
                  >
                    <Text style={{ color: '#737373' }}>✕</Text>
                  </Button>
                )}
              </View>
            )}

            {/* Body */}
            <View style={styles.body}>{children}</View>
          </Pressable>
        </View>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    elevation: 5,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  },
  // Modal specific styles
  fullScreen: {
    padding: 0,
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderRadius: 16,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    elevation: 5,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.25)',
  },
  modalFullScreen: {
    borderRadius: 0,
    maxHeight: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171717',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#525252',
    lineHeight: 22,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    padding: 16,
  },
  body: {
    flex: 1,
  },
});

// Export input value getter for compatibility
export const getDialogInputValue = (): string => {
  return '';
};

export const ModalFooter = ({ children }: { children: React.ReactNode }) => {
  return <View style={styles.footer}>{children}</View>;
};

// Alias non-legacy per API cross-platform
export { Dialog as SimpleDialog };
