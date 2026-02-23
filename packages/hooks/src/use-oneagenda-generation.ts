'use client';

import { useState, useCallback } from 'react';

// Interfaces duplicated to avoid dependency on app-level types
export interface GenerationLogEvent {
  type: string;
  timestamp?: Date | string;
  message?: string;
  data?: unknown;
}

export interface OneAgendaGenerationInput {
  description: string;
  userPreferences?: Record<string, unknown>;
  resumeFromStateId?: string;
}

export interface OneAgendaGenerationResult {
  goals: unknown[];
  tasks: unknown[];
  schedule: unknown;
  qaReport?: unknown;
}

export interface UseOneAgendaGenerationReturn {
  isGenerating: boolean;
  progress: number;
  currentMessage: string;
  logs: GenerationLogEvent[];
  result: OneAgendaGenerationResult | null;
  error: string | null;
  generate: (input: OneAgendaGenerationInput) => Promise<void>;
  reset: () => void;
}

export function useOneAgendaGeneration(): UseOneAgendaGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [logs, setLogs] = useState<GenerationLogEvent[]>([]);
  const [result, setResult] = useState<OneAgendaGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setCurrentMessage('');
    setLogs([]);
    setResult(null);
    setError(null);
  }, []);

  const generate = useCallback(async (input: OneAgendaGenerationInput) => {
    setIsGenerating(true);
    setProgress(0);
    setLogs([]);
    setCurrentMessage('Inizializzazione...');
    setError(null);

    try {
      const response = await fetch('/api/oneagenda/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('API Error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();

      while (true) {
        const { isDone, value } = await reader
          .read()
          .then(({ done, value }) => ({ isDone: done, value }));
        if (isDone) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.substring(6));

              // Map protocol events to state
              if (json.type === 'progress') {
                const pct = json.data?.percentage ?? json.progress ?? 0;
                const msg = json.data?.message ?? json.message ?? '';
                setProgress(pct);
                if (msg) setCurrentMessage(msg);
              } else if (json.type === 'agent_start') {
                setLogs((prev) => [...prev, { ...json, timestamp: new Date() }]);
                setCurrentMessage(json.data?.label || `Avvio ${json.data?.agent}...`);
              } else if (['agent_complete', 'agent_error', 'agent_step'].includes(json.type)) {
                setLogs((prev) => [...prev, { ...json, timestamp: new Date() }]);
              } else if (json.type === 'complete') {
                setResult(json.data?.result || json.data?.plan);
                setProgress(100);
                setCurrentMessage('Completato');
                setIsGenerating(false);
              } else if (json.type === 'error') {
                throw new Error(json.data?.message || 'Errore di generazione');
              }
            } catch (e) {
              console.error('SSE Parse Error', e);
            }
          }
        }
      }
    } catch (e: unknown) {
      console.error('Generation Error', e);
      setError(e instanceof Error ? e.message : 'Errore di connessione');
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    progress,
    currentMessage,
    logs,
    result,
    error,
    generate,
    reset,
  };
}
