'use client';

import { useTranslations } from 'next-intl';
/**
 * FoodAiGenerationModal
 *
 * Interfaccia per inviare prompt all'agente AI e generare alimenti in batch.
 * Usa componente generico AiGenerationModal.
 */

import { useState } from 'react';
import { useFoodGeneration } from '@giulio-leone/hooks/use-food-generation';
import { AiGenerationModal, type OptionConfig } from '../shared/ai-generation-modal';

interface FoodAiGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void | Promise<void>;
}

export function FoodAiModal({ isOpen, onClose, onSuccess }: FoodAiGenerationModalProps) {
  const t = useTranslations('admin');

  const [mergeExisting, setMergeExisting] = useState(true);

  const generation = useFoodGeneration({
    onProgress: () => {
      // Progress handled by UI components
    },
    onComplete: async (output) => {
      if (output) {
        const created = output.createResult?.created ?? 0;
        const updated = output.createResult?.updated ?? 0;
        const skipped = output.createResult?.skipped ?? 0;
        const message = `AI completata: ${created} creati, ${updated} aggiornati, ${skipped} saltati`;
        await onSuccess(message);
      }
    },
    onError: () => {
      // Error handled by UI
    },
  });

  const options: OptionConfig[] = [
    {
      key: 'mergeExisting',
      label: 'Unisci / aggiorna gli alimenti esistenti con lo stesso nome',
      checked: mergeExisting,
      onChange: setMergeExisting,
    },
  ];

  return (
    <AiGenerationModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title={t('food_ai_modal.ai_food_generator')}
      description={t('food_ai_modal.scrivi_cosa_vuoi_ottenere_es_genera_5_al')}
      placeholder={t('food_ai_modal.esempio_genera_10_alimenti_ricchi_di_pro')}
      useGenerationHook={() => generation}
      options={options}
      buildSuccessMessage={(result) => {
        const created = result.createResult?.created ?? 0;
        const updated = result.createResult?.updated ?? 0;
        const skipped = result.createResult?.skipped ?? 0;
        return `Nuovi alimenti: ${created} (saltati: ${skipped}) · Aggiornati: ${updated}`;
      }}
      buildResultDisplay={(result) => (
        <div className="mt-2 grid gap-1 text-xs text-emerald-800 sm:grid-cols-2 dark:text-emerald-200">
          <div>
            {t('food_ai_modal.nuovi_alimenti')}
            {result.createResult?.created ?? 0} {t('food_ai_modal.saltati')}{' '}
            {result.createResult?.skipped ?? 0})
          </div>
          <div>
            {t('food_ai_modal.aggiornati')}
            {result.createResult?.updated ?? 0}
          </div>
          {result.summary && (
            <div className="sm:col-span-2">
              {t('food_ai_modal.sintesi')}
              {result.summary}
            </div>
          )}
        </div>
      )}
    />
  );
}
