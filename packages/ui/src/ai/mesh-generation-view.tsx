'use client';

import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button, Card } from '@giulio-leone/ui';
import { GenerationLog, type GenerationLogEvent } from '@/components/domain/ai-elements/generation-log';
import { GenerationSuccess } from '@/components/domain/ai-elements/generation-success';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface MeshGenerationViewProps {
  status: 'idle' | 'generating' | 'success' | 'error';
  progress: number;
  currentMessage: string;
  logs: GenerationLogEvent[];
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
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export function MeshGenerationView({
  status,
  progress,
  currentMessage,
  logs,
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
}: MeshGenerationViewProps) {
  const t = useTranslations('common');

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

  // GENERATING / IDLE STATE
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
              {status === 'generating' && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {currentMessage || (status === 'idle' ? 'Pronto' : 'Elaborazione...')}
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
          isGenerating={status === 'generating'}
          className="border-0 bg-transparent shadow-none"
        />
      </Card>
    </div>
  );
}
