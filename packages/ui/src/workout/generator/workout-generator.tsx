'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import type { UseWorkoutGenerationHook, ApiProfileData, TierAI } from './types';
import { useWorkoutForm } from './use-workout-form';
import { WorkoutForm } from './workout-form';

import { logger } from '@giulio-leone/lib-shared';

export interface WorkoutGeneratorProps {
  useWorkoutGenerationHook: UseWorkoutGenerationHook;
  profileLoader?: () => Promise<ApiProfileData | null>;
  onSuccess?: (programId: string) => void;
}

// Default profile loader that fetches from our API
async function defaultProfileLoader(): Promise<ApiProfileData | null> {
  try {
    const response = await fetch('/api/domain/profile/me');
    if (!response.ok) return null;
    return (await response.json()) as ApiProfileData;
  } catch (err) {
    logger.error('Failed to load profile', err as Error);
    return null;
  }
}

export function WorkoutGenerator({
  useWorkoutGenerationHook,
  profileLoader = defaultProfileLoader,
  onSuccess,
}: WorkoutGeneratorProps) {
  const t = useTranslations('workouts.generator');
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  // 1. Form State Management
  const {
    formData,
    // isLoadingProfile, // unused
    updateField,
    getGenerationInput,
  } = useWorkoutForm(profileLoader);

  const handleSuccess = useCallback(
    (id: string) => {
      setGeneratedId(id);
      onSuccess?.(id);
    },
    [onSuccess]
  );

  // 2. Generation Logic
  const { generate, isGenerating, progress, error, reset } = useWorkoutGenerationHook({
    onSuccess: handleSuccess,
  });

  // 3. Handlers
  const handleGenerate = async () => {
    const input = getGenerationInput();
    if (!input) {
      logger.warn('Form validation failed or incomplete');
      return;
    }

    // Reset previous state if any
    setGeneratedId(null);

    await generate(input);
  };

  const updateAdditionalNotes = (value: string) => updateField('additionalNotes', value);
  const updateTierAI = (value: TierAI) => updateField('tierAI', value);

  // ---------------------------------------------------------------------------
  // Render: Progress / Success / Error / Form
  // ---------------------------------------------------------------------------

  if (isGenerating) {
    return (
      <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center space-y-6 p-8 duration-300">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-neutral-700/30 border-t-indigo-500" />
        </div>

        <div className="max-w-sm space-y-2 text-center">
          <p className="text-lg font-medium text-neutral-100">
            {progress?.message || t('status.generating')}
          </p>

          {!!progress?.data?.output && (
            <div className="rounded-xl border border-neutral-800/50 bg-neutral-900/50 p-4">
              <p className="font-mono text-sm text-neutral-400">
                {typeof progress.data.output === 'string'
                  ? progress.data.output
                  : JSON.stringify(progress.data.output).slice(0, 100) + '...'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center space-y-6 p-8 duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <span className="text-3xl">⚠️</span>
        </div>

        <div className="max-w-sm space-y-2 text-center">
          <p className="text-lg font-medium text-red-400">{t('status.error')}</p>
          <p className="text-sm text-neutral-400">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>

        <button
          onClick={() => {
            reset?.();
            // window.location.reload() - avoids full reload
          }}
          className="rounded-lg bg-neutral-800 px-6 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
        >
          {t('actions.tryAgain')}
        </button>
      </div>
    );
  }

  if (generatedId) {
    return (
      <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center space-y-6 p-8 duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <span className="text-3xl">✨</span>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-xl font-medium text-emerald-400">{t('status.success')}</p>
          <p className="text-sm text-neutral-400">{t('status.redirecting')}</p>
        </div>

        <Link
          href={`/workouts/${generatedId}`}
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/30 active:scale-[0.98]"
        >
          {t('actions.viewProgram')}
        </Link>
      </div>
    );
  }

  return (
    <WorkoutForm
      formData={formData}
      updateField={updateField}
      updateAdditionalNotes={updateAdditionalNotes}
      updateTierAI={updateTierAI}
      generate={handleGenerate}
      isGenerating={isGenerating}
    />
  );
}
