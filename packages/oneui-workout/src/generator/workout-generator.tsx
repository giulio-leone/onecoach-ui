'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import type { UseWorkoutGenerationHook, ApiProfileData, TierAI } from './types';
import { useWorkoutForm } from './use-workout-form';
import { WorkoutForm } from './workout-form';

import { logger } from '@onecoach/lib-shared';

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
    getGenerationInput 
  } = useWorkoutForm(profileLoader);

  // 2. Generation Logic
  const { 
    generate, 
    isGenerating, 
    progress, 
    error, 
    reset 
  } = useWorkoutGenerationHook({
    onSuccess: (id) => {
      setGeneratedId(id);
      onSuccess?.(id);
    },
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
      <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-700/30 border-t-indigo-500 animate-spin" />
        </div>
        
        <div className="space-y-2 text-center max-w-sm">
          <p className="text-lg font-medium text-slate-100">
            {progress?.message || t('status.generating')}
          </p>
          
          {(progress as any)?.output && (
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
              <p className="text-sm text-slate-400 font-mono">
                {typeof (progress as any).output === 'string' 
                  ? (progress as any).output 
                  : JSON.stringify((progress as any).output).slice(0, 100) + '...'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        
        <div className="text-center space-y-2 max-w-sm">
          <p className="text-lg font-medium text-red-400">
            {t('status.error')}
          </p>
          <p className="text-sm text-slate-400">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
        
        <button
          onClick={() => {
            reset?.();
            // window.location.reload() - avoids full reload 
          }}
          className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
        >
          {t('actions.tryAgain')}
        </button>
      </div>
    );
  }

  if (generatedId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <span className="text-3xl">✨</span>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-xl font-medium text-emerald-400">
            {t('status.success')}
          </p>
          <p className="text-sm text-slate-400">
            {t('status.redirecting')}
          </p>
        </div>
        
        <Link 
          href={`/workouts/${generatedId}`}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
