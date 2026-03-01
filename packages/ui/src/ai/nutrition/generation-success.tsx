'use client';

import { useTranslations } from 'next-intl';

import Link from 'next/link';
import type { PatternNutritionGenerationOutput } from '@giulio-leone/schemas';
import { cn } from '@giulio-leone/lib-design-system';
import { animations } from '@giulio-leone/lib-design-system/animations';
import { CheckCircle2, ArrowRight, CalendarDays } from 'lucide-react';

interface GenerationSuccessProps {
  result: PatternNutritionGenerationOutput;
  onReset: () => void;
}

export function GenerationSuccess({ result, onReset }: GenerationSuccessProps) {
  const t = useTranslations('nutrition');

  const summary =
    'summary' in result && typeof result.summary === 'string'
      ? result.summary
      : 'Il tuo piano nutrizionale è pronto!';

  return (
    <div className={cn('text-center', animations.fadeIn)}>
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20 duration-1000"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-xl shadow-green-500/20 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>
      </div>

      <h2 className="mb-3 text-3xl font-bold text-neutral-900 dark:text-white">
        {t('nutrition.generation_success.piano_generato_con_successo')}
      </h2>
      <p className="mx-auto mb-8 max-w-lg text-neutral-600 dark:text-neutral-400">{summary}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/nutrition"
          className={cn(
            'group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-green-600 px-6 py-4 font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-500 hover:shadow-green-500/40 active:scale-[0.98]'
          )}
        >
          {t('nutrition.generation_success.vai_al_piano')}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>

        <button
          onClick={onReset}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neutral-200/60 bg-white px-6 py-4 font-semibold text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08]'
          )}
        >
          <CalendarDays className="h-5 w-5" />
          {t('nutrition.generation_success.genera_un_altro_piano')}
        </button>
      </div>
    </div>
  );
}
