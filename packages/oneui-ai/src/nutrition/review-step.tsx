'use client';

import { useTranslations } from 'next-intl';

import type { NutritionFormData } from 'app/features/nutrition';
import { Sex } from '@onecoach/types/client';
import { cn } from '@onecoach/lib-design-system';
import { Check, ArrowRight } from 'lucide-react';

interface ReviewStepProps {
  formData: NutritionFormData;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function ReviewStep({ formData, onGenerate, isGenerating }: ReviewStepProps) {
  const t = useTranslations('nutrition');

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-green-100 bg-green-50/50 p-6 dark:border-green-900/30 dark:bg-green-900/10">
        <h3 className="mb-4 text-lg font-semibold text-green-900 dark:text-green-100">
          {t('nutrition.review_step.riepilogo_piano')}
        </h3>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-wider text-green-600/70 uppercase dark:text-green-400/70">
              Profilo
            </dt>
            <dd className="mt-1 text-base font-medium text-neutral-900 dark:text-neutral-100">
              {formData.userProfile?.gender === Sex.MALE
                ? 'Uomo'
                : formData.userProfile?.gender === Sex.FEMALE
                  ? 'Donna'
                  : 'Altro'}
              , {formData.userProfile?.age} anni
              <br />
              {formData.userProfile?.weight} {t('nutrition.review_step.kg')}
              {formData.userProfile?.height} cm
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium tracking-wider text-green-600/70 uppercase dark:text-green-400/70">
              Obiettivo
            </dt>
            <dd className="mt-1 text-base font-medium text-neutral-900 dark:text-neutral-100">
              {formData.goals?.goal.replace('_', ' ')}
              <br />
              {formData.goals?.mealsPerDay} {t('nutrition.review_step.pasti_al_giorno')}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium tracking-wider text-green-600/70 uppercase dark:text-green-400/70">
              Preferenze
            </dt>
            <dd className="mt-1 text-base font-medium text-neutral-900 dark:text-neutral-100">
              {t('nutrition.review_step.dieta')}
              {formData.restrictions?.dietType}
              <br />
              {t('nutrition.review_step.attivita')}
              {formData.userProfile?.activityLevel}
            </dd>
          </div>

          {(formData.restrictions?.allergies?.length ?? 0) > 0 && (
            <div>
              <dt className="text-xs font-medium tracking-wider text-red-500/70 uppercase">
                Restrizioni
              </dt>
              <dd className="mt-1 text-base font-medium text-neutral-900 dark:text-neutral-100">
                {formData.restrictions?.allergies?.join(', ')}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t('nutrition.review_step.l_ai_analizzera_il_tuo_profilo_metabolic')}
          </p>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={cn(
          'group flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition-all',
          isGenerating
            ? 'cursor-not-allowed bg-neutral-400 opacity-70'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:shadow-green-500/40 active:scale-[0.98]'
        )}
      >
        {isGenerating ? (
          <>{t('nutrition.review_step.generazione_in_corso')}</>
        ) : (
          <>
            {t('nutrition.review_step.genera_piano_nutrizionale')}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </div>
  );
}
