'use client';

import { useTranslations } from 'next-intl';
/**
 * ProgressDisplay Component
 *
 * Componente moderno per visualizzare il progresso della generazione
 * Design user-friendly con animazioni fluide
 */

import { ProgressRing } from '@giulio-leone/ui';

import { Loader2, Sparkles } from 'lucide-react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { animations } from '@giulio-leone/lib-design-system/animations';

export interface ProgressDisplayProps {
  progress: number;
  currentMessage: string;
  isStreaming?: boolean;
  className?: string;
}

/**
 * Converte messaggi tecnici in messaggi user-friendly
 */
function getUserFriendlyMessage(message: string): string {
  // Rimuove emoji e formatta il messaggio
  const cleaned = message.replace(/[🚀✅📤❌🔄✓🎉]/g, '').trim();

  // Mapping di messaggi comuni
  const messageMap: Record<string, string> = {
    starting: 'Inizio generazione...',
    'calculate target calories': 'Calcolo calorie e macronutrienti',
    'select optimal foods': 'Selezione alimenti ottimali',
    'planning meals': 'Pianificazione pasti',
    optimizing: 'Ottimizzazione piano',
    validation: 'Validazione piano',
    complete: 'Completato',
  };

  const lowerMessage = cleaned.toLowerCase();
  for (const [key, value] of Object.entries(messageMap)) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }

  // Se non trovato, restituisce il messaggio pulito
  return cleaned || 'Generazione in corso...';
}

export function ProgressDisplay({
  progress,
  currentMessage,
  isStreaming = false,
  className = '',
}: ProgressDisplayProps) {
  const t = useTranslations('common');
  const userFriendlyMessage = getUserFriendlyMessage(currentMessage);
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 shadow-lg backdrop-blur-sm',
        darkModeClasses.card.elevated,
        animations.fadeIn,
        className
      )}
    >
      <div className="flex items-center gap-6">
        {/* Progress Ring */}
        <div className="relative flex-shrink-0">
          <ProgressRing
            percentage={clampedProgress}
            size={100}
            strokeWidth={10}
            color="green-600"
            backgroundColor="neutral-200"
            showPercentage={true}
          />
          {isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>

        {/* Message and Progress Bar */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            {isStreaming ? (
              <Sparkles className="h-5 w-5 animate-pulse text-green-600 dark:text-green-400" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-green-500" />
            )}
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {userFriendlyMessage}
            </h3>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600',
                'transition-all duration-500 ease-out',
                'shadow-lg shadow-green-500/50'
              )}
              style={{ width: `${clampedProgress}%` }}
            >
              {/* Shimmer effect */}
              {isStreaming && (
                <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              )}
            </div>
          </div>

          {/* Percentage Text */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">
              {t('common.progress_display.progresso')}
              {Math.round(clampedProgress)}%
            </span>
            {isStreaming && (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                {t('common.progress_display.in_elaborazione')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
