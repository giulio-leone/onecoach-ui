import { useCallback, useState } from 'react';
import type { WorkoutGenerationInput, WorkoutGenerationOutput } from '@onecoach/types';
import {
  type GenerationCallbacks,
  type GenerationStreamEvent,
  type GenerationState,
} from './utils/create-generation-hook';

type WorkoutInput = WorkoutGenerationInput & {
  model?: string;
};

export function useWorkoutGeneration(
  callbacks?: GenerationCallbacks<WorkoutGenerationOutput>
): GenerationState<WorkoutGenerationOutput> & {
  generate: (input: WorkoutInput) => Promise<WorkoutGenerationOutput>;
  generateStream: (input: WorkoutInput) => Promise<WorkoutGenerationOutput | null>;
  reset: () => void;
} {
  const [state, setState] = useState<GenerationState<WorkoutGenerationOutput>>({
    isGenerating: false,
    isStreaming: false,
    progress: 0,
    currentMessage: '',
    error: null,
    result: null,
    streamEvents: [],
    logs: [],
  });

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      isStreaming: false,
      progress: 0,
      currentMessage: '',
      error: null,
      result: null,
      streamEvents: [],
      logs: [],
    });
  }, []);

  const generateStream = useCallback(
    async (input: WorkoutInput): Promise<WorkoutGenerationOutput | null> => {
      // Usa sempre l'endpoint ottimizzato
      const endpoint = '/api/workout/generate-optimized';

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        isStreaming: true,
        progress: 0,
        currentMessage: 'Inizializzazione...',
        error: null,
        result: null,
        streamEvents: [],
      }));

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let result: WorkoutGenerationOutput | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            try {
              const rawEvent = JSON.parse(line.slice(6));

              // Crea GenerationStreamEvent con timestamp e message
              const event = {
                type: rawEvent.type,
                timestamp: new Date(), // Sempre presente
                data: rawEvent.data,
                message:
                  rawEvent.data?.message || rawEvent.data?.description || rawEvent.type || 'Event',
              } as GenerationStreamEvent<WorkoutGenerationOutput> & { type: string };

              setState((prev) => ({
                ...prev,
                streamEvents: [...prev.streamEvents, event],
              }));

              // Handle different event types
              const eventType = event.type as string;
              switch (eventType) {
                case 'agent_progress':
                  setState((prev) => ({
                    ...prev,
                    progress: (event.data as any)?.progress ?? prev.progress,
                    currentMessage: (event.data as any)?.message ?? prev.currentMessage,
                  }));
                  callbacks?.onProgress?.(
                    (event.data as any)?.progress ?? 0,
                    (event.data as any)?.message ?? ''
                  );
                  break;

                case 'agent_start':
                  setState((prev) => ({
                    ...prev,
                    currentMessage:
                      (event.data as any)?.description ??
                      `Starting ${(event.data as any)?.role}...`,
                  }));
                  break;

                case 'agent_complete':
                  // Agent completed, but not the whole generation
                  break;

                case 'agent_error':
                  if (!(event.data as any)?.retrying) {
                    const errorMsg = (event.data as any)?.error?.message || 'Unknown error';
                    setState((prev) => ({
                      ...prev,
                      error: errorMsg,
                    }));
                    callbacks?.onError?.(errorMsg);
                  }
                  break;

                case 'complete':
                  result = (event.data as any)?.output;
                  setState((prev) => ({
                    ...prev,
                    result,
                    progress: 100,
                    currentMessage: 'Completato!',
                  }));
                  callbacks?.onComplete?.(result!);
                  break;

                case 'error':
                  const errMsg =
                    (event.data as any)?.message ||
                    (event.data as any)?.error ||
                    'Generation failed';
                  setState((prev) => ({
                    ...prev,
                    error: errMsg,
                  }));
                  callbacks?.onError?.(errMsg);
                  break;
              }
            } catch {
              // Ignore parse errors for incomplete JSON
            }
          }
        }

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          isStreaming: false,
        }));

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          isStreaming: false,
          error: errorMessage,
        }));
        callbacks?.onError?.(errorMessage);
        return null;
      }
    },
    [callbacks]
  );

  const generate = useCallback(
    async (input: WorkoutInput): Promise<WorkoutGenerationOutput> => {
      const result = await generateStream(input);
      if (!result) {
        throw new Error(state.error || 'Generation failed');
      }
      return result;
    },
    [generateStream, state.error]
  );

  return {
    ...state,
    generate,
    generateStream,
    reset,
  };
}

export type WorkoutGenerationState = GenerationState<WorkoutGenerationOutput>;
export type WorkoutGenerationStreamEvent = GenerationStreamEvent<WorkoutGenerationOutput>;
