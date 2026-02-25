/**
 * Dialog Renderer
 *
 * Renders the dialog based on Zustand store state
 * Replaces DialogProvider with Zustand store
 */

'use client';

import { SimpleDialog } from '../dialog';
import { useDialogState } from '@giulio-leone/lib-stores';

export function DialogRenderer() {
  const { dialogState, handleConfirm, handleCancel, setInputValue } = useDialogState();

  return (
    <SimpleDialog
      isOpen={dialogState.isOpen}
      onClose={handleCancel}
      type={dialogState.type}
      title={dialogState.title}
      message={dialogState.message}
      confirmLabel={dialogState.confirmLabel}
      cancelLabel={dialogState.cancelLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      defaultValue={dialogState.defaultValue}
      placeholder={dialogState.placeholder}
      size={dialogState.size}
      closeOnBackdropClick={dialogState.closeOnBackdropClick}
      inputValue={dialogState.inputValue}
      onInputChange={setInputValue}
    />
  );
}
