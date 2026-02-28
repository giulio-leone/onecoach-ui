/**
 * Streaming Output Panel Component
 *
 * Componente condiviso per visualizzare output streaming degli agent
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Code, Copy, Check } from 'lucide-react';
import { logger } from '@giulio-leone/lib-shared';
import type { NutritionPlan } from '@giulio-leone/types/nutrition';
import type { WorkoutProgram } from '@giulio-leone/types/workout';

interface StreamingOutputPanelProps {
  content: string;
  parsedData?: NutritionPlan | WorkoutProgram | null;
  isLoading: boolean;
  colorTheme?: 'nutrition' | 'workout' | 'chat';
  onSave?: () => void;
  savedId?: string | null;
}

export function StreamingOutputPanel({
  content,
  parsedData,
  isLoading,
  colorTheme = 'nutrition',
  onSave,
  savedId,
}: StreamingOutputPanelProps) {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const themeColors = {
    nutrition: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      icon: 'text-green-600',
      accent: 'text-green-700',
    },
    workout: {
      border: 'border-primary-200',
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      accent: 'text-primary-700',
    },
    chat: {
      border: 'border-secondary-200',
      bg: 'bg-secondary-50',
      icon: 'text-secondary-600',
      accent: 'text-secondary-700',
    },
  };

  const theme = themeColors[colorTheme];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error: unknown) {
      logger.error(tCommon('error'), error);
    }
  };

  return (
    <div className="flex h-full min-h-[400px] flex-col overflow-x-hidden rounded-2xl border-2 border-neutral-200 bg-white shadow-lg sm:min-h-[500px] dark:border-white/[0.08] dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-neutral-200 p-3 sm:p-4 dark:border-white/[0.08]">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className={`rounded-lg ${theme.bg} flex-shrink-0 p-2`}>
            <Code className={`h-4 w-4 ${theme.icon} sm:h-5 sm:w-5`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-neutral-900 sm:text-lg dark:text-neutral-100">
              Output
            </h3>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
              {isLoading
                ? 'Generazione in corso...'
                : parsedData
                  ? 'Piano generato ✓'
                  : 'Streaming'}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {content && (
            <button
              onClick={handleCopy}
              className="rounded-lg border border-neutral-300 p-2 text-neutral-600 transition-colors active:bg-neutral-100 sm:hover:bg-neutral-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-400"
              title="Copia"
              aria-label="Copia contenuto"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg border border-neutral-300 p-2 text-neutral-600 transition-colors active:bg-neutral-100 sm:hover:bg-neutral-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-400"
            aria-label={isExpanded ? 'Comprimi' : 'Espandi'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-4 sm:p-6">
          {parsedData ? (
            <div className="space-y-4">
              <div
                className={`rounded-xl border-2 ${theme.border} ${theme.bg} overflow-x-hidden p-3 sm:p-4`}
              >
                <h4
                  className={`mb-2 text-sm font-semibold sm:text-base ${theme.accent} break-words`}
                >
                  {'name' in parsedData ? parsedData.name : t('common.ui.generatedPlan')}
                </h4>
                {parsedData && 'description' in parsedData && parsedData.description && (
                  <p className="text-xs break-words text-neutral-700 sm:text-sm dark:text-neutral-300">
                    {parsedData.description}
                  </p>
                )}
              </div>
              {isExpanded && (
                <pre className="overflow-x-auto rounded-xl border-2 border-neutral-200 bg-neutral-50 p-3 font-mono text-xs break-words whitespace-pre-wrap text-neutral-700 sm:p-4 dark:border-white/[0.08] dark:bg-neutral-800/50 dark:text-neutral-300">
                  {JSON.stringify(parsedData, null, 2)}
                </pre>
              )}
            </div>
          ) : content ? (
            <pre className="overflow-x-auto font-mono text-xs break-words whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
              {content}
            </pre>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="px-4 text-center">
                <p className="text-sm text-neutral-400 sm:text-base dark:text-neutral-600">
                  {t('common.output_panel.imposta_i_parametri_e_genera_il_tuo_pian')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {parsedData && onSave && !savedId && (
        <div className="border-t-2 border-neutral-200 bg-neutral-50 p-3 sm:p-4 dark:border-white/[0.08] dark:bg-neutral-800/50">
          <button
            onClick={onSave}
            className={`min-h-[48px] w-full rounded-xl bg-gradient-to-r px-6 py-3 text-base font-bold text-white shadow-lg transition-all active:scale-95 sm:hover:scale-105 ${
              colorTheme === 'nutrition'
                ? 'from-green-500 to-emerald-600'
                : colorTheme === 'workout'
                  ? 'from-primary-500 to-indigo-600'
                  : 'from-secondary-500 to-violet-600'
            }`}
          >
            {t('common.output_panel.salva_piano')}
          </button>
        </div>
      )}

      {savedId && (
        <div className={`border-t-2 ${theme.border} ${theme.bg} overflow-x-hidden p-3 sm:p-4`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <Check className={`h-5 w-5 ${theme.icon} flex-shrink-0`} />
              <span className={`text-sm font-semibold ${theme.accent} truncate`}>
                {t('common.output_panel.piano_salvato')}
              </span>
            </div>
            <a
              href={`/${colorTheme === 'nutrition' ? 'nutrition' : 'workout'}/${savedId}`}
              className={`text-sm font-semibold ${theme.accent} flex-shrink-0 whitespace-nowrap underline hover:opacity-80 active:opacity-60`}
            >
              {t('common.output_panel.visualizza')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
