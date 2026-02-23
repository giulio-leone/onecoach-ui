/**
 * FoodAiModal
 *
 * Usa FoodCameraInline per analizzare etichette o piatti e proporre creazione/abbinamento.
 */
'use client';
import { useState } from 'react';
import { Button, Modal, ModalFooter } from '@giulio-leone/ui';
import { FoodCameraInline } from '@giulio-leone/ui/nutrition';
interface FoodAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}
export function FoodScanModal({ isOpen, onClose, onAdded }: FoodAiModalProps) {
  const [mode, setMode] = useState<'label' | 'dish'>('label');
  const [message, setMessage] = useState<string | null>(null);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" showCloseButton={false}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className={`rounded px-3 py-1 text-sm ${mode === 'label' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'}`}
            onClick={() => setMode('label')}
          >
            Etichetta
          </button>
          <button
            className={`rounded px-3 py-1 text-sm ${mode === 'dish' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'}`}
            onClick={() => setMode('dish')}
          >
            Piatto
          </button>
        </div>
      </div>
      <FoodCameraInline
        onFoodAdded={() => {
          setMessage('Alimento aggiunto');
          onAdded();
        }}
        onDishSegmented={() => {
          setMessage('Piatto segmentato');
          onAdded();
        }}
      />
      {message && (
        <div className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</div>
      )}
      <ModalFooter>
        <Button onClick={onClose}>Chiudi</Button>
      </ModalFooter>
    </Modal>
  );
}
