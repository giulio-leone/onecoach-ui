'use client';

import { useTranslations } from 'next-intl';
/**
 * AI Generation Modal - Componente Generico
 *
 * Componente modale generico per generazione AI con streaming.
 * Supporta configurazione personalizzata per diversi tipi di generazione.
 *
 * Principi: KISS, SOLID (Open/Closed), DRY
 */
import { useState, useEffect, type ReactNode } from 'react';
import {
  AIGenerationView,
  Button,
  Modal,
  ModalFooter,
  Checkbox,
  type AIGenerationLog,
} from '@giulio-leone/ui';
import { Brain, X } from 'lucide-react';
export interface GenerationHookState<TOutput> {
  isGenerating: boolean;
  isStreaming: boolean;
  progress: number;
  currentMessage: string;
  error: string | null;
  result: TOutput | null;
  streamEvents: Array<{
    type: string;
    timestamp: Date;
    data: unknown;
    message: string;
  }>;
  generateStream: (input: unknown) => Promise<TOutput | null>;
  reset: () => void;
}
export interface OptionConfig {
  key: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
export interface AiGenerationModalProps<TOutput> {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void | Promise<void>;
  title: string;
  description: string;
  placeholder: string;
  useGenerationHook: () => GenerationHookState<TOutput>;
  options?: OptionConfig[];
  buildSuccessMessage: (result: TOutput) => string;
  buildResultDisplay?: (result: TOutput) => ReactNode;
}
export function AiGenerationModal<TOutput>({
  isOpen,
  onClose,
  onSuccess: _onSuccess,
  title,
  description,
  placeholder,
  useGenerationHook,
  options = [],
  buildSuccessMessage,
  buildResultDisplay: _buildResultDisplay,
}: AiGenerationModalProps<TOutput>) {
  const t = useTranslations('admin');

  const [prompt, setPrompt] = useState('');
  const {
    isGenerating,
    isStreaming,
    progress,
    error,
    result,
    streamEvents,
    generateStream,
    reset,
  } = useGenerationHook();
  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setPrompt('');
    }
  }, [isOpen, reset]);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();
    try {
      // Build input from prompt and options
      const input: Record<string, unknown> = { prompt };
      for (const option of options) {
        input[option.key] = option.checked;
      }
      await generateStream(input);
    } catch (_err: unknown) {
      // Error handled by UI
    }
  };
  const hasStarted = isStreaming || isGenerating || result || error;
  // Map logs
  const logs: AIGenerationLog[] = streamEvents.map((event) => ({
    timestamp: event.timestamp,
    message: event.message,
    type: 'info', // Generic mapping, can be improved if event has type info
  }));
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      {!hasStarted ? (
        <>
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-500">{description}</p>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Prompt
              </label>
              <textarea
                className="h-44 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none dark:border-neutral-600 dark:text-neutral-200"
                placeholder={placeholder}
                value={prompt}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setPrompt(event.target.value)
                }
                required
                minLength={10}
              />
            </div>
            {options.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400">
                {options.map((option) => (
                  <Checkbox
                    key={option.key}
                    label={option.label}
                    checked={option.checked}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      option.onChange(event.target.checked)
                    }
                  />
                ))}
              </div>
            )}
            <ModalFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Chiudi
              </Button>
              <Button type="submit" disabled={prompt.trim().length < 10}>
                <Brain className="mr-2 h-4 w-4" />
                {t('admin.ai_generation_modal.genera_con_ai')}
              </Button>
            </ModalFooter>
          </form>
        </>
      ) : (
        <div className="py-4">
          <AIGenerationView
            title={title}
            subtitle="Generazione in corso..."
            progress={progress}
            logs={logs}
            isGenerating={isGenerating || isStreaming}
            isSuccess={!!result}
            error={error}
            successTitle="Generazione Completata"
            successMessage={result ? buildSuccessMessage(result) : 'Operazione conclusa.'}
            onSuccessAction={onClose}
            successActionLabel="Chiudi"
            onRetry={reset}
          />
        </div>
      )}
    </Modal>
  );
}
