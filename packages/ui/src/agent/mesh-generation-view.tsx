'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../button';
import { Card } from '../card';
import { GenerationLog, type GenerationLogEvent } from '@giulio-leone/ui/ai';
import { GenerationSuccess } from '@giulio-leone/ui/ai';
import { AgentEventList, useAdminMode, type ProgressField } from '@giulio-leone/one-agent/hooks';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface MeshGenerationViewProps {
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  currentMessage: string;
  /** Legacy logs format (GenerationLogEvent[]) */
  logs: GenerationLogEvent[];
  /** SDK 4.1 streaming events (ProgressField[]) - preferred */
  events?: ProgressField[];
  error?: string | null;
  result?: unknown;

  // Success Configuration
  successTitle?: string;
  successMessage?: string;
  successStats?: Array<{ label: string; value: string | number }>;
  successActionLabel?: string;

  // Actions
  onReset?: () => void;
  onSuccessAction?: () => void;

  // Customization
  title?: string;
  description?: string;
  className?: string;
  /** Icon to show in the progress ring (default: Sparkles) */
  progressIcon?: React.ReactNode;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export function MeshGenerationView({
  status,
  progress,
  currentMessage,
  logs,
  events = [],
  error,
  successTitle = 'Generazione Completata',
  successMessage = 'Il processo è stato completato con successo.',
  successStats = [],
  successActionLabel = 'Continua',
  onReset,
  onSuccessAction,
  title = 'AI Mesh Orchestrator',
  description = 'Coordinamento agenti specializzati...',
  className,
  progressIcon,
}: MeshGenerationViewProps) {
  const t = useTranslations('common');
  const { isAdmin, toggle: toggleAdminMode } = useAdminMode();

  // Use SDK 4.1 events if available, fallback to legacy logs
  const hasV41Events = events.length > 0;

  // SUCCESS STATE
  if (status === 'success') {
    return (
      <div className={className}>
        <GenerationSuccess
          title={successTitle}
          message={successMessage}
          stats={successStats}
          onReset={onReset || (() => window.location.reload())}
          onAction={onSuccessAction || (() => {})}
          actionLabel={successActionLabel}
        />
      </div>
    );
  }

  // ERROR STATE
  if (status === 'error') {
    return (
      <div className={className}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
            {t('common.mesh_generation_view.qualcosa_e_andato_storto')}
          </h3>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            {error || 'Si è verificato un errore sconosciuto durante la generazione.'}
          </p>
          <Button variant="outline" onClick={onReset}>
            Riprova
          </Button>
        </motion.div>
      </div>
    );
  }

  // GENERATING STATE - SDK 4.1 Modern View (like OneFlight)
  if (hasV41Events || status === 'generating') {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center gap-6 py-8">
          {/* Animated progress ring with icon */}
          <div className="relative">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-blue-500/20 dark:text-blue-400/20"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progress) / 100}
                className="text-blue-500 transition-all duration-300 ease-out dark:text-blue-400"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {progressIcon || (
                <Sparkles className="h-10 w-10 animate-pulse text-blue-500 dark:text-blue-400" />
              )}
            </div>
          </div>

          {/* Progress percentage */}
          <div className="text-center">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(progress)}%
            </span>
          </div>

          {/* User message */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              {currentMessage || 'Elaborazione in corso...'}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          </div>

          {/* Streaming events timeline (SDK 4.1) */}
          {hasV41Events && (
            <div className="w-full max-w-md">
              <AgentEventList
                events={events}
                isAdmin={isAdmin}
                onToggleAdmin={toggleAdminMode}
                maxVisible={5}
                compact
              />
            </div>
          )}

          {/* Fallback: Legacy logs (if no v4.1 events) */}
          {!hasV41Events && logs.length > 0 && (
            <Card
              variant="glass"
              glassIntensity="heavy"
              className="w-full max-w-2xl overflow-hidden border-white/20 p-4 dark:border-white/10"
            >
              <GenerationLog
                title={title}
                description={description}
                events={logs}
                isGenerating={status === 'generating'}
                className="border-0 bg-transparent shadow-none"
              />
            </Card>
          )}
        </div>
      </div>
    );
  }

  // IDLE STATE (fallback)
  return (
    <div className={className}>
      <Card
        variant="glass"
        glassIntensity="heavy"
        className="overflow-hidden border-white/20 p-4 sm:p-6 dark:border-white/10"
      >
        {/* Progress Section */}
        <div className="mb-8 space-y-3">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {currentMessage || 'Pronto'}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100/50 dark:bg-neutral-800/50">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Logs Section - Using "ghost" variant to blend in */}
        <GenerationLog
          title={title}
          description={description}
          events={logs}
          isGenerating={false}
          className="border-0 bg-transparent shadow-none"
        />
      </Card>
    </div>
  );
}
