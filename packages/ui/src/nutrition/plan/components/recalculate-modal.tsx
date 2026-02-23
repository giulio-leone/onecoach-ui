/**
 * RecalculateModal Component
 *
 * Modal per confermare ricalcolo AI dei macro
 */

'use client';
import { Button } from '@giulio-leone/ui';
import { Modal, ModalFooter } from '@giulio-leone/ui';

import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import type { Food } from "@giulio-leone/types/nutrition";

interface RecalculateInfo {
  dayNumber: number;
  foodId: string;
  food: Food;
  creditsRequired: number;
  creditsAvailable: number;
}

interface RecalculateModalProps {
  isOpen: boolean;
  recalculateInfo: RecalculateInfo | null;
  isRecalculating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RecalculateModal({
  isOpen,
  recalculateInfo,
  isRecalculating,
  onConfirm,
  onCancel,
}: RecalculateModalProps) {
  if (!isOpen || !recalculateInfo) return null;

  const hasInsufficientCredits = recalculateInfo.creditsAvailable < recalculateInfo.creditsRequired;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Ricalcolo Macro Automatico" size="md">
      <p className={cn('mb-4 text-sm', darkModeClasses.text.tertiary)}>
        La modifica dell&apos;alimento &quot;{recalculateInfo.food.name}&quot; ha causato uno
        squilibrio rispetto ai macro target. Vuoi utilizzare l&apos;AI per ricalcolare
        automaticamente gli altri alimenti del giorno?
      </p>
      <div className={cn('mb-6 rounded-xl p-4 shadow-sm', darkModeClasses.bg.subtle)}>
        <div className="flex justify-between text-sm">
          <span className={cn('font-medium', darkModeClasses.text.tertiary)}>
            Crediti richiesti:
          </span>
          <span className={cn('font-bold', darkModeClasses.text.primary)}>
            {recalculateInfo.creditsRequired}
          </span>
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className={cn('font-medium', darkModeClasses.text.tertiary)}>
            Crediti disponibili:
          </span>
          <span className={cn('font-bold', darkModeClasses.text.primary)}>
            {recalculateInfo.creditsAvailable}
          </span>
        </div>
      </div>
      {hasInsufficientCredits && (
        <p className="mb-4 text-center text-xs text-red-600 dark:text-red-400">
          Crediti insufficienti. Acquista crediti per utilizzare questa funzione.
        </p>
      )}

      <ModalFooter>
        <Button variant="outline" onClick={onCancel} disabled={isRecalculating}>
          Annulla
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isRecalculating || hasInsufficientCredits}
          variant="primary"
        >
          {isRecalculating ? 'Ricalcolo in corso...' : 'Conferma e Ricalcola'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
