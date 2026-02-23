'use client';

import { useTranslations } from 'next-intl';
/**
 * ExerciseAiModal
 *
 * Interfaccia per inviare prompt all'agente AI e orchestrare CRUD batch.
 * Usa componente generico AiGenerationModal.
 */

import { useState } from 'react';
import { useExerciseGeneration } from '@giulio-leone/hooks/use-exercise-generation';
import type {
  ExerciseGenerationInput,
  ExerciseGenerationOutput,
} from '@giulio-leone/hooks/use-exercise-generation';
import {
  AiGenerationModal,
  type OptionConfig,
  type GenerationHookState,
} from '../shared/ai-generation-modal';

interface ExerciseAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void | Promise<void>;
}

export function ExerciseAiModal({ isOpen, onClose, onSuccess }: ExerciseAiModalProps) {
  const t = useTranslations('admin');

  const [autoApprove, setAutoApprove] = useState(true);
  const [mergeExisting, setMergeExisting] = useState(true);

  const countSuccess = (entries: Array<{ success?: boolean } | null | undefined> | undefined) =>
    Array.isArray(entries) ? entries.filter((entry) => entry?.success).length : 0;

  const generation = useExerciseGeneration({
    onProgress: () => {
      // Progress handled by UI components
    },
    onComplete: async (output) => {
      if (output) {
        const created = output.createResult?.created ?? 0;
        const updated = countSuccess(
          output.updateResult as Array<{ success?: boolean }> | undefined
        );
        const deleted = countSuccess(
          output.deleteResult as Array<{ success?: boolean }> | undefined
        );
        const approvals = countSuccess(
          output.approvalResult as Array<{ success?: boolean }> | undefined
        );
        const message = `AI completata: ${created} creati, ${updated} aggiornati, ${approvals} stati aggiornati, ${deleted} eliminati`;
        await onSuccess(message);
      }
    },
    onError: () => {
      // Error handled by UI
    },
  });

  const generationAdapter: GenerationHookState<ExerciseGenerationOutput> = {
    isGenerating: generation.isGenerating,
    isStreaming: generation.isStreaming,
    progress: generation.progress,
    currentMessage: generation.currentMessage,
    error: generation.error,
    result: generation.result,
    streamEvents: generation.streamEvents,
    generateStream: (input: unknown) => generation.generateStream(input as ExerciseGenerationInput),
    reset: generation.reset,
  };

  const options: OptionConfig[] = [
    {
      key: 'autoApprove',
      label: 'Approva automaticamente i nuovi esercizi',
      checked: autoApprove,
      onChange: setAutoApprove,
    },
    {
      key: 'mergeExisting',
      label: 'Unisci / aggiorna gli slug esistenti',
      checked: mergeExisting,
      onChange: setMergeExisting,
    },
  ];

  return (
    <AiGenerationModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title={t('admin.exercise_ai_modal.ai_exercise_manager')}
      description={t('admin.exercise_ai_modal.scrivi_cosa_vuoi_ottenere_es_aggiungi_3_')}
      placeholder={t('admin.exercise_ai_modal.esempio_genera_5_esercizi_per_principian')}
      useGenerationHook={() => generationAdapter}
      options={options}
      buildSuccessMessage={(result) => {
        const created = result.createResult?.created ?? 0;
        const skipped = result.createResult?.skipped ?? 0;
        const deleted = countSuccess(result.deleteResult as Array<{ success?: boolean }>);
        const approvals = countSuccess(result.approvalResult as Array<{ success?: boolean }>);
        return `Nuovi esercizi: ${created} (saltati: ${skipped}) · Eliminati: ${deleted} · Status aggiornati: ${approvals}`;
      }}
      buildResultDisplay={(result) => (
        <div className="mt-2 grid gap-1 text-xs text-emerald-800 sm:grid-cols-2 dark:text-emerald-200">
          <div>
            {t('admin.exercise_ai_modal.nuovi_esercizi')}
            {result.createResult?.created ?? 0} {t('admin.exercise_ai_modal.saltati')}{' '}
            {result.createResult?.skipped ?? 0})
          </div>
          <div>
            {t('admin.exercise_ai_modal.eliminati')}
            {countSuccess(result.deleteResult as Array<{ success?: boolean }>)}{' '}
            {t('admin.exercise_ai_modal.status_aggiornati')}
            {countSuccess(result.approvalResult as Array<{ success?: boolean }>)}
          </div>
          {result.summary && (
            <div className="sm:col-span-2">
              {t('admin.exercise_ai_modal.sintesi')}
              {result.summary}
            </div>
          )}
        </div>
      )}
    />
  );
}
