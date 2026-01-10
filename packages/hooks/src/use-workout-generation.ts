import { useCallback, useState } from 'react';
import {
  type GenerationCallbacks,
  type GenerationStreamEvent,
  type GenerationState,
} from './utils/create-generation-hook';
import type { WorkoutGenerationInput, WorkoutGenerationOutput } from "@onecoach/types-ai";

type WorkoutInput = WorkoutGenerationInput & {
  model?: string;
  resumeFromStateId?: string;
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

              // Standardize event for internal state
              const eventType = rawEvent.type;
              const eventData = rawEvent.data;
              
              // Map to GenerationStreamEvent
              const event = {
                type: eventType,
                timestamp: rawEvent.timestamp ? new Date(rawEvent.timestamp) : new Date(),
                data: eventData,
                message: 
                  eventData?.message || 
                  eventData?.label || 
                  eventData?.description || 
                  rawEvent.message || 
                  eventType,
              } as GenerationStreamEvent<WorkoutGenerationOutput> & { type: string };

              setState((prev) => ({
                ...prev,
                streamEvents: [...prev.streamEvents, event],
              }));

              // Handle standard events
              switch (eventType) {
                case 'progress':
                case 'agent_progress':
                  const progressVal = eventData?.percentage ?? eventData?.progress ?? 0;
                  const messageVal = eventData?.message ?? '';
                  
                  setState((prev) => ({
                    ...prev,
                    progress: progressVal,
                    currentMessage: messageVal || prev.currentMessage,
                  }));
                  callbacks?.onProgress?.(progressVal, messageVal);
                  break;

                case 'agent_start':
                  setState((prev) => ({
                    ...prev,
                    currentMessage: eventData?.label || eventData?.description || `Starting ${eventData?.agent || eventData?.role}...`,
                  }));
                  break;

                case 'agent_error':
                  if (!eventData?.recoverable && !eventData?.retrying) {
                    const errorMsg = eventData?.error || 'Unknown error';
                    setState((prev) => ({
                      ...prev,
                      error: errorMsg,
                    }));
                    callbacks?.onError?.(errorMsg);
                  }
                  break;

                case 'complete':
                  result = eventData?.result || eventData?.output;
                  setState((prev) => ({
                    ...prev,
                    result,
                    progress: 100,
                    currentMessage: 'Completato!',
                  }));
                  callbacks?.onComplete?.(result!);
                  break;

                case 'error':
                  const errMsg = eventData?.message || 'Generation failed';
                  setState((prev) => ({
                    ...prev,
                    error: errMsg,
                  }));
                  callbacks?.onError?.(errMsg);
                  break;
              }
            } catch {
              // Ignore parse errors
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